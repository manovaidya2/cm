import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "../api/axios";
import "../style/CourierPage.css";

const CourierPage = () => {
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
   
    action: "",
    referenceNumber: "",
    chithiStatus: "",
    packageStatus: "",
  });

  const fetchCourierData = async () => {
    try {
      const res = await axios.get("api/courier/all");
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching courier data:", err);
    }
  };

  useEffect(() => {
    fetchCourierData();
  }, []);

  const handleCourierStatusChange = (id, value) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [id]: { ...prev[id], courierStatus: value },
    }));
  };

  const handleTrackingIdChange = (id, value) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [id]: { ...prev[id], trackingId: value },
    }));
  };

  const handleSaveCourierStatus = async (record) => {
    const update = statusUpdates[record._id];
    if (!update?.courierStatus) return alert("Select courier status");

    try {
      await axios.post("api/courier/save", {
        ...record,
        courierStatus: update.courierStatus,
        trackingId: update.trackingId || "",
      });
      alert("Courier status updated");
      fetchCourierData();
      setStatusUpdates((prev) => {
        const updated = { ...prev };
        delete updated[record._id];
        return updated;
      });
    } catch (err) {
      console.error("Save error", err);
      alert("Failed to update");
    }
  };

  const filteredRecords = records.filter((r) =>
    Object.entries(searchFields).every(([key, value]) => {
      if (!value) return true;
      if (key === "date" && r.date) {
        const recordDate = new Date(r.date).toISOString().split("T")[0];
        return recordDate === value;
      }
      if (key === "nextFollowUp" && r.nextFollowUp) {
        const followUpDate = new Date(r.nextFollowUp).toISOString().split("T")[0];
        return followUpDate === value;
      }
      return r[key]?.toLowerCase?.().includes(value.toLowerCase());
    })
  );

  return (
    <div className="courier-page">
      <Sidebar />
      <div className="courier-content">
        <h2 className="courier-title">🚚 Courier Department</h2>

        <h3 className="search-heading">🔍 Search Records</h3>
        <div className="filter-grid1">
          {Object.entries(searchFields).map(([field, value]) => (
            <input
              key={field}
              placeholder={`Search ${field}`}
              type={["date", "nextFollowUp"].includes(field) ? "date" : "text"}
              value={value}
              onChange={(e) =>
                setSearchFields((prev) => ({
                  ...prev,
                  [field]: e.target.value,
                }))
              }
            />
          ))}
        </div>

        <div className="courier-table-wrapper">
          <table className="courier-table">
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
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
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
                  <td>{r.chithiStatus || "-"}</td>
                  <td>{r.packageStatus || "-"}</td>
                  <td>
                    <select
                      value={statusUpdates[r._id]?.courierStatus || r.courierStatus || ""}
                      onChange={(e) =>
                        handleCourierStatusChange(r._id, e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Courier Done">Courier Done</option>
                    </select>

                    {(statusUpdates[r._id]?.courierStatus || r.courierStatus) === "Courier Done" && (
                      <>
                        {r.trackingId && !statusUpdates[r._id]?.trackingId ? (
                          <div style={{ marginTop: "6px", fontWeight: "bold", color: "#2d3436" }}>
                            Tracking ID: {r.trackingId}
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Tracking ID"
                            value={statusUpdates[r._id]?.trackingId || ""}
                            onChange={(e) =>
                              handleTrackingIdChange(r._id, e.target.value)
                            }
                            style={{ marginTop: "6px", width: "150px" }}
                          />
                        )}
                      </>
                    )}

                    <button onClick={() => handleSaveCourierStatus(r)}>
                      Save
                    </button>
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

export default CourierPage;
