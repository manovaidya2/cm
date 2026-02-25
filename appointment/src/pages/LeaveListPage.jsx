import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../style/LeaveListPage.css";

const statusOptions = ["Pending", "Approved", "Rejected"];

const LeaveListPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await axios.get("api/leaves");
        setLeaves(res.data);
        setFilteredLeaves(res.data);
      } catch {
        setError("Failed to fetch leaves");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  const handleChange = (id, field, value) => {
    setLeaves((prev) =>
      prev.map((leave) =>
        leave._id === id ? { ...leave, [field]: value } : leave
      )
    );
    setFilteredLeaves((prev) =>
      prev.map((leave) =>
        leave._id === id ? { ...leave, [field]: value } : leave
      )
    );
  };

  const handleSave = async (id) => {
    const leave = leaves.find((l) => l._id === id);
    if (!leave) return;

    setSavingId(id);
    try {
      const res = await axios.post(`api/leaves/${id}/status`, {
        status: leave.status,
        message: leave.message || "",
      });

      // Update local leaves and filteredLeaves
      setLeaves((prev) =>
        prev.map((l) =>
          l._id === id
            ? {
                ...l,
                status: res.data.statusUpdate.status,
                message: res.data.statusUpdate.message,
                statusUpdated: res.data.statusUpdate.updatedAt,
              }
            : l
        )
      );
      setFilteredLeaves((prev) =>
        prev.map((l) =>
          l._id === id
            ? {
                ...l,
                status: res.data.statusUpdate.status,
                message: res.data.statusUpdate.message,
                statusUpdated: res.data.statusUpdate.updatedAt,
              }
            : l
        )
      );

      alert("Leave status updated successfully");
    } catch {
      alert("Failed to update leave status");
    } finally {
      setSavingId(null);
    }
  };

  // Search filter by name, designation or reason
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (!value) {
      setFilteredLeaves(leaves);
      return;
    }

    const filtered = leaves.filter(
      (leave) =>
        leave.name.toLowerCase().includes(value) ||
        leave.designation.toLowerCase().includes(value) ||
        leave.leaveReason.toLowerCase().includes(value)
    );
    setFilteredLeaves(filtered);
  };

  // Back button handler (simple history.back)
  const handleBack = () => {
    window.history.back();
  };

  if (loading) return <p className="loading-text">Loading leaves...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="container">
  <header className="page-header">
    <button className="back-btn1" onClick={handleBack} aria-label="Go Back">
      ← Back
    </button>

    <h2 className="title">Leave List</h2>

    <input
      type="search"
      placeholder="Search by name, designation, or reason..."
      value={searchTerm}
      onChange={handleSearch}
      className="search-input"
      aria-label="Search leaves"
    />
  </header>

      {filteredLeaves.length === 0 ? (
        <p className="no-data">No leaves found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="leave-table">
            <thead>
              <tr>
                {[
                  "Name",
                  "Designation",
                  "Applied Date",
                  "From",
                  "To",
                  "Reason",
                  "Status",
                  "Message",
                  "Last Updated",
                  "Action",
                ].map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{leave.name}</td>
                  <td>{leave.designation}</td>
                  <td>{leave.date}</td>
                  <td>{leave.fromDate}</td>
                  <td>{leave.toDate}</td>
                  <td>{leave.leaveReason}</td>
                  <td>
                    <select
                      className={`status-select status-${leave.status.toLowerCase()}`}
                      value={leave.status}
                      onChange={(e) =>
                        handleChange(leave._id, "status", e.target.value)
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <textarea
                      value={leave.message || ""}
                      onChange={(e) =>
                        handleChange(leave._id, "message", e.target.value)
                      }
                      rows={2}
                      placeholder="Add a message"
                      className="message-textarea"
                    />
                  </td>
                  <td>
                    {leave.statusUpdated
                      ? new Date(leave.statusUpdated).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    <button
                      onClick={() => handleSave(leave._id)}
                      disabled={savingId === leave._id}
                      className={`save-btn ${
                        savingId === leave._id ? "saving" : ""
                      }`}
                    >
                      {savingId === leave._id ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveListPage;
