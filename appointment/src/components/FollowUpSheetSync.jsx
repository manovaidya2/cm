import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import "../style/GoogleSheetSync.css";

const FOLLOWUP_SERVICE_EMAIL = "clinic-service@aerobic-entropy-464510-h1.iam.gserviceaccount.com";

const FollowUpSheetSync = ({ followUpData }) => {
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetId, setSheetId] = useState("");
  const [syncedTrackingIds, setSyncedTrackingIds] = useState([]);

  // Load saved data from localStorage
  useEffect(() => {
    const savedUrl = localStorage.getItem("followUpSheetUrl");
    if (savedUrl) {
      setSheetUrl(savedUrl);
      const id = extractSheetId(savedUrl);
      if (id) setSheetId(id);
    }

    const savedIds = localStorage.getItem("syncedFollowUpTrackingIds");
    if (savedIds) {
      setSyncedTrackingIds(JSON.parse(savedIds));
    }
  }, []);

  // Extract Sheet ID from URL
  const extractSheetId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  // Connect to Sheet
  const handleConnect = () => {
    const id = extractSheetId(sheetUrl);
    if (!id) return alert("❌ Invalid Google Sheet URL");
    localStorage.setItem("followUpSheetUrl", sheetUrl);
    setSheetId(id);
    alert("✅ Connected to Follow-Up Sheet");
  };

  // Disconnect from Sheet
  const handleDisconnect = () => {
    setSheetUrl("");
    setSheetId("");
    localStorage.removeItem("followUpSheetUrl");
  };

  // ✅ Remove duplicate records by trackingId
  const deduplicateByTrackingId = (data) => {
    const seen = {};
    return data.filter((item) => {
      if (!item.trackingId || seen[item.trackingId]) return false;
      seen[item.trackingId] = true;
      return true;
    });
  };

  // Sync only unsynced records
  useEffect(() => {
    if (!sheetId || followUpData.length === 0) return;

    const deduplicated = deduplicateByTrackingId(followUpData);

    const unsynced = deduplicated.filter(
      (record) => record.trackingId && !syncedTrackingIds.includes(record.trackingId)
    );

    if (unsynced.length === 0) return;

    console.log("🟡 Sending unsynced follow-up records:", unsynced);

    axios
      .post("api/sync-followup-to-sheet", {
        sheetId,
        data: unsynced,
      })
      .then(() => {
        const newIds = unsynced.map((r) => r.trackingId);
        const updatedIds = [...syncedTrackingIds, ...new Set(newIds)];
        setSyncedTrackingIds(updatedIds);
        localStorage.setItem("syncedFollowUpTrackingIds", JSON.stringify(updatedIds));
        console.log("✅ Follow-up records synced successfully.");
      })
      .catch((err) => {
        console.error("❌ Follow-up sync failed:", err);
      });
  }, [followUpData, sheetId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(FOLLOWUP_SERVICE_EMAIL);
    alert("📋 Service account email copied!");
  };

  const handleResetSync = () => {
    localStorage.removeItem("syncedFollowUpTrackingIds");
    setSyncedTrackingIds([]);
    alert("🔄 Sync history reset. All records will sync again.");
  };

  return (
    <div className="sheet-sync-container">
      <h3>📤 Sync Follow-Up Records</h3>

      <input
        type="text"
        placeholder="Paste Follow-Up Sheet link"
        value={sheetUrl}
        onChange={(e) => setSheetUrl(e.target.value)}
      />

      {!sheetId ? (
        <button onClick={handleConnect}>🔗 Connect Sheet</button>
      ) : (
        <button className="disconnect-btn" onClick={handleDisconnect}>
          🔌 Disconnect
        </button>
      )}

      {sheetId && (
        <p className="connected-status">
          🟢 Connected Follow-Up Sheet ID: <span>{sheetId}</span>
        </p>
      )}

      <div className="service-account-box">
        <h4>📌 Share this email with your sheet</h4>
        <code>{FOLLOWUP_SERVICE_EMAIL}</code>
        <button onClick={handleCopy}>📋 Copy</button>
      </div>

      <button className="reset-btn" onClick={handleResetSync} style={{ marginTop: "15px" }}>
        ♻️ Reset Sync History
      </button>
    </div>
  );
};

export default FollowUpSheetSync;
