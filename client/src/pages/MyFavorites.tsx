import { useEffect, useState } from "react";
import { useMe } from "../context/MeContext";

interface Favorite {
    favorite_id: number;
    favorited_at: string;
    song_id: number;
    song_title: string;
    artist: string;
    album_id: number | null;
    duration: string | null;
    song_created_at: string;
    album_title: string | null;
    release_year: number | null;
}

export default function MyFavorites() {
    const { user } = useMe();
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        async function fetchFavorites() {
            try {
                const res = await fetch(`/api/favorites/${user?.id}`);
                if (!res.ok) throw new Error("Failed to fetch favorites");
                const data = await res.json();
                setFavorites(data);
            } catch (err: any) {
                setError(err.message || "Error fetching favorites");
            } finally {
                setLoading(false);
            }
        }

        fetchFavorites();
    }, [user]);

    const handleUnfavorite = async (favoriteId: number) => {
        try {
            const res = await fetch(`/api/favorites/${favoriteId}`, {
                method: "DELETE",
            });

            if (res.status === 204) {
                setFavorites((old) =>
                    old.filter((fav) => fav.favorite_id !== favoriteId)
                );
            } else {
                alert("Erro ao desfavoritar a música.");
            }
        } catch {
            alert("Erro na comunicação com o servidor.");
        }
    };

    if (!user) return <div>Você precisa estar logado.</div>;
    if (loading) return <div>Loading favorites...</div>;
    if (error) return <div className="text-red">{error}</div>;

    return (
        <div className="container-lg mb-7">
            <h1 className="mb-2">
                <span role="img" aria-label="heart">
                    ❤️
                </span>{" "}
                Favorites
            </h1>

            {favorites.length === 0 ? (
                <p>No favorited songs yet.</p>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Artist</th>
                                <th>Album</th>
                                <th>Duration</th>
                                <th>Favorited At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {favorites.map((fav) => (
                                <tr key={fav.favorite_id}>
                                    <td>
                                        <strong>{fav.song_title}</strong>
                                    </td>
                                    <td>{fav.artist}</td>
                                    <td>
                                        {fav.album_title
                                            ? `${fav.album_title} (${
                                                  fav.release_year ?? "?"
                                              })`
                                            : "-"}
                                    </td>
                                    <td>{fav.duration ?? "-"}</td>
                                    <td>
                                        {new Date(
                                            fav.favorited_at
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
                                                alert(
                                                    `Playing: ${fav.song_title}`
                                                )
                                            }
                                            aria-label={`Play ${fav.song_title}`}
                                            title="Play"
                                        >
                                            ▶️
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleUnfavorite(
                                                    fav.favorite_id
                                                )
                                            }
                                            aria-label={`Unfavorite ${fav.song_title}`}
                                            title="Unfavorite"
                                        >
                                            ❤️
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
