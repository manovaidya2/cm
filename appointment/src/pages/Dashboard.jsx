// Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Sidebar from "../components/Sidebar";
import PatientsSection from "../components/PatientsSection";
import AppointmentsSection from "../components/AppointmentSection";
import "../style/Dashboard.css";
import "../style/Patients.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaUserFriends,
  FaCalendarAlt,
  FaUserMd,
  FaFileInvoiceDollar,
  FaCapsules,
  FaEnvelopeOpenText,
  FaBox,
  FaTruck,
  FaRedo,
} from "react-icons/fa";
import DashboardStatsChart from "./DashboardStatsChart";

const DashboardHome = ({
  patients,
  appointments,
  assistantData,
  accountData,
  medicineData,
  chithiData,
  packagingData,
  courierData,
  newCounts,
}) => {
  const navigate = useNavigate();

  const rescheduledAppointmentsCount = appointments.filter(
    (app) => app.status === "Rescheduled"
  ).length;

  const handleNavigate = (path, key, data) => {
    localStorage.setItem(`${key}Count`, data.length.toString());
    navigate(path);
  };

  const colorMap = {
    patients: "#3498db",
    appointments: "#2ecc71",
    assistant: "#9b59b6",
    account: "#e67e22",
    medicine: "#1abc9c",
    chithi: "#e84393",
    packaging: "#e74c3c",
    courier: "#f1c40f",
    rescheduled: "#7f8c8d",
  };

  const badgeColorMap = {
    patients: "#0e0e0fff",
    appointments: "#171818ff",
    assistant: "#211625ff",
    account: "#100f0eff",
    medicine: "#060707ff",
    chithi: "#080808ff",
    packaging: "#121111ff",
    courier: "#1b1712ff",
    rescheduled: "#090909ff",
  };

  const renderCard = (label, icon, path, key, data, count) => (
    <div
      className="stat-card always-show"
      onClick={() => handleNavigate(path, key, data)}
      style={{
        backgroundColor: colorMap[key] || "#ccc",
        flex: "1 1 200px",
        minWidth: "180px",
        padding: "16px",
        borderRadius: "12px",
        color: key === "courier" ? "#000" : "#fff",
        cursor: "pointer",
        transition: "transform 0.2s",
        textAlign: "center",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        margin: "8px",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
    >
      <div style={{ fontSize: "24px", marginBottom: "10px" }}>{icon}</div>
      <div style={{ fontSize: "16px", fontWeight: "bold" }}>{label}</div>
      <div style={{ fontSize: "22px", marginTop: "6px" }}>{data.length}</div>
      {count > 0 && (
        <div
          className="new-badge always-visible"
          style={{
            marginTop: "8px",
            display: "inline-block",
            fontSize: "12px",
            padding: "4px 8px",
            backgroundColor: badgeColorMap[key] || "rgba(255,255,255,0.3)",
            color: "#fff",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          +{count}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="dashboard-header">
        <h1>🩺 Clinic Management Dashboard</h1>
        <p>Manage patients, appointments, and progress stages.</p>
      </div>
      <div
        className="stats-overview"
       
      >
        {renderCard("Patients", <FaUserFriends />, "/patients", "patients", patients, newCounts.patients)}
        {renderCard("Appointments", <FaCalendarAlt />, "/appointments", "appointments", appointments, newCounts.appointments)}
        {renderCard("Assistant Doctor", <FaUserMd />, "/assistant-doctor", "assistant", assistantData, newCounts.assistant)}
        {renderCard("Account", <FaFileInvoiceDollar />, "/account", "account", accountData, newCounts.account)}
        {renderCard("Medicine", <FaCapsules />, "/medicine", "medicine", medicineData, newCounts.medicine)}
        {renderCard("Chithi", <FaEnvelopeOpenText />, "/chithi", "chithi", chithiData, newCounts.chithi)}
        {renderCard("Packaging", <FaBox />, "/packaging", "packaging", packagingData, newCounts.packaging)}
        {renderCard("Courier", <FaTruck />, "/courier", "courier", courierData, newCounts.courier)}

        {/* Rescheduled Card */}
        <div
          onClick={() => navigate("/appointments?status=Rescheduled")}
          style={{
            backgroundColor: colorMap["rescheduled"],
            flex: "1 1 200px",
            minWidth: "180px",
            padding: "16px",
            borderRadius: "12px",
            color: "#fff",
            cursor: "pointer",
            transition: "transform 0.2s",
            textAlign: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            margin: "8px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>
            <FaRedo />
          </div>
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>Rescheduled</div>
          <div style={{ fontSize: "22px", marginTop: "6px" }}>{rescheduledAppointmentsCount}</div>
          {rescheduledAppointmentsCount > 0 && (
            <div
              style={{
                marginTop: "8px",
                display: "inline-block",
                fontSize: "12px",
                padding: "4px 8px",
                backgroundColor: badgeColorMap["rescheduled"],
                color: "#fff",
                borderRadius: "6px",
                fontWeight: "bold",
              }}
            >
              +{rescheduledAppointmentsCount}
            </div>
          )}
        </div>
      </div>
       <DashboardStatsChart
  patients={patients}
  appointments={appointments}
  assistantData={assistantData}
  accountData={accountData}
  medicineData={medicineData}
  chithiData={chithiData}
  packagingData={packagingData}
  courierData={courierData}
  rescheduledCount={rescheduledAppointmentsCount}
/>
    </>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [assistantData, setAssistantData] = useState([]);
  const [accountData, setAccountData] = useState([]);
  const [medicineData, setMedicineData] = useState([]);
  const [chithiData, setChithiData] = useState([]);
  const [packagingData, setPackagingData] = useState([]);
  const [courierData, setCourierData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const getNewCount = (key, data) => {
    const prev = parseInt(localStorage.getItem(`${key}Count`) || "0", 10);
    return Math.max(0, data.length - prev);
  };

  const fetchData = async () => {
    try {
      const [pRes, aRes, asRes, acRes, mRes, cRes, pkgRes, courRes] = await Promise.all([
        axios.get("api/patients/all", { headers: { username: user.username } }),
        axios.get("api/appointments/all", { headers: { username: user.username } }),
        axios.get("api/assistant/confirmed"),
        axios.get("api/account/all"),
        axios.get("api/medicine/all"),
        axios.get("api/chithi/all"),
        axios.get("api/package/all"),
        axios.get("api/courier/all"),
      ]);

      setPatients(pRes.data || []);
      setAppointments(aRes.data || []);
      setAssistantData(asRes.data || []);
      setAccountData(acRes.data || []);
      setMedicineData(mRes.data || []);
      setChithiData(cRes.data || []);
      setPackagingData(pkgRes.data || []);
      setCourierData(courRes.data || []);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const newCounts = {
    patients: getNewCount("patients", patients),
    appointments: getNewCount("appointments", appointments),
    assistant: getNewCount("assistant", assistantData),
    account: getNewCount("account", accountData),
    medicine: getNewCount("medicine", medicineData),
    chithi: getNewCount("chithi", chithiData),
    packaging: getNewCount("packaging", packagingData),
    courier: getNewCount("courier", courierData),
  };

  const filteredPatients = selectedStatus
    ? patients.filter((p) => (p.status || "In Progress") === selectedStatus)
    : patients;

  const filteredAppointments = selectedStatus
    ? appointments.filter((a) => a.status === selectedStatus)
    : appointments;

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} /> 
      <div
        className="dashboard-container"
        style={{ marginLeft: "240px", padding: "30px", width: "100%" }}
      >
        <div
          className="dashboard-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
        >
          <h2>Welcome, {user.username}</h2>
        </div>

        {activeSection === "home" && (
          <DashboardHome
            patients={patients}
            appointments={appointments}
            assistantData={assistantData}
            accountData={accountData}
            medicineData={medicineData}
            chithiData={chithiData}
            packagingData={packagingData}
            courierData={courierData}
            newCounts={newCounts}
          />
        )}

        {activeSection === "patients" && (
          <PatientsSection patients={filteredPatients} fetchData={fetchData} />
        )}

        {activeSection === "appointments" && (
          <AppointmentsSection
            patients={patients}
            appointments={filteredAppointments}
            fetchData={fetchData}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
