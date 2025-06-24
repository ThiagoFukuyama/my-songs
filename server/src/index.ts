import fs from "fs";
import path from "path";
import cors from "cors";
import express from "express";

import usersRouter from "./routes/users";
import songsRouter from "./routes/songs";
import albumsRouter from "./routes/albums";
import favoritesRouter from "./routes/favorites";

const app = express();
const PORT = process.env.PORT || 3000;

const songsDir = path.resolve("songs");
if (!fs.existsSync(songsDir)) {
    fs.mkdirSync(songsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

app.use("/users", usersRouter);
app.use("/songs", songsRouter);
app.use("/albums", albumsRouter);
app.use("/favorites", favoritesRouter);

app.get("/", (_req, res) => {
    res.send("API is running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
