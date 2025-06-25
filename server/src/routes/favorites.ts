import { Router, Request, Response } from "express";
import { db } from "../db/index";
import { Favorite } from "../models/Favorite";

const router = Router();

router.get("/:userId", async (req: Request, res: Response): Promise<void> => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid userId parameter" });
        return;
    }

    try {
        const [rows] = await db.query(
            `
            SELECT 
                favorites.id AS favorite_id,
                favorites.created_at AS favorited_at,
                songs.id AS song_id,
                songs.title AS song_title,
                songs.artist,
                songs.album_id,
                songs.duration,
                songs.created_at AS song_created_at,
                albums.title AS album_title,
                albums.release_year
            FROM favorites
            JOIN songs ON favorites.song_id = songs.id
            LEFT JOIN albums ON songs.album_id = albums.id
            WHERE favorites.user_id = ?
            ORDER BY favorites.created_at DESC
            `,
            [userId]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
});

// GET /favorites/:id - get favorite by id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await db.query<Favorite[]>(
            "SELECT * FROM favorites WHERE id = ?",
            [req.params.id]
        );
        const favorite = rows[0];
        if (!favorite) {
            res.status(404).json({ error: "Favorite not found" });
            return;
        }
        res.json(favorite);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch favorite" });
    }
});

// POST /favorites - create new favorite
router.post("/", async (req: Request, res: Response): Promise<void> => {
    const { user_id, song_id } = req.body;

    if (!user_id || !song_id) {
        res.status(400).json({ error: "Missing user_id or song_id" });
        return;
    }

    try {
        const [result] = await db.query(
            "INSERT INTO favorites (user_id, song_id) VALUES (?, ?)",
            [user_id, song_id]
        );
        res.status(201).json({ id: (result as any).insertId });
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(409).json({ error: "Favorite already exists" });
        } else {
            res.status(500).json({ error: "Database error" });
        }
    }
});

// DELETE /favorites/:id - delete favorite
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        await db.query("DELETE FROM favorites WHERE id = ?", [req.params.id]);
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: "Failed to delete favorite" });
    }
});

export default router;
