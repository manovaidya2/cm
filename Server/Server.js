const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const patientRoutes = require("./Routes/patientRoutes");
const appointmentRoutes = require("./Routes/appointmentRoutes");
const authRoutes = require("./Routes/authRoutes");
const assistantDoctorRoutes = require("./Routes/assistantDoctorRoutes");
const accountRoutes = require("./Routes/accountRoutes");
const medicineRoutes = require("./Routes/medicineRoutes");
const chithiRoutes = require("./Routes/chithiRoutes");
const packageRoutes = require("./Routes/packageRoutes");
const courierRoutes = require("./Routes/courier");
const googlePatientRoutes = require("./Routes/googlePatientRoutes");
const googleSheetLinkRoutes = require("./Routes/googleSheetLinkRoutes");
const syncRoutes = require("./Routes/sync");
const followUpRoutes = require("./Routes/followUpRoutes");
const followUpSyncRoutes = require("./Routes/syncFollowUp");
const attendanceRoutes = require("./Routes/attendanceRoutes");
const leaveRoutes = require("./Routes/leaveRoutes");
const getLeavesRoutes = require("./Routes/getLeavesRoutes");






const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend-url.com","https://docs.google.com/"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Clinic Backend is Live ✅");
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/assistant", assistantDoctorRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/medicine", medicineRoutes);
app.use("/api/chithi", chithiRoutes);
app.use("/api/package", packageRoutes); 
app.use("/api/courier", courierRoutes);
app.use("/api/google-patients", googlePatientRoutes);
app.use("/api/google-sheet", googleSheetLinkRoutes);
app.use("/api", syncRoutes);
app.use("/api/follow-up", followUpRoutes);
app.use("/api", followUpSyncRoutes);
app.use("/api/leaves", leaveRoutes); 
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", getLeavesRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
