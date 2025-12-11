import React, { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

const API_URL = "https://image-denoiser-2f3r.onrender.com/api/denoise";
const STORAGE_KEY = "image-denoiser-settings-v1";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState(null);
  const [denoisedPreviewUrl, setDenoisedPreviewUrl] = useState(null);

  const [method, setMethod] = useState("cdae");
  const [strength, setStrength] = useState(0.5);

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const settings = JSON.parse(raw);
      if (settings.method) setMethod(settings.method);
      if (typeof settings.strength === "number") {
        setStrength(settings.strength);
      }
    } catch (err) {
      console.warn("Failed to load settings", err);
    }
  }, []);

  // Save settings to localStorage when method or strength changes
  useEffect(() => {
    const settings = {
      method,
      strength,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [method, strength]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalPreviewUrl) {
        URL.revokeObjectURL(originalPreviewUrl);
      }
      if (denoisedPreviewUrl) {
        URL.revokeObjectURL(denoisedPreviewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setOriginalPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    setStatusMessage("");

    // Release previous URL
    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
    }

    const url = URL.createObjectURL(file);
    setOriginalPreviewUrl(url);

    // Clear previous result
    if (denoisedPreviewUrl) {
      URL.revokeObjectURL(denoisedPreviewUrl);
    }
    setDenoisedPreviewUrl(null);
  };

  const handleMethodChange = (event) => {
    setMethod(event.target.value);
  };

  const handleStrengthChange = (event) => {
    setStrength(parseFloat(event.target.value));
  };

  const handleDenoise = async () => {
    if (!selectedFile) {
      setStatusMessage("Please upload an image first.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Processing...");
    if (denoisedPreviewUrl) {
      URL.revokeObjectURL(denoisedPreviewUrl);
      setDenoisedPreviewUrl(null);
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("method", method);
      formData.append("strength", strength.toString());

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = `Server error: ${response.status}`;
        try {
          const data = await response.json();
          if (data && data.error) {
            errorMsg = data.error;
          }
        } catch (_) {
          // ignore JSON parsing error
        }
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDenoisedPreviewUrl(url);
      setStatusMessage("Denoising completed.");
    } catch (error) {
      console.error(error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!denoisedPreviewUrl) return;
    const anchor = document.createElement("a");
    anchor.href = denoisedPreviewUrl;
    anchor.download = "denoised.png";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleReset = () => {
    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
    }
    if (denoisedPreviewUrl) {
      URL.revokeObjectURL(denoisedPreviewUrl);
    }

    setSelectedFile(null);
    setOriginalPreviewUrl(null);
    setDenoisedPreviewUrl(null);
    setStatusMessage("");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Image Denoising Demo</h1>
        <p>Upload an image, select a denoising method, and compare results.</p>

        <a
          href="https://github.com/PaulOnyekwelu/image_denoiser"
          target="_blank"
          rel="noopener noreferrer"
          className="github-button"
        >
          <svg
            height="20"
            viewBox="0 0 16 16"
            width="20"
            style={{ marginRight: "6px", verticalAlign: "middle" }}
          >
            <path
              fill="white"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 
         6.53 5.47 7.59.4.07.55-.17.55-.38 
         0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
         -.01-.53.63-.01 1.08.58 1.23.82.72 1.21 
         1.87.87 2.33.66.07-.52.28-.87.51-1.07
         -1.78-.2-3.64-.89-3.64-3.95 
         0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11
         0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 
         8 4.86a7.6 7.6 0 0 1 2.01.27c1.53-1.04 
         2.2-.82 2.2-.82.44 1.1.16 1.91.08 
         2.11.51.56.82 1.27.82 2.15 
         0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 
         1.48 0 1.07-.01 1.93-.01 2.19 
         0 .21.15.46.55.38A8.013 8.013 0 0 0 
         16 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          View on GitHub
        </a>
      </header>
      <Analytics />
      <main className="App-main">
        <section className="card">
          <h2>1. Upload & Settings</h2>

          <div className="form-group">
            <label className="label">Image file</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="method">
              Denoising method
            </label>
            <select id="method" value={method} onChange={handleMethodChange}>
              <option value="cdae">
                CDAE (Convolutional Denoising Autoencoder)
              </option>
              <option value="mean">Mean filter</option>
              <option value="median">Median filter</option>
              <option value="wavelet">Wavelet denoising</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="strength">
              Denoising strength:{" "}
              <span className="value">{strength.toFixed(2)}</span>
            </label>
            <input
              id="strength"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={strength}
              onChange={handleStrengthChange}
            />
          </div>

          <div className="buttons">
            <button
              type="button"
              onClick={handleDenoise}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Denoise"}
            </button>
            <button type="button" className="secondary" onClick={handleReset}>
              Reset
            </button>
          </div>

          {statusMessage && <p className="status">{statusMessage}</p>}
        </section>

        <section className="card">
          <h2>2. Preview</h2>
          <div className="preview-grid">
            <div className="preview-column">
              <h3>Original</h3>
              {originalPreviewUrl ? (
                <img
                  src={originalPreviewUrl}
                  alt="Original preview"
                  className="preview-image"
                />
              ) : (
                <div className="placeholder">No image selected.</div>
              )}
            </div>

            <div className="preview-column">
              <h3>Denoised</h3>
              {denoisedPreviewUrl ? (
                <>
                  <img
                    src={denoisedPreviewUrl}
                    alt="Denoised preview"
                    className="preview-image"
                  />
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="download-btn"
                  >
                    Download denoised image
                  </button>
                </>
              ) : (
                <div className="placeholder">
                  Run denoising to see the result.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="card">
          <h2>About this demo</h2>
          <p>
            This open-source web application showcases several image denoising
            techniques, including a convolutional denoising autoencoder (CDAE)
            and classical methods such as mean filtering, median filtering, and
            wavelet denoising.
          </p>
          <p>
            The backend is implemented in Python using FastAPI, and the frontend
            is a single-page React application. Settings such as the selected
            method and denoising strength are stored locally in your browser and
            are not sent to any server.
          </p>
          <p>
            You are free to adapt and extend this codebase (for example, by
            plugging in a trained CDAE model, adding benchmarks, or integrating
            additional algorithms).
          </p>
        </section>
      </main>

      <footer className="App-footer">
        <p>
          For research and demonstration purposes only. Not intended for
          clinical or safety-critical use.
        </p>
      </footer>
    </div>
  );
}

export default App;
