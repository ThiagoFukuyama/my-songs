import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { db } from "../db/index";
import { Song } from "../models/Song";
import { upload, renameTempFile } from "../services/upload";

const router = Router();
const songsDir = path.resolve("songs");

router.get("/", async (_req, res): Promise<any> => {
    try {
        const [rows] = await db.query("SELECT * FROM songs");
        return res.json(rows);
    } catch {
        return res.status(500).json({ error: "Failed to fetch songs" });
    }
});

router.get("/:id", async (req, res): Promise<any> => {
    try {
        const [rows] = await db.query<Song[]>(
            "SELECT * FROM songs WHERE id = ?",
            [req.params.id]
        );
        return res.json(rows[0] || {});
    } catch {
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
    try {
        await db.query("DELETE FROM songs WHERE id = ?", [req.params.id]);

        const files = await fs.readdir(songsDir);
        for (const file of files) {
            if (file.startsWith(req.params.id)) {
                await fs.unlink(path.join(songsDir, file));
            }
        }

        return res.sendStatus(204);
    } catch {
        return res.status(500).json({ error: "Failed to delete song" });
    }
});

export default router;
