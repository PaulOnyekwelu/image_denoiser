import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8000/api/denoise";
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
        <p>
          Upload an image, select a denoising method, and compare the result to
          the original.
        </p>
      </header>

      <main className="App-main">
        <section className="card">
          <h2>1. Upload & Settings</h2>

          <div className="form-group">
            <label className="label">Image file</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="method">
              Denoising method
            </label>
            <select
              id="method"
              value={method}
              onChange={handleMethodChange}
            >
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
            <button
              type="button"
              className="secondary"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>

          {statusMessage && (
            <p className="status">
              {statusMessage}
            </p>
          )}
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
                <div className="placeholder">
                  No image selected.
                </div>
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
            The backend is implemented in Python using FastAPI, and the
            frontend is a single-page React application. Settings such as the
            selected method and denoising strength are stored locally in your
            browser and are not sent to any server.
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
