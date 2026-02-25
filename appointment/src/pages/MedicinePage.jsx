import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "../api/axios";
import "../style/MedicinePage.css";

const MedicinePage = () => {
  const [records, setRecords] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});

  const [searchFields, setSearchFields] = useState({
    displayId: "",
    patientName: "",
    contact: "",
    date: "",
    time: "",
    location: "",
    details: "",
    followUp: "",
    referenceNumber: "",
    medicineStatus: "",
  });

  const fetchRecords = async () => {
    try {
      const res = await axios.get("api/medicine/all");
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching medicine data:", err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleStatusChange = (id, value) => {
    setStatusUpdates((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmitStatus = async (r) => {
    const selectedStatus = statusUpdates[r._id];
    if (!selectedStatus) return alert("Please select a status before saving.");

    try {
      await axios.post("api/medicine/save", {
        accountId: r._id,
        displayId: r.displayId,
        patientName: r.patientName,
        contact: r.contact,
        date: r.date,
        time: r.time,
        location: r.location,
        paymentStatus: r.paymentStatus,
        details: r.details,
        medicineExplain: r.medicineExplain,
        nextFollowUp: r.nextFollowUp,
        action: r.action,
        referenceNumber: r.referenceNumber,
        medicineStatus: selectedStatus,
      });
      alert("✅ Medicine status updated.");
      fetchRecords();
    } catch (err) {
      console.error("Failed to update medicine status:", err);
      alert("❌ Error saving medicine status.");
    }
  };

  const filtered = records.filter((r) => {
    return (
      r.displayId?.toLowerCase().includes(searchFields.displayId.toLowerCase()) &&
      r.patientName?.toLowerCase().includes(searchFields.patientName.toLowerCase()) &&
      r.contact?.toLowerCase().includes(searchFields.contact.toLowerCase()) &&
      r.date?.includes(searchFields.date) &&
      r.time?.toLowerCase().includes(searchFields.time.toLowerCase()) &&
      r.location?.toLowerCase().includes(searchFields.location.toLowerCase()) &&
      r.details?.toLowerCase().includes(searchFields.details.toLowerCase()) &&
      r.referenceNumber?.toLowerCase().includes(searchFields.referenceNumber.toLowerCase()) &&
      r.medicineStatus?.toLowerCase().includes(searchFields.medicineStatus.toLowerCase()) &&
      (searchFields.followUp === "" ||
        (r.nextFollowUp &&
          new Date(r.nextFollowUp).toISOString().slice(0, 16) === searchFields.followUp))
    );
  });

  return (
    <div className="medicine-dept-page">
      <Sidebar />
      <div className="medicine-dept-content">
        <h2 className="medicine-dept-title">💊 Medicine Department</h2>

        {/* 🔍 Search Filters */}
        <div className="search-filters">
          {[
            { label: "Display ID", field: "displayId" },
            { label: "Patient Name", field: "patientName" },
            { label: "Contact", field: "contact" },
            { label: "Appointment Date", field: "date", type: "date" },
            { label: "Time", field: "time" },
            { label: "Location", field: "location" },
            { label: "Payment Details", field: "details" },
            { label: "Reference Number", field: "referenceNumber" },
            { label: "Medicine Status", field: "medicineStatus", placeholder: "In Progress / Ready" },
            { label: "Follow Up Date & Time", field: "followUp", type: "datetime-local" },
          ].map(({ label, field, type = "text", placeholder }) => (
            <div className="filter-group" key={field}>
              <label>{label}</label>
              <input
                type={type}
                placeholder={placeholder || `Enter ${label}`}
                value={searchFields[field]}
                onChange={(e) => setSearchFields({ ...searchFields, [field]: e.target.value })}
              />
            </div>
          ))}
        </div>

        {/* 📋 Table */}
        <div className="medicine-dept-table-wrapper">
          <table className="medicine-dept-table">
            <thead>
              <tr>
                <th>Display ID</th>
                <th>Patient Name</th>
                <th>Contact</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Payment Status</th> {/* ✅ Newly added */}
                      {/* ✅ Newly added */}
                <th>Payment Details</th>
                {/* <th>Follow Up</th> */}
                  <th>medicine Payment</th>  
                <th>Reference</th>
                <th>Medicine Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id}>
                  <td>{r.displayId || "-"}</td>
                  <td>{r.patientName || "-"}</td>
                  <td>{r.contact || "-"}</td>
                  <td>{r.date || "-"}</td>
                  <td>{r.time || "-"}</td>
                  <td>{r.location || "-"}</td>
                  <td>{r.paymentStatus || "-"}</td> {/* ✅ show paymentStatus */}
                          {/* ✅ show action */}
                  <td>{r.details || "-"}</td>
                  {/* <td>{r.nextFollowUp ? new Date(r.nextFollowUp).toLocaleString() : "-"}</td> */}
                  <td>{r.action || "-"}</td> 
                  <td>{r.referenceNumber || "-"}</td>
                  <td>
                    <select
                      style={{ width: "180px" }}
                      value={statusUpdates[r._id] ?? r.medicineStatus ?? ""}
                      onChange={(e) => handleStatusChange(r._id, e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Medicine Ready">Medicine Ready</option>
                    </select>
                    <button onClick={() => handleSubmitStatus(r)}>Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicinePage;
