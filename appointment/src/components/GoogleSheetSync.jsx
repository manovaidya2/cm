import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import "../style/GoogleSheetSync.css";

const SERVICE_EMAIL = "clinic-service@aerobic-entropy-464510-h1.iam.gserviceaccount.com";

const GoogleSheetSync = ({ patients }) => {
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetId, setSheetId] = useState("");

  useEffect(() => {
    const savedUrl = localStorage.getItem("sheetUrl");
    if (savedUrl) {
      setSheetUrl(savedUrl);
      const id = extractSheetId(savedUrl);
      if (id) setSheetId(id);
    }
  }, []);

  const extractSheetId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const handleConnect = () => {
    const id = extractSheetId(sheetUrl);
    if (!id) return alert("❌ Invalid Google Sheet URL");
    localStorage.setItem("sheetUrl", sheetUrl);
    setSheetId(id);
    alert("✅ Connected to Google Sheet");
  };

  const handleDisconnect = () => {
    setSheetUrl("");
    setSheetId("");
    localStorage.removeItem("sheetUrl");
  };

  useEffect(() => {
    const readyPatients = patients.filter((p) => p.status === "Ready for Consultation");
    if (sheetId && readyPatients.length > 0) {
      axios
        .post("api/sync-to-sheet", { sheetId, data: readyPatients })
        .then(() => console.log("✅ Synced patients to Google Sheet"))
        .catch((err) => console.error("❌ Patient sync failed", err));
    }
  }, [patients, sheetId]);

  return (
    <div className="sheet-sync-container animated fadeIn">
      <h3 className="title">📤 Sync Patients to Google Sheet</h3>

      <div className="form-group">
        <label htmlFor="sheet-url">🔗 Google Sheet Link</label>
        <input
          id="sheet-url"
          type="text"
          placeholder="Paste your Google Sheet URL here"
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
        />
      </div>

      {!sheetId ? (
        <button className="connect-btn" onClick={handleConnect}>
          ✅ Connect
        </button>
      ) : (
        <button className="disconnect-btn" onClick={handleDisconnect}>
          ❌ Disconnect
        </button>
      )}

      {sheetId && (
        <p className="connected-status">
          🟢 Connected to Sheet ID: <code>{sheetId}</code>
        </p>
      )}

      <div className="service-account-box">
        <h4>📌 Share sheet with this service account:</h4>
        <div className="email-box">
          <code>{SERVICE_EMAIL}</code>
          <button
            className="copy-btn"
            onClick={() => navigator.clipboard.writeText(SERVICE_EMAIL)}
          >
            📋 Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetSync;
