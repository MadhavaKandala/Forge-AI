import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

try {
    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} catch (err) {
    console.error('App crash:', err);
    document.body.innerHTML = '<h1 style="color:white;padding:20px">Error: ' + String(err) + '</h1>';
}
