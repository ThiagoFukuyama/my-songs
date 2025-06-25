import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Album {
    id: number;
    title: string;
    release_year: number | null;
    created_at: string;
}

export default function ManageAlbums() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchAlbums() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/albums");
                if (!res.ok) throw new Error("Failed to fetch albums");
                const data: Album[] = await res.json();
                setAlbums(data);
            } catch (err: any) {
                setError(err.message || "Error fetching albums");
            } finally {
                setLoading(false);
            }
        }
        fetchAlbums();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Deseja realmente excluir este álbum?")) return;

        try {
            const res = await fetch(`/api/albums/${id}`, { method: "DELETE" });
            if (res.status === 204) {
                setAlbums((old) => old.filter((album) => album.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || "Erro ao excluir álbum.");
            }
        } catch {
            alert("Erro na comunicação com o servidor.");
        }
    };

    if (loading) return <div>Loading albums...</div>;
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
                <h1 className="mb-2">💽 Albums</h1>
                <button
                    title="Adicionar novo álbum"
                    style={{
                        backgroundColor: "transparent",
                        border: 0,
                        padding: "1em",
                        fontSize: "1.25rem",
                    }}
                    aria-label="Add new album"
                    onClick={() => navigate("/album/0?action=insert")}
                >
                    ➕
                </button>
            </div>

            {albums.length === 0 ? (
                <p>Nenhum álbum encontrado.</p>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Release Year</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {albums.map((album) => (
                                <tr key={album.id}>
                                    <td>
                                        <strong>{album.title}</strong>
                                    </td>
                                    <td>{album.release_year ?? "-"}</td>
                                    <td>
                                        {new Date(
                                            album.created_at
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
                                                    `/album/${album.id}?action=edit`
                                                )
                                            }
                                            title="Editar álbum"
                                            aria-label={`Edit album ${album.title}`}
                                        >
                                            📝
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(album.id)
                                            }
                                            title="Excluir álbum"
                                            aria-label={`Delete album ${album.title}`}
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
