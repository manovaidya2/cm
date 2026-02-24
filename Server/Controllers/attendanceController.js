// controllers/attendanceController.js
const Attendance = require("../Models/Attendance");
const Employee = require("../Models/Employee");

// Save or update attendance
exports.saveAttendance = async (req, res) => {
  try {
    const { id, name, designation, entryTime, status, date } = req.body;
    if (!id || !name || !designation || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Upsert employee in master list
    await Employee.findOneAndUpdate(
      { id },
      { name, designation },
      { upsert: true, new: true }
    );

    // Save attendance for that date
    await Attendance.findOneAndUpdate(
      { id, date },
      {
        name,
        designation,
        entryTime: entryTime || "",
        status: status || "Present",
        date
      },
      { upsert: true, new: true }
    );

    res.json({ message: "Attendance saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving attendance", error: err });
  }
};

// Get attendance by date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const employees = await Employee.find();
    const attendanceForDate = await Attendance.find({ date });

    // Merge employee list with attendance for date
    const merged = employees.map(emp => {
      const record = attendanceForDate.find(a => a.id === emp.id);
      return {
        id: emp.id,
        name: emp.name,
        designation: emp.designation,
        entryTime: record ? record.entryTime : "",
        status: record ? record.status : "Present",
        date
      };
    });

    res.json(merged);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching attendance", error: err });
  }
};

// Get all attendance records (date-wise)
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ date: -1 }); // latest first
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching attendance", error: err });
  }
};

exports.getAttendanceByMonth = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month) return res.status(400).json({ message: "Month is required" });

    const regex = new RegExp(`^${month}`);
    const records = await Attendance.find({ date: { $regex: regex } });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Error fetching month data", error: err });
  }
};
