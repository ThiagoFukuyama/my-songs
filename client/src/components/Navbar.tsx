import { Link, useNavigate } from "react-router-dom";
import { useMe } from "../context/MeContext";

export default function Navbar() {
    const navigate = useNavigate();
    const { user, setUser } = useMe();

    const handleLogout = () => {
        setUser(null);
        navigate("/");
    };

    return (
        <nav className="container-fluid mb-4">
            <ul>
                <li className="mr-1">
                    <strong>🎶 My Songs - {user?.name}</strong>
                </li>
                <li>
                    <Link to="/latest-hits">🪩 Latest Hits</Link>
                </li>
                <li>
                    <Link to="/my-favorites">❤️ Favorites</Link>
                </li>
                <li>
                    <Link to="/songs">🎵 Manage Songs</Link>
                </li>
                <li>
                    <Link to="/albums">💽 Manage Albums</Link>
                </li>
            </ul>
            <ul className="mr-4">
                <li>
                    <strong
                        onClick={handleLogout}
                        style={{
                            color: "red",
                            opacity: 0.7,
                            cursor: "pointer",
                        }}
                    >
                        ⍈ Logout
                    </strong>
                </li>
            </ul>
        </nav>
    );
}
