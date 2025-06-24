import { RowDataPacket } from "mysql2";

export interface Album extends RowDataPacket {
    id: number;
    title: string;
    release_year: number | null;
    created_at: string;
}
