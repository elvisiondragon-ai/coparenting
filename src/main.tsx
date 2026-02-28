import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { registerSW } from 'virtual:pwa-register';
import { iOSCacheCleaner } from "@/utils/iOSCacheCleaner";

// Register Service Worker for PWA
registerSW({ immediate: true });

const APP_VERSION = '2026.03.01.03'; // <-- Change this number to force an update

// Execute aggressive cache clearing before React mounts if versions mismatch
if (localStorage.getItem('v_cache') !== APP_VERSION) {
    localStorage.setItem('v_cache', APP_VERSION);
    iOSCacheCleaner.forceCleanReload();
}

// Set title dynamically
document.title = "Co Parenting eL Vision";

createRoot(document.getElementById("root")!).render(<App />);
