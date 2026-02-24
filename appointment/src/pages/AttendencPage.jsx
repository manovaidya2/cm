import React, { useState, useEffect } from "react";
import "../style/AttendancePage.css";

const AttendancePage = () => {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [searchTerm, setSearchTerm] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", designation: "" });

  // Leave popup state
  const [showLeavePopup, setShowLeavePopup] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
  
    name: "",
    designation: "",
    date: today,
      fromDate: today,
  toDate: today,
    leaveReason: "",
  });

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`https://crmapi.manovaidya.com/api/attendance?date=${date}`);
      const data = await res.json();
      setAttendance(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = (index, newStatus) => {
    const updated = [...attendance];
    updated[index].status = newStatus;
    setAttendance(updated);
  };

  const handleSaveRow = async (index) => {
    const now = new Date();

    // Convert to 12-hour time format with AM/PM
    const formatTo12Hour = (date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutesStr = minutes < 10 ? "0" + minutes : minutes;
      return `${hours}:${minutesStr} ${ampm}`;
    };

    const currentTime = formatTo12Hour(now);

    const updated = [...attendance];
    updated[index].entryTime = currentTime;
    setAttendance(updated);

    const record = {
      id: updated[index].id,
      name: updated[index].name,
      designation: updated[index].designation,
      entryTime: currentTime,
      status: updated[index].status,
      date,
    };

    try {
      const res = await fetch("https://crmapi.manovaidya.com/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      const data = await res.json();
      alert(data.message || "Saved successfully!");
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert("Error saving attendance");
    }
  };

  const handleAddEmployeeClick = () => {
    setShowPopup(true);
  };

  const handleAddEmployeeSubmit = async () => {
    if (!newEmployee.name.trim() || !newEmployee.designation.trim()) {
      alert("Please fill all fields");
      return;
    }

    const newId = `EMP${String(attendance.length + 1).padStart(3, "0")}`;
    const record = {
      id: newId,
      name: newEmployee.name,
      designation: newEmployee.designation,
      entryTime: "",
      status: "Present",
      date,
    };

    try {
      await fetch("https://crmapi.manovaidya.com/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      fetchAttendance();
      setNewEmployee({ name: "", designation: "" });
      setShowPopup(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Leave form submit handler
  const handleLeaveSubmit = async () => {
  const { name, designation, date, leaveReason } = leaveForm;

  if (!name || !designation || !date || !leaveReason) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("https://crmapi.manovaidya.com/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leaveForm),
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message || "Leave applied successfully!");
      setShowLeavePopup(false);
      setLeaveForm({
        name: "",
        designation: "",
        date: today,
        leaveReason: "",
      });
    } else {
      alert(data.message || "Error applying leave");
    }
  } catch (err) {
    console.error(err);
    alert("Error applying leave");
  }
};


  const filteredAttendance = attendance.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="attendance-container">
      <div className="attendance-card">
        <h2>Employee Attendance</h2>

        <div className="top-bar-row">
          <label>Date:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          <button className="add-btn" onClick={handleAddEmployeeClick}>
            ➕ Add Employee
          </button>

          <button
            className="add-btn"
            onClick={() => {
              setLeaveForm({ id: "", name: "", designation: "", date: today, leaveReason: "" });
              setShowLeavePopup(true);
            }}
          >
            Apply Leave
          </button>

          <button className="view-btn" onClick={() => (window.location.href = "/view-attendance")}>
            📅 View Attendence
          </button>
          <button className="view-btn" onClick={() => (window.location.href = "/leaves")}>
  📝 View Leaves
</button>


          <button onClick={() => (window.location.href = "/dashboard")}>⬅ Back</button>

          <input
            type="text"
            placeholder="Search by ID, Name or Designation"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Entry Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((emp, index) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.name}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.entryTime || "--:--"}</td>
                  <td>
                    <select
                      value={emp.status}
                      onChange={(e) => handleStatusChange(index, e.target.value)}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Leave">Leave</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => handleSaveRow(index)}>Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Add New Employee</h3>
            <input
              type="text"
              placeholder="Enter Name"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Enter Designation"
              value={newEmployee.designation}
              onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
            />
            <div className="popup-buttons">
              <button onClick={handleAddEmployeeSubmit}>Add</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Application Popup */}
      {showLeavePopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Apply for Leave</h3>

           
            <input
              type="text"
              placeholder="Name"
              value={leaveForm.name}
              onChange={(e) => setLeaveForm({ ...leaveForm, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Designation"
              value={leaveForm.designation}
              onChange={(e) => setLeaveForm({ ...leaveForm, designation: e.target.value })}
            />
            <input
              type="date"
              value={leaveForm.date}
              onChange={(e) => setLeaveForm({ ...leaveForm, date: e.target.value })}
            />
            <input
  type="date"
  value={leaveForm.fromDate}
  onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
/>
<input
  type="date"
  value={leaveForm.toDate}
  onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
/>

           <textarea
  placeholder="Reason for leave"
  value={leaveForm.leaveReason}
  rows={6}       // makes it taller
  cols={40}      // makes it wider
  onChange={(e) => setLeaveForm({ ...leaveForm, leaveReason: e.target.value })}
/>


            <div className="popup-buttons">
              <button onClick={handleLeaveSubmit}>Submit</button>
              <button onClick={() => setShowLeavePopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
