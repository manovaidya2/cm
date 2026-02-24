import React, { useState, useEffect } from "react";
import "../style/ViewAttendancePage.css";

const ViewAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 16;

  const formatTime12Hour = (time) => {
    if (!time) return "-";
    const [hours, minutes] = time.split(":");
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    fetch(`https://crmapi.manovaidya.com/api/attendance/month?month=${selectedMonth}`)
      .then((res) => res.json())
      .then((data) => {
        const grouped = data.reduce((acc, curr) => {
          if (!acc[curr.date]) acc[curr.date] = [];
          acc[curr.date].push(curr);
          return acc;
        }, {});
        setAttendanceData(grouped);
      })
      .catch((err) => console.error(err));
  }, [selectedMonth]);

  const dates = Object.keys(attendanceData).sort((a, b) => new Date(b) - new Date(a));
  const totalPages = Math.ceil(dates.length / cardsPerPage);
  const displayedDates = dates.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage);

  const nameWiseCount = {};
  Object.values(attendanceData).flat().forEach((record) => {
    if (!nameWiseCount[record.name]) {
      nameWiseCount[record.name] = { Present: 0, Absent: 0, Leave: 0 };
    }
    if (record.status === "Present") nameWiseCount[record.name].Present++;
    else if (record.status === "Absent") nameWiseCount[record.name].Absent++;
    else if (record.status === "Leave") nameWiseCount[record.name].Leave++;
  });

  return (
    <div className="attendance-container-unique">
      
      {/* 🔹 Page Header */}
      <div className="attendance-page-header">
        <h2>📅 Attendance Records</h2>
      </div>

      {/* Top Controls */}
      <div className="attendance-top-bar">
        <button className="attendance-back-btn" onClick={() => window.history.back()}>
          ← Back
        </button>
        <input
          type="month"
          className="attendance-month-picker"
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Cards */}
      <div className="attendance-cards-grid">
        {displayedDates.map((date) => (
          <div key={date} className="attendance-card-unique">
            <h4>{date}</h4>
            <div className="table-scroll-container">
              <table className="attendance-table-mini">
                <thead>
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Status</th>
                    <th>Entry Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData[date].map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.id}</td>
                      <td>{emp.name}</td>
                      <td>{emp.designation}</td>
                      <td className={`status-${emp.status.toLowerCase()}`}>{emp.status}</td>
                      <td>{formatTime12Hour(emp.entryTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="attendance-pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
          ◀ Prev
        </button>
        <span>Page {currentPage} / {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
          Next ▶
        </button>
      </div>

      {/* Name-wise Total */}
      <div className="attendance-total-section">
        <h3>Total Attendance (Name-wise)</h3>
        <div className="table-scroll-container">
          <table className="attendance-total-table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="present-cell">Present</th>
                <th className="absent-cell">Absent</th>
                <th className="leave-cell">Leave</th>
                <th>Total Days</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(nameWiseCount).map(([name, counts]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td className="present-cell">{counts.Present}</td>
                  <td className="absent-cell">{counts.Absent}</td>
                  <td className="leave-cell">{counts.Leave}</td>
                  <td>{counts.Present + counts.Absent + counts.Leave}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewAttendancePage;
