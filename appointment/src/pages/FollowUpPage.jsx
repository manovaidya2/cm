import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../style/FollowUpPage.css";
import Sidebar from "../components/Sidebar";
import FollowUpSheetSync from "../components/FollowUpSheetSync";    

const FollowUpPage = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [followUps, setFollowUps] = useState({});

  const timeSlots = [
    "11:00am - 11:30am", "11:30am - 12:00pm", "12:00pm - 12:30pm",
    "12:30pm - 1:00pm", "1:00pm - 1:30pm", "1:30pm - 2:00pm",
    "2:00pm - 2:30pm", "2:30pm - 3:00pm", "3:00pm - 3:30pm",
    "3:30pm - 4:00pm", "4:00pm - 4:30pm", "4:30pm - 5:00pm",
    "5:00pm - 5:30pm", "5:30pm - 6:00pm", "6:00pm - 6:30pm",
    "6:30pm - 7:00pm", "7:00pm - 7:30pm", "7:30pm - 8:00pm"
  ];

  useEffect(() => {
    fetchFollowUps();
  }, [search]);

  const fetchFollowUps = async () => {
    try {
      const res = await axios.get(`api/follow-up/records?search=${search}`);
      setRecords(res.data);
    } catch (error) {
      console.error("Failed to fetch follow-up records", error);
    }
  };

  const handleInputChange = (id, field, value) => {
    setFollowUps((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (id) => {
    const data = followUps[id];
    if (!data?.date || !data?.time) {
      alert("Please select both date and time.");
      return;
    }

    try {
      // 1. Save follow-up to DB
      await axios.post("api/follow-up/mark-done", {
        recordId: id,
        followUpDate: data.date,
        followUpTime: data.time,
      });

      // 2. Get record from current state
      const updatedRecord = records.find((r) => r._id === id);

      // 3. Extract connected sheetId
      const sheetUrl = localStorage.getItem("sheetUrl");
      const match = sheetUrl?.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      const sheetId = match ? match[1] : null;

      // 4. Send to Google Sheet
      if (sheetId) {
        await axios.post("api/sync-followup-to-sheet", {
          sheetId,
          record: {
            ...updatedRecord,
            followUpDate: data.date,
            followUpTime: data.time,
          },
        });
      }

      alert("✅ Follow-up saved and synced to Google Sheet.");
      fetchFollowUps();
    } catch (err) {
      console.error(err);
      alert("Failed to save follow-up.");
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
      <FollowUpSheetSync followUpData={records.filter(r => r.followUpDate && r.followUpTime)} />
      <div className="follow-up-container">
        <h2>📋 Follow-Up Records</h2>

        <input
          type="text"
          placeholder="Search by ID, name, contact, location, tracking ID, follow-up..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="follow-up-search"
        />

        <div className="follow-up-table-wrapper">
          <table className="follow-up-table">
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
                <th>Chithi Status</th>
                <th>Package Status</th>
                <th>Courier Status</th>
                <th>Tracking ID</th>
                <th>Follow-up Date</th>
                <th>Follow-up Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="17" style={{ textAlign: "center" }}>
                    No follow-up records found.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec._id}>
                    <td>{rec.displayId}</td>
                    <td>{rec.patientName}</td>
                    <td>{rec.contact}</td>
                    <td>{rec.date}</td>
                    <td>{rec.time}</td>
                    <td>{rec.location}</td>
                    <td>{rec.paymentStatus}</td>
                    <td>{rec.details}</td>
                    <td>{rec.action}</td>
                    <td>{rec.referenceNumber}</td>
                    <td>{rec.chithiStatus}</td>
                    <td>{rec.packageStatus}</td>
                    <td>{rec.courierStatus}</td>
                    <td>{rec.trackingId || "-"}</td>
                    <td>{rec.followUpDate || "-"}</td>
                    <td>{rec.followUpTime || "-"}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <input
                          type="date"
                          value={followUps[rec._id]?.date || ""}
                          onChange={(e) =>
                            handleInputChange(rec._id, "date", e.target.value)
                          }
                          style={{ padding: "5px" }}
                        />
                        <select
                          value={followUps[rec._id]?.time || ""}
                          onChange={(e) =>
                            handleInputChange(rec._id, "time", e.target.value)
                          }
                          style={{ padding: "5px" }}
                        >
                          <option value="">Select Time</option>
                          {timeSlots.map((slot, i) => (
                            <option key={i} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleSubmit(rec._id)}
                          style={{
                            padding: "6px 10px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Submit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FollowUpPage;
