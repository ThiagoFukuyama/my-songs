import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";

interface Song {
    title: string;
    artist: string;
    duration: string;
    album_id: number | "";
}

interface AlbumOption {
    id: number;
    title: string;
}

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function SongForm() {
    const { id } = useParams<{ id: string }>();
    const query = useQuery();
    const action = query.get("action");
    const navigate = useNavigate();

    const [song, setSong] = useState<Song>({
        title: "",
        artist: "",
        duration: "",
        album_id: "",
    });

    const [audioFile, setAudioFile] = useState<File | null>(null); // Novo
    const [albums, setAlbums] = useState<AlbumOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAlbums() {
            try {
                const res = await fetch("/api/albums");
                if (!res.ok) throw new Error("Failed to fetch albums");
                const data = await res.json();
                setAlbums(data);
            } catch (err: any) {
                console.error(err);
            }
        }

        fetchAlbums();
    }, []);

    useEffect(() => {
        if (action === "edit" && id && id !== "0") {
            setLoading(true);
            fetch(`/api/songs/${id}`)
                .then(async (res) => {
                    if (!res.ok) throw new Error("Failed to fetch song");
                    const data = await res.json();
                    setSong({
                        title: data.title || "",
                        artist: data.artist || "",
                        duration: data.duration || "",
                        album_id: data.album_id ?? "",
                    });
                })
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false));
        } else {
            setSong({
                title: "",
                artist: "",
                duration: "",
                album_id: "",
            });
        }
    }, [action, id]);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;

        setSong((old) => ({
            ...old,
            [name]:
                name === "album_id"
                    ? value === ""
                        ? ""
                        : Number(value)
                    : value,
        }));
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setAudioFile(file);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        try {
            const formData = new FormData();
            formData.append("title", song.title);
            formData.append("artist", song.artist);
            formData.append("duration", song.duration);
            formData.append("album_id", song.album_id.toString());
            if (audioFile) formData.append("file", audioFile);

            const method = action === "edit" && id !== "0" ? "PUT" : "POST";
            const url =
                action === "edit" && id !== "0"
                    ? `/api/songs/${id}`
                    : "/api/songs";

            const res = await fetch(url, {
                method,
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save song");
            }

            navigate("/songs");
        } catch (err: any) {
            setError(err.message || "Unexpected error");
        }
    }

    if (loading) return <div>Loading song...</div>;

    return (
        <div className="container min-h-full flex jcc aic mb-5">
            <form onSubmit={handleSubmit} className="flex flex-column gap-2">
                <Link to="/songs" className="mb-2">
                    ←
                </Link>

                <h1>
                    <span role="img" aria-label="music">
                        🎵
                    </span>{" "}
                    {action === "edit" ? "Edit Song" : "New Song"}
                </h1>

                <div className="row">
                    <div className="column">
                        <label htmlFor="title">Title</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={song.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="column">
                        <label htmlFor="artist">Artist</label>
                        <input
                            id="artist"
                            name="artist"
                            type="text"
                            value={song.artist}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <label htmlFor="duration">Duration (HH:MM:SS)</label>
                        <input
                            id="duration"
                            name="duration"
                            type="text"
                            value={song.duration}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="column">
                        <label htmlFor="album_id">Album</label>
                        <select
                            id="album_id"
                            name="album_id"
                            value={song.album_id}
                            onChange={handleChange}
                        >
                            <option value="">— No Album —</option>
                            {albums.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="column">
                    <label htmlFor="file">Audio File (mp3, wav...)</label>
                    <input
                        id="file"
                        name="file"
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                    />
                </div>

                {error && (
                    <div className="text-error mt-1" role="alert">
                        {error}
                    </div>
                )}

                <button className="mt-2" type="submit">
                    {action === "edit" ? "Save Changes" : "Create Song"}
                </button>
            </form>
        </div>
    );
}
