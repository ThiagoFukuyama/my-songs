import mysql from "mysql2/promise";

export const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "my_songs",
    port: 3306,
});
