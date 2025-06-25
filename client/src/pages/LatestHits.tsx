import { useEffect, useState } from "react";
import { useMe } from "../context/MeContext";
import { useAudioPlayer } from "../context/AudioPlayerContext";

interface Song {
    id: number;
    title: string;
    artist: string;
    album_id: number | null;
    album_title: string | null;
    duration: string | null;
    created_at: string;
    isFavorited: boolean;
    favoriteId?: number;
}

export default function LatestHits() {
    const { user } = useMe();
    const { setSong, play, pause, isPlaying, currentSongId } = useAudioPlayer();

    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refetch, setRefetch] = useState(false);

    useEffect(() => {
        async function fetchSongs() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/songs");
                if (!res.ok) throw new Error("Failed to fetch songs");
                const data: Song[] = await res.json();

                // embaralhar (Fisher-Yates)
                for (let i = data.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [data[i], data[j]] = [data[j], data[i]];
                }

                setSongs(data.slice(0, 30));
            } catch (err: any) {
                setError(err.message || "Error fetching songs");
            } finally {
                setLoading(false);
            }
        }

        fetchSongs();
    }, [refetch]);

    const handleFavoriteToggle = async (song: Song) => {
        if (!user) {
            alert("Você precisa estar logado para favoritar uma música.");
            return;
        }

        if (song.isFavorited) {
            if (!song.favoriteId) {
                alert("Erro: favorito não encontrado.");
                return;
            }
            try {
                const res = await fetch(`/api/favorites/${song.favoriteId}`, {
                    method: "DELETE",
                });
                if (res.status === 204) {
                    setSongs((oldSongs) =>
                        oldSongs.map((s) =>
                            s.id === song.id
                                ? {
                                      ...s,
                                      isFavorited: false,
                                      favoriteId: undefined,
                                  }
                                : s
                        )
                    );
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
                        user_id: user.id,
                        song_id: song.id,
                    }),
                });

                if (res.status === 201) {
                    const data = await res.json();
                    setSongs((oldSongs) =>
                        oldSongs.map((s) =>
                            s.id === song.id
                                ? {
                                      ...s,
                                      isFavorited: true,
                                      favoriteId: data.id,
                                  }
                                : s
                        )
                    );
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
    };

    // Função para alternar play/pause do áudio
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
                <h1 className="mb-2">
                    <span role="img" aria-label="disco ball">
                        🪩
                    </span>{" "}
                    Latest Hits
                </h1>
                <button
                    onClick={() => setRefetch(!refetch)}
                    title="Recarregar lista"
                    style={{
                        backgroundColor: "transparent",
                        border: 0,
                        padding: "1em",
                        fontSize: "1.25rem",
                        cursor: "pointer",
                    }}
                >
                    🔄
                </button>
            </div>

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
                                            aria-label={
                                                song.isFavorited
                                                    ? `Unfavorite ${song.title}`
                                                    : `Favorite ${song.title}`
                                            }
                                            title={
                                                song.isFavorited
                                                    ? "Unfavorite"
                                                    : "Favorite"
                                            }
                                        >
                                            {song.isFavorited ? "❤️" : "🤍"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
