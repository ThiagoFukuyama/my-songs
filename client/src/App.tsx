import {
    BrowserRouter,
    Routes,
    Route,
    Outlet,
    useNavigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LatestHits from "./pages/LatestHits";
import MyFavorites from "./pages/MyFavorites";
import ManageSongs from "./pages/ManageSongs";
import ManageAlbums from "./pages/ManageAlbums";
import Album from "./pages/Album";
import Song from "./pages/Song";
import { useEffect } from "react";
import { useMe } from "./context/MeContext";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";

function AppLayout() {
    const { user } = useMe();
    const navigate = useNavigate();

    useEffect(() => {
        if (user === null) navigate("/");
    }, [user]);

    return (
        <AudioPlayerProvider>
            <Navbar />
            <main className="container-lg">
                <Outlet />
            </main>
        </AudioPlayerProvider>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Sem navbar */}
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Com navbar */}
                <Route element={<AppLayout />}>
                    <Route path="/latest-hits" element={<LatestHits />} />
                    <Route path="/my-favorites" element={<MyFavorites />} />
                    <Route path="/songs" element={<ManageSongs />} />
                    <Route path="/song/:id" element={<Song />} />
                    <Route path="/albums" element={<ManageAlbums />} />
                    <Route path="/album/:id" element={<Album />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
