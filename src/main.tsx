import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize theme before React renders to prevent flash
const storedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.classList.remove('light', 'dark');
document.documentElement.classList.add(storedTheme);

createRoot(document.getElementById("root")!).render(<App />);
