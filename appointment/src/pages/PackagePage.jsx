import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "../api/axios";
import "../style/PackagePage.css";

const PackagePage = () => {
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
  });

  const fetchPackageData = async () => {
    try {
      const res = await axios.get("api/package/all");
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching packaging data:", err);
    }
  };

  useEffect(() => {
    fetchPackageData();
  }, []);

  const handleStatusChange = (id, value) => {
    setStatusUpdates((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmitStatus = async (r) => {
    const selectedStatus = statusUpdates[r._id];
    if (!selectedStatus) return alert("Please select a package status.");

    try {
      await axios.post("api/package/save", {
        ...r,
        packageStatus: selectedStatus,
      });
      alert("✅ Package status updated.");
      fetchPackageData();
    } catch (err) {
      console.error("Failed to save package status:", err);
      alert("❌ Error saving package status.");
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
    <div className="chithi-page">
      <Sidebar />
      <div className="chithi-content">
        <h2 className="chithi-title">📦 Packaging Department</h2>

        {/* 🔍 Search Filters */}
        <h3 className="search-heading">🔍 Search Records</h3>
        <div className="filter-grid">
          {Object.entries(searchFields).map(([field, value]) => (
            <div key={field} className="filter-field">
              {/* Add field-specific heading for date and follow-up */}
              {field === "date" && <label className="filter-label">Appointment Date</label>}
              {field === "nextFollowUp" && <label className="filter-label">Next Follow Up</label>}
              <input
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
                <th>Chithi Status</th>
                <th>Package Status</th>
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
                  <td>
                    <select
                      style={{ width: "160px" }}
                      value={statusUpdates[r._id] ?? r.packageStatus ?? ""}
                      onChange={(e) =>
                        handleStatusChange(r._id, e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Package Done">Package Done</option>
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

export default PackagePage;
