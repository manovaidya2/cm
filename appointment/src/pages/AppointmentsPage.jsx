import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useLocation } from "react-router-dom";
import "../style/AppointmentTable.css";

const generateTimeSlots = () => {
  const slots = [];
  const start = 11 * 60;
  const end = 20 * 60;
  for (let mins = start; mins < end; mins += 30) {
    const format = (totalMins) => {
      let h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
    };
    const startLabel = format(mins);
    const endLabel = format(mins + 30);
    slots.push(`${startLabel} - ${endLabel}`);
  }
  return slots;
};

const AppointmentsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const defaultStatus = searchParams.get("status") || "";

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: "",
    date: "",
    time: "",
    notes: "",
    location: "",
    message: "",
  });
  const [filterStatus, setFilterStatus] = useState(defaultStatus);
  const [filterName, setFilterName] = useState("");
  const [filterContact, setFilterContact] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ id: "", date: "", time: "", location: "" });

  const timeSlots = generateTimeSlots();
  const today = new Date().toISOString().split("T")[0];

  const fetchData = async () => {
    try {
      const [res1, res2, res3] = await Promise.all([
        axios.get("api/appointments/all", { headers: { username: user?.username } }),
        axios.get("api/patients/all", { headers: { username: user?.username } }),
        axios.get("api/google-patients/all", { headers: { username: user?.username } }),
      ]);
      setAppointments(res1.data);
      const mergedPatients = [...res2.data, ...res3.data.map(p => ({ ...p, isGoogle: true }))];
      setPatients(mergedPatients);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    if (user?.username) fetchData();
  }, [user]);

  const eligiblePatients = patients.filter(
    (p) => p.status === "Payment Done" || p.status === "Scheduled"
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { patientId, date, time } = formData;
    if (!patientId || !date || !time) return alert("Please fill all required fields");

    const isSlotTaken = appointments.some(
      (appt) => appt.date === date && appt.time === time
    );
    if (isSlotTaken) return alert("This time slot is already booked.");

    try {
      await axios.post("api/appointments/add", formData, {
        headers: { username: user?.username },
      });
      setFormData({ patientId: "", date: "", time: "", notes: "", location: "", message: "" });
      fetchData();
    } catch (err) {
      console.error("Error saving appointment", err);
      alert("Failed to schedule appointment");
    }
  };

  const handleRescheduleOpen = (appointment) => {
    setModalData({
      id: appointment._id,
      date: appointment.date,
      time: appointment.time,
      location: appointment.location,
    });
    setShowModal(true);
  };

  const handleRescheduleConfirm = async () => {
    const { id, date, time, location } = modalData;
    if (!date || !time || !location) return alert("All fields are required");

    const isSlotTaken = appointments.some(
      (a) => a._id !== id && a.date === date && a.time === time
    );
    if (isSlotTaken) return alert("This time slot is already booked.");

    try {
      await axios.patch(`api/appointments/${id}/reschedule`, {
        date,
        time,
        location,
        status: "Rescheduled",
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Reschedule failed", err);
      alert("Failed to reschedule");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await axios.delete(`api/appointments/${id}`, {
        headers: { username: user?.username, role: user?.role },
      });
      fetchData();
    } catch (err) {
      alert("Failed to delete appointment");
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Appointment Records", 14, 10);
    const tableData = appointments.map((app) => [
      app.patientId?.name || "N/A",
      app.patientId?.contact || "N/A",
      app.date,
      app.time,
      app.location || "N/A",
      app.message || "N/A",
      app.notes || "N/A",
      app.status,
    ]);
    autoTable(doc, {
      head: [["Patient", "Contact", "Date", "Time", "Location", "Message", "Notes", "Status"]],
      body: tableData,
    });
    doc.save("appointments.pdf");
  };

  const exportToExcel = () => {
    const worksheetData = appointments.map((app) => ({
      Patient: app.patientId?.name || "N/A",
      Contact: app.patientId?.contact || "N/A",
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
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "appointments.xlsx");
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesStatus = !filterStatus || a.status.trim() === filterStatus;
    const matchesName = !filterName || a.patientId?.name?.toLowerCase().includes(filterName.toLowerCase());
    const matchesContact = !filterContact || a.patientId?.contact?.includes(filterContact);
    const matchesDate = !filterDate || a.date === filterDate;
    const matchesLocation = !filterLocation || a.location === filterLocation;
    return matchesStatus && matchesName && matchesContact && matchesDate && matchesLocation;
  });

  return (
    <div className="appointments-container">
      <Sidebar />
      <div className="appointments-content">
        <h2 className="appointments-title">🕕 Schedule an Appointment</h2>

        {filterStatus !== "Rescheduled" && (
          <form className="appointments-form" onSubmit={handleSubmit}>
            <select name="patientId" value={formData.patientId} onChange={handleChange} required>
              <option value="">Select Patient</option>
              {eligiblePatients.map((p) => (
                <option key={p._id} value={p._id}>
                  {`${p.name} (${p.contact})`}
                </option>
              ))}
            </select>
            <input type="date" name="date" min={today} value={formData.date} onChange={handleChange} required />
            <select name="time" value={formData.time} onChange={handleChange} required>
              <option value="">Select Time</option>
              {timeSlots.map((slot, i) => (
                <option key={i} value={slot}>{slot}</option>
              ))}
            </select>
            <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
            <textarea name="message" placeholder="Message for patient" value={formData.message} onChange={handleChange}></textarea>
            <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange}></textarea>
            <button type="submit">➕ Schedule</button>
          </form>
        )}

        <div className="appointments-controls">
          <button onClick={exportToPDF}>Export to PDF</button>
          <button onClick={exportToExcel}>Export to Excel</button>
          <input type="text" placeholder="Name" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
          <input type="text" placeholder="Contact" value={filterContact} onChange={(e) => setFilterContact(e.target.value)} />
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {["Scheduled", "confirmed", "Cancelled", "Rescheduled", "Not confirmed"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
            <option value="">All Locations</option>
            {[...new Set(appointments.map((a) => a.location))].map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Contact</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              <th>Message</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((a) => (
              <tr key={a._id}>
                <td>{a.patientId?.name || "N/A"}</td>
                <td>{a.patientId?.contact || "N/A"}</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>{a.location}</td>
                <td>{a.message}</td>
                <td>{a.notes}</td>
                <td>
                  <select
                    value={a.status.trim()}
                    onChange={(e) => {
                      const newStatus = e.target.value.trim();
                      if (newStatus === "Rescheduled") {
                        handleRescheduleOpen(a);
                      } else {
                        axios
                          .patch(`api/appointments/${a._id}/status`, { status: newStatus })
                          .then(fetchData)
                          .catch(() => alert("Failed to update status"));
                      }
                    }}
                  >
                    {["Scheduled", "confirmed", "Cancelled", "Rescheduled", "Not confirmed"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td>
                  {user?.role === "admin" && <button onClick={() => handleDelete(a._id)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Reschedule Appointment</h3>
              <input type="date" min={today} value={modalData.date} onChange={(e) => setModalData((prev) => ({ ...prev, date: e.target.value }))} />
              <select value={modalData.time} onChange={(e) => setModalData((prev) => ({ ...prev, time: e.target.value }))}>
                <option value="">Select time</option>
                {timeSlots.map((slot, i) => (
                  <option key={i} value={slot}>{slot}</option>
                ))}
              </select>
              <select value={modalData.location} onChange={(e) => setModalData((prev) => ({ ...prev, location: e.target.value }))}>
                <option value="">Select location</option>
                <option value="Noida">Noida</option>
                <option value="Janakpuri">Janakpuri</option>
                <option value="Gurugram">Gurugram</option>
              </select>
              <div className="modal-buttons">
                <button onClick={handleRescheduleConfirm}>Confirm</button>
                <button onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
