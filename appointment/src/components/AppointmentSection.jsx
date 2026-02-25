import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AppointmentTable from "../components/AppointmentTable";

const generateTimeSlots = () => {
  const slots = [];
  const start = 11 * 60; // 11:00 AM
  const end = 20 * 60;   // 8:00 PM

  for (let mins = start; mins < end; mins += 30) {
    const format = (totalMins) => {
      let h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    };
    const startLabel = format(mins);
    const endLabel = format(mins + 30);
    slots.push(`${startLabel} - ${endLabel}`);
  }

  return slots;
};

const AppointmentsSection = ({ patients }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    patientId: "",
    date: "",
    time: "",
    notes: "",
    location: "",
    message: "",
  });

  const timeSlots = generateTimeSlots();
  const today = new Date().toISOString().split("T")[0];

  const fetchData = async () => {
    try {
      const res = await axios.get("api/appointments");
      setAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { patientId, date, time } = formData;

    if (!patientId || !date || !time) {
      return alert("Please fill all required fields");
    }

    const isSlotTaken = appointments.some(
      (appt) => appt.date === date && appt.time === time
    );

    if (isSlotTaken) {
      return alert("This time slot is already booked. Please choose another.");
    }

    try {
      await axios.post("api/appointments/add", formData, {
        headers: {
          username: user.username,
        },
      });
      setFormData({
        patientId: "",
        date: "",
        time: "",
        notes: "",
        location: "",
        message: "",
      });
      fetchData();
    } catch (error) {
      console.error("Appointment error:", error.response?.data || error.message);
      alert("Failed to schedule appointment");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this appointment?");
    if (!confirmed) return;

    try {
      await axios.delete(`api/appointments/${id}`);
      setAppointments((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Failed to delete appointment");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`api/appointments/${id}/status`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const eligiblePatients = patients?.filter(
    (p) => p.status === "Payment Done" || p.status === "Scheduled"
  ) || [];

  return (
    <div className="appointments-section">
      <div className="appointment-form-container">
        <h2 className="section-title">📅 Schedule an Appointment</h2>
        <form className="appointment-form" onSubmit={handleSubmit}>
          <select
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
          >
            <option value="">Select Patient</option>
            {eligiblePatients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.contact})
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={today}
            required
          />

          <select
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          >
            <option value="">Select Time</option>
            {timeSlots.map((slot, i) => (
              <option key={i} value={slot}>
                {slot}
              </option>
            ))}
          </select>

          <textarea
            name="notes"
            placeholder="Add any notes (optional)"
            value={formData.notes}
            onChange={handleChange}
          ></textarea>

          <input
            type="text"
            name="location"
            placeholder="Enter location"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Enter message for patient"
            value={formData.message}
            onChange={handleChange}
          />

          <button type="submit">➕ Schedule</button>
        </form>
      </div>

      <AppointmentTable
        appointments={appointments}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default AppointmentsSection;
