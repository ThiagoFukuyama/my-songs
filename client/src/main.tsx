import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// @ts-ignore
import "@picocss/pico";
import "./index.css";
// @ts-ignore
import "@fontsource/outfit"; // Defaults to weight 400
import { MeProvider } from "./context/MeContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <MeProvider>
            <App />
        </MeProvider>
    </StrictMode>
);
