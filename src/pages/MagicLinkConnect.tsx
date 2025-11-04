import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

const MagicLinkConnect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error" | "expired">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleMagicLink = async () => {
      const token = searchParams.get("token");
      const data = searchParams.get("data");

      if (!token || !data) {
        setStatus("error");
        setErrorMessage("Invalid magic link - missing token or data");
        return;
      }

      try {
        // Decode the magic link data with comprehensive error handling
        let decodedData;

        console.log("Processing magic link data:", {
          token: token.substring(0, 10) + "...",
          dataLength: data.length,
          dataStart: data.substring(0, 50) + "...",
          dataEnd: "..." + data.substring(data.length - 20),
        });

        try {
          // Method 1: Direct base64 decode (most common)
          let base64Data = data;

          // Add padding if needed
          while (base64Data.length % 4) {
            base64Data += "=";
          }

          const directDecoded = atob(base64Data);
          decodedData = JSON.parse(directDecoded);
          console.log("Successfully decoded with direct method:", decodedData);
        } catch (directError) {
          console.log("Direct decode failed, trying URL decode method...");

          try {
            // Method 2: URL decode first, then base64
            const urlDecoded = decodeURIComponent(data);
            let base64Data = urlDecoded;

            // Add padding if needed
            while (base64Data.length % 4) {
              base64Data += "=";
            }

            const base64Decoded = atob(base64Data);
            decodedData = JSON.parse(base64Decoded);
            console.log(
              "Successfully decoded with URL decode method:",
              decodedData,
            );
          } catch (urlDecodeError) {
            console.log("URL decode method failed, trying manual fixes...");

            try {
              // Method 3: Try to fix common URL encoding issues
              let fixedData = data
                .replace(/%3D/g, "=")
                .replace(/%2B/g, "+")
                .replace(/%2F/g, "/");

              // Add padding if needed
              while (fixedData.length % 4) {
                fixedData += "=";
              }

              const fixedDecoded = atob(fixedData);
              decodedData = JSON.parse(fixedDecoded);
              console.log(
                "Successfully decoded with manual fixes:",
                decodedData,
              );
            } catch (manualError) {
              console.error("All decoding methods failed:", {
                directError,
                urlDecodeError,
                manualError,
              });
              console.error("Raw data for debugging:", data);

              setStatus("error");
              setErrorMessage(
                `Invalid magic link format - could not decode data. Data length: ${data.length}`,
              );
              return;
            }
          }
        }

        // Check if expired (handle both old and new format)
        const expiresAt = decodedData.x
          ? decodedData.x * 1000
          : new Date(decodedData.expiresAt).getTime();
        if (Date.now() > expiresAt) {
          setStatus("expired");
          return;
        }

        // Redirect directly to backend for onboarding completion
        const apiBaseUrl =
          import.meta.env.VITE_API_URL || "https://cost-katana-backend.store";
        const backendUrl = `${apiBaseUrl}/api/onboarding/complete?token=${token}&data=${encodeURIComponent(data)}`;

        console.log("Redirecting to backend:", backendUrl);
        console.log("User data:", {
          email: decodedData.e || decodedData.email,
          name: decodedData.n || decodedData.name,
          source: decodedData.s || decodedData.source,
        });

        // Direct redirect to backend - let it handle the HTML response
        window.location.href = backendUrl;
        return;
      } catch (error) {
        console.error("Magic link processing error:", error);
        setStatus("error");
        setErrorMessage("Failed to process magic link");
      }
    };

    handleMagicLink();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-light-ambient dark:bg-gradient-dark-ambient relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-success-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-3/4 right-1/2 w-64 h-64 bg-accent-500/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
        <div className="text-center relative z-10">
          <div className="glass rounded-2xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 max-w-md mx-auto">
            <LoadingSpinner />
            <h2 className="mt-6 text-2xl font-display font-bold gradient-text-primary">
              Connecting to Cost Katana...
            </h2>
            <p className="mt-3 text-secondary-600 dark:text-secondary-300 font-body">
              Please wait while we set up your account
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-light-ambient dark:bg-gradient-dark-ambient relative overflow-hidden p-4">
        {/* Ambient glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-warning-500/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="text-center max-w-md mx-auto relative z-10">
          <div className="glass rounded-2xl border border-warning-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
            <div className="w-20 h-20 rounded-full bg-gradient-warning/20 flex items-center justify-center mx-auto mb-6 glow-warning">
              <span className="text-4xl">⏰</span>
            </div>
            <h2 className="text-2xl font-display font-bold gradient-text-warning mb-4">
              Magic Link Expired
            </h2>
            <p className="text-secondary-600 dark:text-secondary-300 mb-6 font-body">
              This magic link has expired. Please generate a new one from ChatGPT.
            </p>
            <div className="glass rounded-xl border border-primary-200/30 p-4 bg-gradient-primary/5">
              <p className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                <strong className="font-display font-semibold gradient-text">How to get a new link:</strong>
                <br />
                <span className="mt-2 block">Go back to ChatGPT and ask to "connect to Cost Katana" again.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-light-ambient dark:bg-gradient-dark-ambient relative overflow-hidden p-4">
        {/* Ambient glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-danger-500/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="text-center max-w-md mx-auto relative z-10">
          <div className="glass rounded-2xl border border-danger-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
            <div className="w-20 h-20 rounded-full bg-gradient-danger/20 flex items-center justify-center mx-auto mb-6 glow-danger">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-2xl font-display font-bold gradient-text-danger mb-4">
              Connection Failed
            </h2>
            <p className="text-secondary-600 dark:text-secondary-300 mb-2 font-body">
              We couldn't process your magic link.
            </p>
            {errorMessage && (
              <p className="text-sm text-danger-600 dark:text-danger-400 mb-6 font-body">{errorMessage}</p>
            )}
            <div className="glass rounded-xl border border-primary-200/30 p-4 bg-gradient-primary/5">
              <p className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                <strong className="font-display font-semibold gradient-text">Try again:</strong>
                <br />
                <span className="mt-2 block">Go back to ChatGPT and generate a new magic link.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MagicLinkConnect;
