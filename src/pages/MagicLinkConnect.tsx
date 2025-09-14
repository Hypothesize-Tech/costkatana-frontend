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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200">
        <div className="text-center">
          <LoadingSpinner />
          <h2 className="mt-4 text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
            Connecting to Cost Katana...
          </h2>
          <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
            Please wait while we set up your account
          </p>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            Magic Link Expired
          </h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
            This magic link has expired. Please generate a new one from ChatGPT.
          </p>
          <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 p-4">
            <p className="text-sm text-primary-800 dark:text-primary-200">
              <strong>How to get a new link:</strong>
              <br />
              Go back to ChatGPT and ask to "connect to Cost Katana" again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            Connection Failed
          </h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-2">
            We couldn't process your magic link.
          </p>
          {errorMessage && (
            <p className="text-sm text-error-600 dark:text-error-400 mb-6">Error: {errorMessage}</p>
          )}
          <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 p-4">
            <p className="text-sm text-primary-800 dark:text-primary-200">
              <strong>Try again:</strong>
              <br />
              Go back to ChatGPT and generate a new magic link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MagicLinkConnect;
