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
              background: "linear-gradient(135deg, #1C1B29, #14121D)",
              color: "#F7F4FB",
              border: "1px solid rgba(155, 93, 229, 0.3)",
              boxShadow: "0 8px 30px rgba(155, 93, 229, 0.2)",
              backdropFilter: "blur(20px)",
              borderRadius: "0.75rem",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: "500",
            },
            success: {
              style: {
                background: "linear-gradient(135deg, #00F5D4, #3DBE8B)",
                color: "#ffffff",
                border: "1px solid rgba(0, 245, 212, 0.3)",
                boxShadow: "0 8px 30px rgba(0, 245, 212, 0.3)",
              },
              iconTheme: {
                primary: "#ffffff",
                secondary: "#00F5D4",
              },
            },
            error: {
              style: {
                background: "linear-gradient(135deg, #FF4F64, #E94E4E)",
                color: "#ffffff",
                border: "1px solid rgba(255, 79, 100, 0.3)",
                boxShadow: "0 8px 30px rgba(255, 79, 100, 0.3)",
              },
              iconTheme: {
                primary: "#ffffff",
                secondary: "#FF4F64",
              },
            },
            loading: {
              style: {
                background: "linear-gradient(135deg, #9B5DE5, #F15BB5)",
                color: "#ffffff",
                border: "1px solid rgba(155, 93, 229, 0.3)",
                boxShadow: "0 8px 30px rgba(155, 93, 229, 0.3)",
              },
              iconTheme: {
                primary: "#ffffff",
                secondary: "#9B5DE5",
              },
            },
          }}
        />
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
);
