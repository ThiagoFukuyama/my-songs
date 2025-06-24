import { Router } from "express";
import { db } from "../db/index";
import { User } from "../models/User";

const router = Router();

// GET /users - list all users
router.get("/", async (_req, res) => {
    try {
        const [rows] = await db.query<User[]>("SELECT * FROM users");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// GET /users/:id - get user by id
router.get("/:id", async (req, res): Promise<void> => {
    try {
        const [rows] = await db.query<User[]>(
            "SELECT * FROM users WHERE id = ?",
            [req.params.id]
        );
        const user = rows[0];
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

// POST /users - create a new user
router.post("/", async (req, res): Promise<void> => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ error: "Missing fields" });
        return;
    }

    try {
        const [result] = await db.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, password]
        );
        res.status(201).json({ id: (result as any).insertId });
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(409).json({ error: "Email already exists" });
        } else {
            res.status(500).json({ error: "Database error" });
        }
    }
});

// PUT /users/:id - update user
router.put("/:id", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        await db.query(
            "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?",
            [name, email, password, req.params.id]
        );
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

// DELETE /users/:id - delete user
router.delete("/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

export default router;
