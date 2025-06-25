import {
    createContext,
    useContext,
    useRef,
    useState,
    type ReactNode,
    useEffect,
} from "react";

interface SongToPlay {
    id: number;
    title: string;
    url: string;
}

interface AudioPlayerContextType {
    setSong: (id: number, title: string) => void;
    play: () => void;
    pause: () => void;
    stop: () => void;
    isPlaying: boolean;
    currentSongId?: number;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
    undefined
);

export function useAudioPlayer() {
    const context = useContext(AudioPlayerContext);
    if (!context) {
        throw new Error(
            "useAudioPlayer must be used within an AudioPlayerProvider"
        );
    }
    return context;
}

interface AudioPlayerProviderProps {
    children: ReactNode;
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentSong, setCurrentSong] = useState<SongToPlay | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Quando currentSong mudar, carrega e toca automaticamente
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleError = () => {
            alert(`O áudio "${currentSong?.title}" não pôde ser carregado.`);
            setCurrentSong(null);
            setIsPlaying(false);
        };

        audio.removeEventListener("error", handleError);
        audio.addEventListener("error", handleError);

        if (currentSong) {
            audio.src = currentSong.url;
            audio
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
        } else {
            audio.pause();
            audio.src = "";
            setIsPlaying(false);
        }

        return () => {
            audio.removeEventListener("error", handleError);
        };
    }, [currentSong]);

    // Agora recebe id e title, monta url internamente
    function setSong(id: number, title: string) {
        setCurrentSong({
            id,
            title,
            url: `/api/songs/${id}/audio`,
        });
    }

    function play() {
        const audio = audioRef.current;
        if (!audio) return;
        audio.play();
        setIsPlaying(true);
    }

    function pause() {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        setIsPlaying(false);
    }

    function stop() {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setCurrentSong(null);
    }

    return (
        <AudioPlayerContext.Provider
            value={{
                setSong,
                play,
                pause,
                stop,
                isPlaying,
                currentSongId: currentSong?.id,
            }}
        >
            {children}

            {!!currentSong && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 10,
                        left: 10,
                        backgroundColor: "#222",
                        color: "#eee",
                        padding: "10px 15px",
                        borderRadius: 8,
                        boxShadow: "0 0 10px rgba(0,0,0,0.7)",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        zIndex: 9999,
                        minWidth: 250,
                        userSelect: "none",
                    }}
                >
                    <audio ref={audioRef} />

                    <div
                        style={{
                            flexGrow: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <span>{currentSong.title}</span>
                    </div>

                    {isPlaying ? (
                        <button
                            onClick={pause}
                            aria-label="Pause"
                            style={{
                                background: "none",
                                border: "none",
                                color: "#eee",
                                cursor: "pointer",
                                fontSize: 20,
                            }}
                        >
                            ⏸
                        </button>
                    ) : (
                        <button
                            onClick={play}
                            aria-label="Play"
                            disabled={!currentSong}
                            style={{
                                background: "none",
                                border: "none",
                                color: currentSong ? "#eee" : "#555",
                                cursor: currentSong ? "pointer" : "not-allowed",
                                fontSize: 20,
                            }}
                        >
                            ▶️
                        </button>
                    )}

                    <button
                        onClick={stop}
                        aria-label="Stop"
                        style={{
                            background: "none",
                            border: "none",
                            color: "#eee",
                            cursor: "pointer",
                            fontSize: 20,
                        }}
                    >
                        ⏹
                    </button>
                </div>
            )}
        </AudioPlayerContext.Provider>
    );
}
