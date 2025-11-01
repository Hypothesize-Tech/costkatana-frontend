import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./styles/global.css";

// Initialize Sentry as early as possible
import { initializeSentryReact } from "./config/sentry";
initializeSentryReact();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      // gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={12}
          containerClassName="toast-container"
          containerStyle={{
            top: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
          }}
          toastOptions={{
            duration: 4500,
            className: "custom-toast",
            style: {
              background: "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(12, 16, 18, 0.95))",
              color: "#f8fafc",
              border: "1.5px solid rgba(6, 236, 158, 0.25)",
              boxShadow: "0 12px 40px rgba(6, 236, 158, 0.15), 0 0 0 1px rgba(6, 236, 158, 0.1) inset",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              borderRadius: "1rem",
              padding: "1rem 1.25rem",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: "500",
              fontSize: "0.9375rem",
              lineHeight: "1.5",
              letterSpacing: "-0.01em",
              minWidth: "320px",
              maxWidth: "420px",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            },
            success: {
              duration: 5000,
              iconTheme: {
                primary: "#ffffff",
                secondary: "#22c55e",
              },
              style: {
                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.12))",
                color: "#f8fafc",
                border: "1.5px solid rgba(34, 197, 94, 0.4)",
                boxShadow: "0 12px 40px rgba(34, 197, 94, 0.25), 0 0 20px rgba(34, 197, 94, 0.15), 0 0 0 1px rgba(34, 197, 94, 0.1) inset",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
              },
              className: "toast-success",
            },
            error: {
              duration: 6000,
              iconTheme: {
                primary: "#ffffff",
                secondary: "#ef4444",
              },
              style: {
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.12))",
                color: "#f8fafc",
                border: "1.5px solid rgba(239, 68, 68, 0.4)",
                boxShadow: "0 12px 40px rgba(239, 68, 68, 0.25), 0 0 20px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(239, 68, 68, 0.1) inset",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
              },
              className: "toast-error",
            },
            loading: {
              duration: Infinity,
              iconTheme: {
                primary: "#ffffff",
                secondary: "#06ec9e",
              },
              style: {
                background: "linear-gradient(135deg, rgba(6, 236, 158, 0.15), rgba(0, 148, 84, 0.12))",
                color: "#f8fafc",
                border: "1.5px solid rgba(6, 236, 158, 0.4)",
                boxShadow: "0 12px 40px rgba(6, 236, 158, 0.25), 0 0 20px rgba(6, 236, 158, 0.15), 0 0 0 1px rgba(6, 236, 158, 0.1) inset",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
              },
              className: "toast-loading",
            },
          }}
        />
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
);
