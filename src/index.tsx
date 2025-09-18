import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./styles/global.css";

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
          toastOptions={{
            duration: 4000,
            style: {
              background: "linear-gradient(135deg, #334155, #1e293b)",
              color: "#f8fafc",
              border: "1px solid rgba(6, 236, 158, 0.3)",
              boxShadow: "0 8px 30px rgba(6, 236, 158, 0.2)",
              backdropFilter: "blur(20px)",
              borderRadius: "0.75rem",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: "500",
            },
            success: {
              style: {
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#ffffff",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                boxShadow: "0 8px 30px rgba(34, 197, 94, 0.3)",
              },
              iconTheme: {
                primary: "#ffffff",
                secondary: "#22c55e",
              },
            },
            error: {
              style: {
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#ffffff",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                boxShadow: "0 8px 30px rgba(239, 68, 68, 0.3)",
              },
              iconTheme: {
                primary: "#ffffff",
                secondary: "#ef4444",
              },
            },
            loading: {
              style: {
                background: "linear-gradient(135deg, #06ec9e, #009454)",
                color: "#ffffff",
                border: "1px solid rgba(6, 236, 158, 0.3)",
                boxShadow: "0 8px 30px rgba(6, 236, 158, 0.3)",
              },
              iconTheme: {
                primary: "#ffffff",
                secondary: "#06ec9e",
              },
            },
          }}
        />
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
);
