import multer from "multer";
import path from "path";
import fs from "fs/promises";

const songsDir = path.resolve("songs");

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, songsDir);
    },
    filename: (_req, file, cb) => {
        cb(null, "temp_" + Date.now() + path.extname(file.originalname));
    },
});

export const upload = multer({ storage });

export async function renameTempFile(
    tempName: string,
    newName: string
): Promise<void> {
    const oldPath = path.join(songsDir, tempName);
    const newPath = path.join(songsDir, newName);
    await fs.rename(oldPath, newPath);
}
