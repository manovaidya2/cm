import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "../api/axios";
import "../style/AccountPage.css";

const AccountPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [followUpSearch, setFollowUpSearch] = useState("");
  const [paymentRefs, setPaymentRefs] = useState({});
  const [editMode, setEditMode] = useState({});

  const statusOptions = ["In Progress", "Payment Done", "Not Take Medicine"];

  const fetchData = async () => {
    try {
      const res = await axios.get("api/account/all");
      const recordsWithFallbackId = res.data.map((r, i) => ({
        ...r,
        displayId: r.displayId || `M${String(i + 1).padStart(2, "0")}`,
      }));
      setRecords(recordsWithFallbackId);
    } catch (err) {
      console.error("Error fetching account data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`api/account/update/${id}`, { actionStatus: newStatus });
      setRecords((prev) =>
        prev.map((r) => (r._id === id ? { ...r, action: newStatus } : r))
      );
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const handleReferenceSave = async (record) => {
    const refNumber = paymentRefs[record._id];
    if (!refNumber || refNumber.trim() === "") {
      return alert("Please enter a payment reference number.");
    }

    try {
      if (record.referenceNumber) {
        await axios.put(`api/account/update-reference/${record._id}`, {
          referenceNumber: refNumber.trim(),
        });
      } else {
        await axios.post("api/account/add-full", {
          assistantId: record._id,
          displayId: record.displayId,
          patientName: record.patientName,
          contact: record.contact,
          date: record.date,
          time: record.time,
          location: record.location,
          message: record.message,
          notes: record.notes,
          paymentStatus: record.status,
          details: record.details,
          medicineExplain: record.medicineExplain,
          nextFollowUp: record.nextFollowUp,
          action: record.action,
          referenceNumber: refNumber.trim(),
        });
      }

      setRecords((prev) =>
        prev.map((r) =>
          r._id === record._id
            ? { ...r, referenceNumber: refNumber.trim() }
            : r
        )
      );
      setEditMode((prev) => ({ ...prev, [record._id]: false }));
      alert("✅ Reference saved successfully.");
    } catch (err) {
      console.error("Error saving reference:", err);
      alert("❌ Failed to save reference.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`api/account/delete/${id}`);
      setRecords((prev) => prev.filter((r) => r._id !== id));
      alert("✅ Record deleted.");
    } catch (err) {
      console.error("Error deleting record", err);
      alert("❌ Failed to delete record.");
    }
  };

 const formatTime12h = (time) => {
  if (!time || typeof time !== "string") return "-";

  // If already in "01:00 PM - 01:30 PM" format, return it as-is
  if (time.includes("AM") || time.includes("PM")) return time;

  // Try to parse HH:mm and convert to AM/PM
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute)) return "-";

  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

const formatDateTime12h = (dateTimeStr) => {
  if (!dateTimeStr) return "-";
  const dateObj = new Date(dateTimeStr);
  return dateObj.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};


  const filteredRecords = records.filter((r) => {
    const searchText = search.trim().toLowerCase();
    const followUpText = followUpSearch.trim().toLowerCase();

    if (/^\d{2}$/.test(searchText)) {
      const dayPart = r.date?.split("-")[2];
      if (dayPart !== searchText) return false;
    } else {
      const combined = `
        ${r.displayId || ""}
        ${r.patientName || ""}
        ${r.contact || ""}
        ${r.date || ""}
        ${r.time || ""}
        ${r.location || ""}
        ${r.status || ""}
        ${r.details || ""}
        ${r.medicineExplain || ""}
        ${r.nextFollowUp || ""}
        ${r.action || ""}
        ${r.referenceNumber || ""}
      `.toLowerCase();
      if (!combined.includes(searchText)) return false;
    }

    if (followUpText && !(r.nextFollowUp || "").toLowerCase().includes(followUpText)) {
      return false;
    }

    return true;
  });

  return (
    <div className="account-modern-page">
      <Sidebar />
      <div className="account-modern-content">
        <h2 className="account-modern-title">📑 Account Records</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label style={{ fontWeight: "bold" }}>🔍 Search All Fields or Enter Day (dd)</label>
          <input
            type="text"
            className="account-modern-search"
            placeholder="Search here..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <label style={{ fontWeight: "bold", marginTop: "10px" }}>📅 Filter by Follow Up Date</label>
          <input
            type="date"
            className="account-modern-search"
            value={followUpSearch}
            onChange={(e) => setFollowUpSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading data...</p>
        ) : (
          <div className="account-modern-table-wrapper">
            <table className="account-modern-table">
              <thead>
                <tr>
                  <th>Display ID</th>
                  <th>Patient Name</th>
                  <th>Contact</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Payment</th>
                  <th>Payment Details</th>
                  {/* <th>Explain</th> */}
                  {/* <th>Follow Up</th> */}
                  <th>Payment Status</th>
                  <th>Reference #</th>
                
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r._id}>
                    <td>{r.displayId}</td>
                    <td>{r.patientName}</td>
                    <td>{r.contact}</td>
                    <td>{r.date}</td>
                    <td>{formatTime12h(r.time)}</td>
                    <td>{r.location}</td>
                    <td>{r.status}</td>
                    <td>{r.details || "-"}</td>
                    {/* <td>{r.medicineExplain || "-"}</td> */}
                    {/* <td>{formatDateTime12h(r.nextFollowUp)}</td> */}

                    <td>
                      <select
                        className="status-dropdown"
                        value={r.action}
                        onChange={(e) => handleStatusChange(r._id, e.target.value)}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {r.action === "Payment Done" && (
                        <div className="ref-input-group-modern">
                          <input
                            type="text"
                            className="ref-input"
                            placeholder="Enter Reference #"
                            value={
                              editMode[r._id] || !r.referenceNumber
                                ? paymentRefs[r._id] ?? r.referenceNumber ?? ""
                                : r.referenceNumber ?? ""
                            }
                            onChange={(e) =>
                              setPaymentRefs((prev) => ({
                                ...prev,
                                [r._id]: e.target.value,
                              }))
                            }
                            disabled={!(editMode[r._id] || !r.referenceNumber)}
                          />
                          {editMode[r._id] || !r.referenceNumber ? (
                            <button className="save-btn" onClick={() => handleReferenceSave(r)}>
                              Save
                            </button>
                          ) : (
                            <button
                              className="edit-btn"
                              onClick={() => {
                                setEditMode((prev) => ({ ...prev, [r._id]: true }));
                                setPaymentRefs((prev) => ({
                                  ...prev,
                                  [r._id]: r.referenceNumber ?? "",
                                }));
                              }}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
