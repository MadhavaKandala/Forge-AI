import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { dbService } from "./lib/db.ts";
import schema from "./lib/schema.sql?raw";

const init = async () => {
    try {
        await dbService.initializePlugin();
        await dbService.openConnection();
        await dbService.runMigrations(schema);
        console.log("Database initialized and migrations run");
    } catch (e) {
        console.error("Failed to initialize database", e);
    }

    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
};

init();
