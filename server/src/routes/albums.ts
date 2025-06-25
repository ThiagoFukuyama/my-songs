import { Router, Request, Response } from "express";
import { db } from "../db/index";
import { Album } from "../models/Album";

const router = Router();

// GET /albums - list all albums
router.get("/", async (_req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await db.query<Album[]>(
            "SELECT * FROM albums ORDER BY created_at DESC"
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch albums" });
    }
});

// GET /albums/:id - get album by ID
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await db.query<Album[]>(
            "SELECT * FROM albums WHERE id = ?",
            [req.params.id]
        );
        const album = rows[0];
        if (!album) {
            res.status(404).json({ error: "Album not found" });
            return;
        }
        res.json(album);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch album" });
    }
});

// POST /albums - create a new album
router.post("/", async (req: Request, res: Response): Promise<void> => {
    const { title, release_year } = req.body;

    if (!title) {
        res.status(400).json({ error: "Missing title" });
        return;
    }

    try {
        const [result] = await db.query(
            "INSERT INTO albums (title, release_year) VALUES (?, ?)",
            [title, release_year ?? null]
        );
        res.status(201).json({ id: (result as any).insertId });
    } catch (error) {
        res.status(500).json({ error: "Failed to create album" });
    }
});

// PUT /albums/:id - update album
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
    const { title, release_year } = req.body;

    if (!title) {
        res.status(400).json({ error: "Missing title" });
        return;
    }

    try {
        await db.query(
            "UPDATE albums SET title = ?, release_year = ? WHERE id = ?",
            [title, release_year ?? null, req.params.id]
        );
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: "Failed to update album" });
    }
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    const albumId = req.params.id;
    try {
        // Deletar músicas relacionadas ao álbum
        await db.query("DELETE FROM songs WHERE album_id = ?", [albumId]);

        // Deletar o álbum
        await db.query("DELETE FROM albums WHERE id = ?", [albumId]);

        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete album and related songs",
        });
    }
});

export default router;
