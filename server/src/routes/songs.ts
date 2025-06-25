import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { db } from "../db/index";
import { upload, renameTempFile } from "../services/upload";
import { RowDataPacket } from "mysql2";

const router = Router();
const songsDir = path.resolve("songs");

router.get("/", async (req, res): Promise<any> => {
    const userId = Number(req.query.userId);

    try {
        const [rows] = await db.query<RowDataPacket[]>(
            `
            SELECT 
                s.*,
                a.title AS album_title,
                a.release_year AS album_release_year,
                EXISTS (
                    SELECT 1 FROM favorites f 
                    WHERE f.song_id = s.id AND f.user_id = ?
                ) AS isFavorited
            FROM songs s
            LEFT JOIN albums a ON s.album_id = a.id
            ORDER BY created_at DESC
            `,
            [userId || 0]
        );

        const result = rows.map((song: any) => ({
            ...song,
            isFavorited: Boolean(song.isFavorited),
            album_release_year: song.album_release_year ?? null,
            album_title: song.album_title ?? null,
        }));

        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch songs" });
    }
});

router.get("/:id", async (req, res): Promise<any> => {
    const id = Number(req.params.id);
    const userId = Number(req.query.userId) || 0;

    try {
        const [rows] = await db.query<RowDataPacket[]>(
            `
            SELECT 
                s.*,
                a.title AS album_title,
                a.release_year AS album_release_year,
                EXISTS (
                    SELECT 1 FROM favorites f 
                    WHERE f.song_id = s.id AND f.user_id = ?
                ) AS isFavorited
            FROM songs s
            LEFT JOIN albums a ON s.album_id = a.id
            WHERE s.id = ?
            `,
            [userId, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Song not found" });
        }

        const song = rows[0];
        return res.status(200).json({
            ...song,
            isFavorited: Boolean(song.isFavorited),
            album_title: song.album_title ?? null,
            album_release_year: song.album_release_year ?? null,
        });
    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch song" });
    }
});

router.post("/", upload.single("file"), async (req, res): Promise<any> => {
    const { title, artist, duration, album_id } = req.body;

    try {
        const [result] = await db.query(
            "INSERT INTO songs (title, artist, duration, album_id) VALUES (?, ?, ?, ?)",
            [title, artist, duration, album_id || null]
        );

        const id = (result as any).insertId;

        if (req.file) {
            const ext = path.extname(req.file.originalname);
            const newName = `${id}${ext}`;
            await renameTempFile(req.file.filename, newName);
        }

        return res.status(201).json({ id });
    } catch {
        return res.status(500).json({ error: "Failed to create song" });
    }
});

router.put("/:id", upload.single("file"), async (req, res): Promise<any> => {
    const { title, artist, duration, album_id } = req.body;

    try {
        await db.query(
            "UPDATE songs SET title = ?, artist = ?, duration = ?, album_id = ? WHERE id = ?",
            [title, artist, duration, album_id || null, req.params.id]
        );

        if (req.file) {
            const ext = path.extname(req.file.originalname);
            const newName = `${req.params.id}${ext}`;
            await renameTempFile(req.file.filename, newName);
        }

        return res.sendStatus(204);
    } catch {
        return res.status(500).json({ error: "Failed to update song" });
    }
});

router.delete("/:id", async (req, res): Promise<any> => {
    const songId = req.params.id;

    try {
        // 1. Deletar favoritos relacionados
        await db.query("DELETE FROM favorites WHERE song_id = ?", [songId]);

        // 2. Deletar a música
        await db.query("DELETE FROM songs WHERE id = ?", [songId]);

        // 3. Deletar arquivos físicos, se houver
        const files = await fs.readdir(songsDir);
        for (const file of files) {
            if (file.startsWith(songId)) {
                await fs.unlink(path.join(songsDir, file));
            }
        }

        return res.sendStatus(204);
    } catch (error) {
        return res
            .status(500)
            .json({ error: "Failed to delete song and related data" });
    }
});

export default router;
