import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMe } from "../context/MeContext";

export default function Login() {
    const [username, setUsername] = useState(""); // vai usar como email
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const { setUser } = useMe();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch("api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                // login ok, recebe dados do usuário (sem senha)
                const user = await res.json();
                setUser(user);

                // Aqui você pode salvar no contexto, localStorage, etc
                // Por enquanto só navega para latest-hits
                navigate("/latest-hits");
            } else if (res.status === 401) {
                setError("Invalid email or password");
            } else if (res.status === 400) {
                setError("Missing email or password");
            } else {
                setError("Unexpected error");
            }
        } catch {
            setError("Network error");
        }
    };

    return (
        <div className="container min-h-full flex jcc aic">
            <form onSubmit={handleLogin}>
                <div>
                    <h1 className="mb-80">
                        <span role="img" aria-label="music-note">
                            🎵
                        </span>{" "}
                        My Songs
                    </h1>

                    <div>
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-error mt-1" role="alert">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="mt-2">
                        Login
                    </button>

                    <div className="text-center">
                        <span>Don't have an account?</span>{" "}
                        <Link to="/signup">Signup</Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
