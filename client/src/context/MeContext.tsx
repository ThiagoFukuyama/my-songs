import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    created_at: string;
}

interface MeContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const MeContext = createContext<MeContextType | undefined>(undefined);

interface MeProviderProps {
    children: ReactNode;
}

export function MeProvider({ children }: MeProviderProps) {
    const [user, setUser] = useState<User | null>(null);

    return (
        <MeContext.Provider value={{ user, setUser }}>
            {children}
        </MeContext.Provider>
    );
}

// Custom hook para consumir o contexto
export function useMe() {
    const context = useContext(MeContext);
    if (!context) {
        throw new Error("useMe must be used within a MeProvider");
    }
    return context;
}
