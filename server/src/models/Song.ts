import { RowDataPacket } from "mysql2";

export interface Song extends RowDataPacket {
    id: number;
    title: string;
    artist: string;
    album_id: number | null;
    duration: string | null;
    created_at: string;
}
