// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import PatientsPage from "./pages/PatientsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import AssistantDoctorPage from "./pages/AssistantDoctorPage";
import AccountPage from "./pages/AccountPage";
import MedicinePage from "./pages/MedicinePage";
import Chithi from "./pages/ChithiPage"; 
import PackagePage from "./pages/PackagePage";
import CourierPage from "./pages/CourierPage";
import GoogleSheetPage from "./pages/GoogleSheetPage";
import FollowUpPage from "./pages/FollowUpPage";
import SignupPage from "./pages/SignupPage";
import Layout from "./components/Layout"; // ✅ Only one import
import AttendencPage from "./pages/AttendencPage";
import ViewAttendancePage from "./pages/ViewAttendancePage";
import LeaveListPage from "./pages/LeaveListPage"; 


const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Protected Pages wrapped in Layout */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/patients" element={<ProtectedRoute><Layout><PatientsPage /></Layout></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><Layout><AppointmentsPage /></Layout></ProtectedRoute>} />
      <Route path="/assistant-doctor" element={<ProtectedRoute><Layout><AssistantDoctorPage /></Layout></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><Layout><AccountPage /></Layout></ProtectedRoute>} />
      <Route path="/medicine" element={<ProtectedRoute><Layout><MedicinePage /></Layout></ProtectedRoute>} />
      <Route path="/chithi" element={<ProtectedRoute><Layout><Chithi /></Layout></ProtectedRoute>} />
      <Route path="/packaging" element={<ProtectedRoute><Layout><PackagePage /></Layout></ProtectedRoute>} />
      <Route path="/courier" element={<ProtectedRoute><Layout><CourierPage /></Layout></ProtectedRoute>} />
      <Route path="/google-sheet" element={<ProtectedRoute><Layout><GoogleSheetPage /></Layout></ProtectedRoute>} />
      <Route path="/follow-up" element={<ProtectedRoute><Layout><FollowUpPage /></Layout></ProtectedRoute>} />
       <Route path="/attendenc" element={<ProtectedRoute><Layout><AttendencPage /></Layout></ProtectedRoute>} />
       <Route path="/view-attendance" element={<ViewAttendancePage />} />
         <Route path="/leaves" element={<LeaveListPage />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
