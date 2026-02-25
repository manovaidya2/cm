import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Sidebar from "../components/Sidebar";
import PatientsSection from "../components/PatientsSection";
import { useAuth } from "../context/AuthContext";
import GoogleSheetSync from "../components/GoogleSheetSync";
import "../style/Patients.css";

const PatientsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     Fetch Patients (Axios)
  ========================= */
  const fetchData = async () => {
    if (!user?.username) return;

    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/patients/all", {
        headers: {
          username: user.username, // 👈 backend requirement
        },
      });

      setPatients(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch patients", err);
      setError("Failed to load patients");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Load on User Ready
  ========================= */
  useEffect(() => {
    fetchData();
  }, [user?.username]);

  return (
    <div className="main-container" style={{ display: "flex" }}>
      <Sidebar />

      <div className="content" style={{ flex: 1, padding: "20px" }}>
        {loading && <p>⏳ Loading patients...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && (
          <>
            <PatientsSection
              patients={patients}
              fetchData={fetchData}
            />

            {/* 🔽 Google Sheet Sync */}
            <GoogleSheetSync patients={patients} />
          </>
        )}
      </div>
    </div>
  );
};

export default PatientsPage;