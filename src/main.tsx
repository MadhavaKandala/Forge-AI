import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { dbService } from "./lib/db";
import schema from "./lib/schema.sql?raw";

const initApp = async () => {
    try {
        await dbService.initializePlugin();
        await dbService.openConnection();
        await dbService.runMigrations(schema);
        console.log("Database initialized and migrations run successfully");
    } catch (err) {
        console.error("Failed to initialize database:", err);
    }

    createRoot(document.getElementById("root")!).render(<App />);
};

initApp();
