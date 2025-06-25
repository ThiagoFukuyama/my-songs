import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";

interface Album {
    title: string;
    release_year: number | "";
}

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function Album() {
    const { id } = useParams<{ id: string }>();
    const query = useQuery();
    const action = query.get("action");
    const navigate = useNavigate();

    const [album, setAlbum] = useState<Album>({
        title: "",
        release_year: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Carregar dados se for edição
    useEffect(() => {
        if (action === "edit" && id && id !== "0") {
            setLoading(true);
            fetch(`/api/albums/${id}`)
                .then(async (res) => {
                    if (!res.ok) throw new Error("Failed to fetch album");
                    const data = await res.json();
                    setAlbum({
                        title: data.title,
                        release_year: data.release_year ?? "",
                    });
                })
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false));
        } else {
            // Insert: resetar campos
            setAlbum({ title: "", release_year: "" });
        }
    }, [action, id]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;

        setAlbum((old) => ({
            ...old,
            [name]:
                name === "release_year"
                    ? value === ""
                        ? ""
                        : Number(value)
                    : value,
        }));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        try {
            const method = action === "edit" && id !== "0" ? "PUT" : "POST";
            const url =
                action === "edit" && id !== "0"
                    ? `/api/albums/${id}`
                    : "/api/albums";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(album),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save album");
            }

            navigate("/albums");
        } catch (err: any) {
            setError(err.message || "Unexpected error");
        }
    }

    if (loading) return <div>Loading album...</div>;

    return (
        <div className="container min-h-full flex jcc aic">
            <form onSubmit={handleSubmit} className="flex flex-column gap-2">
                <Link to="/albums" className="mb-2">
                    ←
                </Link>

                <h1>
                    <span role="img" aria-label="album">
                        💿
                    </span>{" "}
                    {action === "edit" ? "Edit Album" : "New Album"}
                </h1>

                <div className="column">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        value={album.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="column">
                    <label htmlFor="release_year">Release Year</label>
                    <input
                        id="release_year"
                        name="release_year"
                        type="number"
                        min={1900}
                        max={2100}
                        value={album.release_year}
                        onChange={handleChange}
                    />
                </div>

                {error && (
                    <div className="text-error mt-1" role="alert">
                        {error}
                    </div>
                )}

                <button className="mt-2" type="submit">
                    {action === "edit" ? "Save Changes" : "Create Album"}
                </button>
            </form>
        </div>
    );
}
