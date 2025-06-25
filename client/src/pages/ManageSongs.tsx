import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import { useMe } from "../context/MeContext"; // importando seu contexto de usuário

interface Song {
    id: number;
    title: string;
    artist: string;
    album_id: number | null;
    album_title: string | null;
    duration: string | null;
    created_at: string;
    isFavorited?: boolean;
    favoriteId?: number;
}

export default function ManageSongs() {
    const { user } = useMe(); // pegando usuário logado
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [favoritedSongs, setFavoritedSongs] = useState<
        Record<number, { favoriteId?: number }>
    >({});
    const navigate = useNavigate();

    const { setSong, play, pause, isPlaying, currentSongId } = useAudioPlayer();

    useEffect(() => {
        async function fetchSongs() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/songs");
                if (!res.ok) throw new Error("Failed to fetch songs");
                const data: Song[] = await res.json();

                setSongs(data);

                // Preenche favoritedSongs baseado no retorno, se tiver isFavorited/favoriteId
                const favs: Record<number, { favoriteId?: number }> = {};
                data.forEach((song) => {
                    if (song.isFavorited) {
                        favs[song.id] = { favoriteId: song.favoriteId };
                    }
                });
                setFavoritedSongs(favs);
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
                setFavoritedSongs((old) => {
                    const copy = { ...old };
                    delete copy[id];
                    return copy;
                });
            } else {
                const data = await res.json();
                alert(data.error || "Erro ao excluir música.");
            }
        } catch {
            alert("Erro na comunicação com o servidor.");
        }
    };

    async function handleFavoriteToggle(song: Song) {
        if (!user) {
            alert("Você precisa estar logado para favoritar uma música.");
            return;
        }

        const isFavorited = !!favoritedSongs[song.id];
        const favoriteId = favoritedSongs[song.id]?.favoriteId;

        if (isFavorited) {
            if (!favoriteId) {
                alert("Erro: favorito não encontrado.");
                return;
            }
            try {
                const res = await fetch(`/api/favorites/${favoriteId}`, {
                    method: "DELETE",
                });
                if (res.status === 204) {
                    setFavoritedSongs((old) => {
                        const copy = { ...old };
                        delete copy[song.id];
                        return copy;
                    });
                } else {
                    alert("Erro ao desfavoritar a música.");
                }
            } catch {
                alert("Erro na comunicação com o servidor.");
            }
        } else {
            try {
                const res = await fetch("/api/favorites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: user.id, // envia o user_id conforme sua API
                        song_id: song.id,
                    }),
                });

                if (res.status === 201) {
                    const data = await res.json();
                    setFavoritedSongs((old) => ({
                        ...old,
                        [song.id]: { favoriteId: data.id },
                    }));
                } else if (res.status === 409) {
                    alert("Essa música já está nos favoritos.");
                } else {
                    const data = await res.json();
                    alert(data.error || "Erro ao favoritar.");
                }
            } catch {
                alert("Erro na comunicação com o servidor.");
            }
        }
    }

    if (loading) return <div>Loading songs...</div>;
    if (error) return <div className="text-red">{error}</div>;

    function togglePlay(song: Song) {
        if (currentSongId === song.id) {
            if (isPlaying) {
                pause();
            } else {
                play();
            }
        } else {
            setSong(song.id, song.title);
            play();
        }
    }

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
                            {songs.map((song) => {
                                const isCurrentSong = currentSongId === song.id;
                                const isFavorited = !!favoritedSongs[song.id];

                                return (
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
                                                onClick={() => togglePlay(song)}
                                                title={
                                                    isCurrentSong && isPlaying
                                                        ? "Pause"
                                                        : "Play"
                                                }
                                                aria-label={
                                                    isCurrentSong && isPlaying
                                                        ? `Pause ${song.title}`
                                                        : `Play ${song.title}`
                                                }
                                            >
                                                {isCurrentSong && isPlaying
                                                    ? "⏸"
                                                    : "▶️"}
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleFavoriteToggle(song)
                                                }
                                                title={
                                                    isFavorited
                                                        ? "Unfavorite"
                                                        : "Favorite"
                                                }
                                                aria-label={
                                                    isFavorited
                                                        ? `Unfavorite ${song.title}`
                                                        : `Favorite ${song.title}`
                                                }
                                            >
                                                {isFavorited ? "❤️" : "🤍"}
                                            </button>

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
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
