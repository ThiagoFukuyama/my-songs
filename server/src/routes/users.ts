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

// POST /users - create a new user (ajustado para checar duplicidade de name e email)
router.post("/", async (req, res): Promise<void> => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ error: "Missing fields" });
        return;
    }

    try {
        // Checa se já existe name ou email
        const [existing] = await db.query<User[]>(
            "SELECT * FROM users WHERE name = ? OR email = ?",
            [name, email]
        );

        if (existing.length > 0) {
            // Descobre qual campo está duplicado
            const nameExists = existing.some((u) => u.name === name);
            const emailExists = existing.some((u) => u.email === email);

            if (nameExists && emailExists) {
                res.status(409).json({
                    error: "Username and email already exist",
                });
            } else if (nameExists) {
                res.status(409).json({ error: "Username already exists" });
            } else {
                res.status(409).json({ error: "Email already exists" });
            }
            return;
        }

        const [result] = await db.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, password]
        );
        res.status(201).json({ id: (result as any).insertId });
    } catch (err: any) {
        res.status(500).json({ error: "Database error" });
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

// POST /users/login - login simples, verifica email e senha
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: "Missing username or password" });
        return;
    }

    try {
        const [rows] = await db.query<User[]>(
            "SELECT * FROM users WHERE name = ? AND password = ?",
            [username, password]
        );

        if (rows.length === 0) {
            res.status(401).json({ error: "Invalid username or password" });
            return;
        }

        const user = rows[0];
        // Retorna dados do usuário sem senha
        const { password: _, ...userWithoutPassword } = user;

        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: "Failed to login" });
    }
});

export default router;
