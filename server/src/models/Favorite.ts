import { RowDataPacket } from "mysql2";

export interface Favorite extends RowDataPacket {
    id: number;
    user_id: number;
    song_id: number;
    created_at: string;
}
