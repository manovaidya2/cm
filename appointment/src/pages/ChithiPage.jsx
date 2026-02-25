import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "../api/axios";
import "../style/Chithi.css";

const ChithiPage = () => {
  const [records, setRecords] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});

  const [searchFields, setSearchFields] = useState({
    displayId: "",
    patientName: "",
    contact: "",
    date: "",
    time: "",
    location: "",
    paymentStatus: "",
    details: "",
    followUp: "",
    referenceNumber: "",
    action: "",
    chithiStatus: "",
  });

  const fetchRecords = async () => {
    try {
      const res = await axios.get("api/chithi/all");
      const filtered = res.data.filter((r) => r.medicineStatus === "Medicine Ready");
      setRecords(filtered);
    } catch (err) {
      console.error("Error fetching chithi data:", err);
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
      await axios.post("api/chithi/save", {
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
       
        referenceNumber: r.referenceNumber,
        action: r.action,
        chithiStatus: selectedStatus,
      });
      alert("✅ Chithi status updated.");
      fetchRecords();
    } catch (err) {
      console.error("Failed to update chithi status:", err);
      alert("❌ Error saving chithi status.");
    }
  };

  const filtered = records.filter((r) => {
    return (
      (!searchFields.displayId || r.displayId?.toLowerCase().includes(searchFields.displayId.toLowerCase())) &&
      (!searchFields.patientName || r.patientName?.toLowerCase().includes(searchFields.patientName.toLowerCase())) &&
      (!searchFields.contact || r.contact?.toLowerCase().includes(searchFields.contact.toLowerCase())) &&
      (!searchFields.date || r.date?.includes(searchFields.date)) &&
      (!searchFields.time || r.time?.toLowerCase().includes(searchFields.time.toLowerCase())) &&
      (!searchFields.location || r.location?.toLowerCase().includes(searchFields.location.toLowerCase())) &&
      (!searchFields.paymentStatus || r.paymentStatus?.toLowerCase().includes(searchFields.paymentStatus.toLowerCase())) &&
      (!searchFields.details || r.details?.toLowerCase().includes(searchFields.details.toLowerCase())) &&
      (!searchFields.action || r.action?.toLowerCase().includes(searchFields.action.toLowerCase())) &&
      (!searchFields.referenceNumber || r.referenceNumber?.toLowerCase().includes(searchFields.referenceNumber.toLowerCase())) &&
      (!searchFields.chithiStatus || r.chithiStatus?.toLowerCase().includes(searchFields.chithiStatus.toLowerCase())) &&
      (!searchFields.followUp ||
        (r.nextFollowUp &&
          new Date(r.nextFollowUp).toISOString().slice(0, 16) === searchFields.followUp))
    );
  });

  return (
    <div className="chithi-page">
      <Sidebar />
      <div className="chithi-content">
        <h2 className="chithi-title">📨 Chithi Department</h2>

        <div className="search-filters">
          {[
            ["Display ID", "displayId"],
            ["Patient Name", "patientName"],
            ["Contact", "contact"],
            ["Appointment Date", "date", "date"],
            ["Time", "time"],
            ["Location", "location"],
            ["Payment Status", "paymentStatus"],
            ["Payment Details", "details"],
          
            ["Reference Number", "referenceNumber"],
            ["Medicine Payment", "action"],
            ["Chithi Status", "chithiStatus"],
          ].map(([label, key, type]) => (
            <div className="filter-group" key={key}>
              <label>{label}</label>
              <input
                type={type || "text"}
                placeholder={`Enter ${label}`}
                value={searchFields[key]}
                onChange={(e) =>
                  setSearchFields({ ...searchFields, [key]: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        <div className="chithi-table-wrapper">
          <table className="chithi-table">
            <thead>
              <tr>
                <th>Display ID</th>
                <th>Patient Name</th>
                <th>Contact</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Payment Status</th>
                <th>Payment Details</th>
               
                <th>Medicine Payment</th>
                <th>Reference</th>
                <th>Medicine Status</th> {/* ✅ Added */}
                <th>Chithi Status</th>
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
                  <td>{r.paymentStatus || "-"}</td>
                  <td>{r.details || "-"}</td>
                 
                  <td>{r.action || "-"}</td>
                  <td>{r.referenceNumber || "-"}</td>
                  <td>{r.medicineStatus || "-"}</td> {/* ✅ Added */}
                  <td>
                    <select
                      style={{ width: "180px" }}
                      value={statusUpdates[r._id] ?? r.chithiStatus ?? ""}
                      onChange={(e) => handleStatusChange(r._id, e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Chithi Done">Chithi Done</option>
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

export default ChithiPage;
