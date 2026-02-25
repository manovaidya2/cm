import React, { useEffect, useState } from "react";
import "../style/AppointmentTable.css";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const statusOptions = ["Scheduled", "Cancelled", "Rescheduled"];

const AppointmentTable = ({ appointments }) => {
  const [localAppointments, setLocalAppointments] = useState([]);
  const { user } = useAuth();
  const [rescheduleInfo, setRescheduleInfo] = useState({});
  const [filterStatus, setFilterStatus] = useState(""); // 👈 new filter

  useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === "Rescheduled") {
      setRescheduleInfo((prev) => ({
        ...prev,
        [id]: { date: "", time: "", location: "" },
      }));
    } else {
      try {
        await axios.patch(`api/appointments/${id}/status`, { status: newStatus });
        setLocalAppointments((prev) =>
          prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
        );
      } catch (error) {
        alert("Failed to update appointment status");
      }
    }
  };

  const handleRescheduleSubmit = async (id) => {
    const { date, time, location } = rescheduleInfo[id];
    if (!date || !time || !location) {
      alert("Please select date, time and location to reschedule.");
      return;
    }

    const isSlotTaken = localAppointments.some(
      (app) => app._id !== id && app.date === date && app.time === time
    );
    if (isSlotTaken) {
      alert("This time slot is already booked. Please choose another.");
      return;
    }

    try {
      await axios.patch(`api/appointments/${id}/reschedule`, {
        date,
        time,
        location,
        status: "Rescheduled",
      });

      setLocalAppointments((prev) =>
        prev.map((app) =>
          app._id === id ? { ...app, status: "Rescheduled", date, time, location } : app
        )
      );

      setRescheduleInfo((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (error) {
      alert("Failed to reschedule appointment.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this appointment?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`api/appointments/${id}`, {
        headers: { username: user.username },
      });
      setLocalAppointments((prev) => prev.filter((app) => app._id !== id));
    } catch (error) {
      alert("Failed to delete appointment");
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Appointment Records", 14, 10);
    const tableData = localAppointments.map((app) => [
      app.patientId?.name || "N/A",
      app.date,
      app.time,
      app.location || "N/A",
      app.message || "N/A",
      app.notes || "N/A",
      app.status,
    ]);
    autoTable(doc, {
      head: [["Patient", "Date", "Time", "Location", "Message", "Notes", "Status"]],
      body: tableData,
    });
    doc.save("appointments.pdf");
  };

  const exportToExcel = () => {
    const worksheetData = localAppointments.map((app) => ({
      Patient: app.patientId?.name || "N/A",
      Date: app.date,
      Time: app.time,
      Location: app.location || "N/A",
      Message: app.message || "N/A",
      Notes: app.notes || "N/A",
      Status: app.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "appointments.xlsx");
  };

  return (
    <div className="appointment-card table-card">
      <h2>📋 Appointment Records</h2>

      <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
        <button onClick={exportToPDF} className="export-button">Export to PDF</button>
        <button onClick={exportToExcel} className="export-button">Export to Excel</button>
      </div>

      {/* 👇 Filter Dropdown */}
      <div style={{ marginBottom: "15px" }}>
        <label>Status Filter: </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "6px", marginLeft: "8px" }}
        >
          <option value="">All</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="appointment-table-container">
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              <th>Message</th>
              <th>Notes</th>
              <th>Status</th>
              {user.role === "admin" && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {localAppointments.filter((app) => !filterStatus || app.status === filterStatus).length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No appointments found
                </td>
              </tr>
            ) : (
              localAppointments
                .filter((app) => !filterStatus || app.status === filterStatus)
                .map((app) => (
                  <tr key={app._id}>
                    <td>
                      {app.patientId?.name || "N/A"}{" "}
                      {app.patientId?.contact ? `(${app.patientId.contact})` : ""}
                    </td>
                    <td>{app.date}</td>
                    <td>{app.time}</td>
                    <td>{app.location || "N/A"}</td>
                    <td>{app.message || "N/A"}</td>
                    <td>{app.notes || "N/A"}</td>
                    <td>
                      <select
                        className="status-dropdown"
                        value={rescheduleInfo[app._id] ? "Rescheduled" : app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {rescheduleInfo[app._id] && (
                        <div className="reschedule-inputs" style={{ marginTop: "10px" }}>
                          <input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={rescheduleInfo[app._id].date}
                            onChange={(e) =>
                              setRescheduleInfo((prev) => ({
                                ...prev,
                                [app._id]: {
                                  ...prev[app._id],
                                  date: e.target.value,
                                },
                              }))
                            }
                          />

                          <select
                            value={rescheduleInfo[app._id].time}
                            onChange={(e) =>
                              setRescheduleInfo((prev) => ({
                                ...prev,
                                [app._id]: {
                                  ...prev[app._id],
                                  time: e.target.value,
                                },
                              }))
                            }
                            style={{ marginLeft: "8px", padding: "6px" }}
                          >
                            <option value="">Select time</option>
                            {[
                              "11:00 AM - 11:30 AM",
                              "11:30 AM - 12:00 PM",
                              "12:00 PM - 12:30 PM",
                              "12:30 PM - 01:00 PM",
                              "01:00 PM - 01:30 PM",
                              "01:30 PM - 02:00 PM",
                              "02:00 PM - 02:30 PM",
                              "02:30 PM - 03:00 PM",
                              "03:00 PM - 03:30 PM",
                              "03:30 PM - 04:00 PM",
                              "04:00 PM - 04:30 PM",
                              "04:30 PM - 05:00 PM",
                              "05:00 PM - 05:30 PM",
                              "05:30 PM - 06:00 PM",
                              "06:00 PM - 06:30 PM",
                              "06:30 PM - 07:00 PM",
                              "07:00 PM - 07:30 PM",
                              "07:30 PM - 08:00 PM",
                            ].map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            placeholder="Enter location"
                            value={rescheduleInfo[app._id].location}
                            onChange={(e) =>
                              setRescheduleInfo((prev) => ({
                                ...prev,
                                [app._id]: {
                                  ...prev[app._id],
                                  location: e.target.value,
                                },
                              }))
                            }
                            style={{ marginLeft: "8px", padding: "6px", marginTop: "8px" }}
                          />

                          <button
                            className="reschedule-button"
                            onClick={() => handleRescheduleSubmit(app._id)}
                            style={{ marginLeft: "10px" }}
                          >
                            Reschedule
                          </button>
                        </div>
                      )}
                    </td>

                    {user.role === "admin" && (
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(app._id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentTable;
