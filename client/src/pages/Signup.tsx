import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: username,
                    email,
                    password,
                }),
            });

            if (res.status === 201) {
                navigate("/");
            } else if (res.status === 409) {
                const data = await res.json();
                setError(data.error || "User or email already exists");
            } else if (res.status === 400) {
                setError("Missing required fields");
            } else {
                setError("Unexpected error");
            }
        } catch {
            setError("Network error");
        }
    };

    return (
        <div className="container min-h-full flex jcc aic">
            <form onSubmit={handleSignup} className="flex flex-column gap-2">
                <Link to="/" className="mb-2">
                    ←
                </Link>

                <h1>
                    <span role="img" aria-label="user">
                        👤
                    </span>{" "}
                    Create account
                </h1>

                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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

                <button className="mt-2" type="submit">
                    Signup
                </button>
            </form>
        </div>
    );
}
