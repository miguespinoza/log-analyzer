import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./domain/handleOpenFile";
import ReactModal from "react-modal";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
const element = document.getElementById("root") as HTMLElement;

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_URL,
    integrations: [new BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

ReactDOM.createRoot(element).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

ReactModal.setAppElement("body");
