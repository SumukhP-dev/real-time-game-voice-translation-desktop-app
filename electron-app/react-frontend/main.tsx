import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("main.tsx: Starting React app");
console.log("main.tsx: Document ready state:", document.readyState);
console.log("main.tsx: Document body:", document.body);

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("main.tsx: Root element not found!");
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText = "padding: 20px; background: #1a1a1a; color: #ff4444; min-height: 100vh; font-family: monospace;";
  errorDiv.innerHTML = "<h1>Error: Root element not found</h1><p>The app could not find the root element to render into.</p>";
  document.body.appendChild(errorDiv);
  throw new Error("Root element not found");
}

console.log("main.tsx: Root element found:", rootElement);

console.log("main.tsx: Root element found, creating React root");
console.log("main.tsx: React version:", React.version);
console.log("main.tsx: ReactDOM available:", typeof ReactDOM !== "undefined");

try {
  console.log("main.tsx: Creating React root...");
  const root = ReactDOM.createRoot(rootElement);
  console.log("main.tsx: React root created, rendering App...");
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("main.tsx: React app rendered successfully");
} catch (error) {
  console.error("main.tsx: Error rendering app:", error);
  console.error("main.tsx: Error stack:", error instanceof Error ? error.stack : "No stack trace");
  
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText = "padding: 20px; background: #1a1a1a; color: #ff4444; min-height: 100vh; font-family: monospace;";
  errorDiv.innerHTML = `
    <h1>Error: Failed to render app</h1>
    <p><strong>Error:</strong> ${error instanceof Error ? error.message : "Unknown error"}</p>
    ${error instanceof Error && error.stack ? `<pre style="background: #000; padding: 10px; overflow: auto; white-space: pre-wrap;">${error.stack}</pre>` : ""}
    <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer; background: #4a9eff; color: #fff; border: none; border-radius: 4px;">Reload App</button>
  `;
  rootElement.innerHTML = "";
  rootElement.appendChild(errorDiv);
  throw error;
}
