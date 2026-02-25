import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../style/AssistantDoctorPage.css";

const AssistantDoctorPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState({});
  const [savedStatus, setSavedStatus] = useState({});
  const [editMode, setEditMode] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const medicineExplainOptions = ["yes", "no"];

  useEffect(() => {
    const fetchConfirmedAppointments = async () => {
      try {
        const res = await axios.get("api/assistant/confirmed", {
          headers: { username: user?.username },
        });

        setAppointments(res.data);

        const initialData = {};
        res.data.forEach((a) => {
          initialData[a._id] = {
            status: a.paymentStatus || "",
            details: a.paymentDetails || "",
            medicineExplain: a.medicineExplain || "",
            nextFollowUp: a.nextFollowUp || "",
            displayId: a.displayId || "",
            isDisplayIdLocked: !!a.displayId,
          };
        });

        setPaymentInfo(initialData);
      } catch (err) {
        console.error("Error fetching confirmed appointments", err);
      }
    };

    if (user?.username) fetchConfirmedAppointments();
  }, [user]);

  const handleChange = (id, key, value) => {
    setPaymentInfo((prev) => ({
      ...prev,
      [id]: { ...prev[id], [key]: value },
    }));
    setSavedStatus((prev) => ({ ...prev, [id]: false }));
  };

  const handleSave = async (id) => {
    const data = paymentInfo[id];
    const appointment = appointments.find((a) => a._id === id);

    if (!data.displayId) return alert("Display ID is required.");

    const isDuplicate = Object.entries(paymentInfo).some(
      ([otherId, otherData]) =>
        otherId !== id &&
        otherData.displayId.trim().toLowerCase() === data.displayId.trim().toLowerCase()
    );

    if (isDuplicate) return alert("Duplicate Display ID detected. It must be unique.");

    try {
      await axios.post(`api/assistant/payment/${id}`, {
        ...data,
        username: user?.username,
        displayId: data.displayId.trim(),
      });

      setSavedStatus((prev) => ({ ...prev, [id]: true }));
      setPaymentInfo((prev) => ({
        ...prev,
        [id]: { ...prev[id], isDisplayIdLocked: true },
      }));

      alert("Saved successfully!");
    } catch (err) {
      if (err.response?.status === 409) {
        alert("Display ID already exists. Choose a unique one.");
      } else {
        console.error("Error saving:", err);
        alert("Save failed.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await axios.delete(`api/assistant/delete/${id}`);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
      const updatedInfo = { ...paymentInfo };
      delete updatedInfo[id];
      setPaymentInfo(updatedInfo);
      alert("Deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete the record.");
    }
  };

  const toggleEdit = (id) => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAppointments = appointments.filter((a) => {
    const data = paymentInfo[a._id] || {};
    const search = searchTerm.toLowerCase();

    return (
      (data.displayId || "").toLowerCase().includes(search) ||
      (a.patientId?.name || "").toLowerCase().includes(search) ||
      (a.patientId?.contact || "").toLowerCase().includes(search) ||
      (a.date || "").toLowerCase().includes(search) ||
      (data.status || "").toLowerCase().includes(search) ||
      (data.nextFollowUp || "").toLowerCase().includes(search)
    );
  });

  return (
    <div className="assistant-doctor-page">
      <Sidebar />
      <div className="assistant-doctor-content">
        <h2 className="assistant-title">👨‍⚕️ Assistant Doctor</h2>

        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search by ID, Name, Contact, Date, Status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="assistant-table-wrapper">
          <table className="assistant-doctor-table">
            <thead>
              <tr>
                <th>Display ID</th>
                <th>Patient Name</th>
                <th>Contact</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Message</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Details</th>
                {/* <th>Medicine Explain</th>
                <th>Next Follow Up</th> */}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((a) => {
                const id = a._id;
                const data = paymentInfo[id] || {};
                const isSaved = savedStatus[id];

                return (
                  <tr key={id}>
                    <td>
                      <input
                        type="text"
                        value={data.displayId || ""}
                        onChange={(e) => handleChange(id, "displayId", e.target.value)}
                        disabled={data.isDisplayIdLocked}
                      />
                    </td>
                    <td>{a.patientId?.name || "N/A"}</td>
                    <td>{a.patientId?.contact || "N/A"}</td>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td>{a.location}</td>
                    <td>{a.message}</td>
                    <td>{a.notes}</td>
                    <td>
                      <select
                        value={data.status || ""}
                        onChange={(e) => handleChange(id, "status", e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="Paid">Paid</option>
                        <option value="Not Paid">Not Paid</option>
                      </select>
                    </td>
                    <td>
                      {data.status === "Paid" && (
                        <input
                          type="text"
                          value={data.details || ""}
                          onChange={(e) => handleChange(id, "details", e.target.value)}
                        />
                      )}
                    </td>
                    {/* <td>
                      {editMode[id] ? (
                        <select
                          value={data.medicineExplain || ""}
                          onChange={(e) => handleChange(id, "medicineExplain", e.target.value)}
                        >
                          <option value="">Select</option>
                          {medicineExplainOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        data.medicineExplain || "-"
                      )}
                    </td> */}
                   {/* <td>
  {editMode[id] ? (
    <input
      type="datetime-local"
      value={data.nextFollowUp || ""}
      onChange={(e) => handleChange(id, "nextFollowUp", e.target.value)}
    />
  ) : data.nextFollowUp ? (
    new Date(data.nextFollowUp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // 👈 ensures 12-hour format with AM/PM
    })
  ) : (
    "-"
  )}
</td> */}


                   <td>
  <div className="action-buttons">
    <button
      onClick={() => handleSave(id)}
      disabled={!data.displayId || (data.status === "Paid" && !data.details)}
    >
      Save
    </button>
    <button onClick={() => toggleEdit(id)}>
      {editMode[id] ? "Cancel" : "Edit"}
    </button>
    {user?.role === "admin" && (
      <button
        className="delete-btn"
        onClick={() => handleDelete(id)}
      >
        Delete
      </button>
    )}
  </div>
</td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssistantDoctorPage;
