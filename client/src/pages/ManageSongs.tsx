import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Song {
    id: number;
    title: string;
    artist: string;
    album_id: number | null;
    album_title: string | null;
    duration: string | null;
    created_at: string;
}

export default function ManageSongs() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchSongs() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/songs");
                if (!res.ok) throw new Error("Failed to fetch songs");
                const data: Song[] = await res.json();
                setSongs(data);
            } catch (err: any) {
                setError(err.message || "Error fetching songs");
            } finally {
                setLoading(false);
            }
        }
        fetchSongs();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Deseja realmente excluir esta música?")) return;

        try {
            const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
            if (res.status === 204) {
                setSongs((old) => old.filter((song) => song.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || "Erro ao excluir música.");
            }
        } catch {
            alert("Erro na comunicação com o servidor.");
        }
    };

    if (loading) return <div>Loading songs...</div>;
    if (error) return <div className="text-red">{error}</div>;

    return (
        <div className="container-lg mb-7">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h1 className="mb-2">🎵 Songs</h1>
                <button
                    title="Adicionar nova música"
                    style={{
                        backgroundColor: "transparent",
                        border: 0,
                        padding: "1em",
                        fontSize: "1.25rem",
                        cursor: "pointer",
                    }}
                    aria-label="Add new song"
                    onClick={() => navigate("/song/0?action=insert")}
                >
                    ➕
                </button>
            </div>

            {songs.length === 0 ? (
                <p>Nenhuma música encontrada.</p>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Artist</th>
                                <th>Album</th>
                                <th>Duration</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {songs.map((song) => (
                                <tr key={song.id}>
                                    <td>
                                        <strong>{song.title}</strong>
                                    </td>
                                    <td>{song.artist}</td>
                                    <td>{song.album_title ?? "-"}</td>
                                    <td>{song.duration ?? "-"}</td>
                                    <td>
                                        {new Date(
                                            song.created_at
                                        ).toLocaleDateString()}
                                    </td>
                                    <td
                                        style={{
                                            display: "flex",
                                            gap: "0.5rem",
                                        }}
                                    >
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/song/${song.id}?action=edit`
                                                )
                                            }
                                            title="Editar música"
                                            aria-label={`Edit song ${song.title}`}
                                        >
                                            📝
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(song.id)
                                            }
                                            title="Excluir música"
                                            aria-label={`Delete song ${song.title}`}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
