import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../style/Login.css";

const AdminSignupForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "", // Default empty to force selection
  });

  const [users, setUsers] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    if (!user || user.role !== "admin") {
      alert("Access denied: Only admin can create users");
      navigate("/dashboard");
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("api/auth/all-users", {
        headers: { role: user?.role },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://crmapi.manovaidya.com/api/auth/signup", formData, {
        headers: { role: user?.role },
      });
      alert("User created successfully");

      // ✅ Clear form fields after submit
      setFormData({ username: "", password: "", role: "" });
      document.activeElement.blur(); // optional: remove focus
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  const togglePasswordVisibility = (index) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleDelete = async (username) => {
    if (window.confirm(`Delete user "${username}"?`)) {
      try {
        await axios.delete(`https://crmapi.manovaidya.com/api/auth/delete-user/${username}`, {
          headers: { role: user?.role },
        });
        alert("User deleted");
        fetchUsers();
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  return (
    <div className="login-container" style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
      {/* Form Section */}
      <div className="login-card" style={{ flex: "1", minWidth: "300px" }}>
        <h2>Create New User</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="">-- Choose Role --</option>
            <option value="counser">Counser</option>
            <option value="receptionist">Receptionist</option>
            <option value="Assistant Doctor">Assistant Doctor</option>
            <option value="account">Account</option>
            <option value="medicine">Medicine</option>
            <option value="chithi">Chithi</option>
            <option value="packoing">Packoing</option>
            <option value="courier">Courier</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Create User</button>
        </form>
        <button
          style={{ marginTop: "10px" }}
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Users Table */}
      <div className="login-card" style={{ flex: "2", minWidth: "300px", overflowX: "auto" }}>
        <h2>All Users</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ backgroundColor: "#1d0b2dff" }}>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Password</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={tdStyle}>{u.username}</td>
                <td style={tdStyle}>{u.role}</td>
                <td style={tdStyle}>
                  {visiblePasswords[index] ? u.password : "••••••••"}
                  <button
                    onClick={() => togglePasswordVisibility(index)}
                    style={{
                      marginLeft: "10px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#007bff",
                    }}
                  >
                    {visiblePasswords[index] ? "🙈" : "👁️"}
                  </button>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleDelete(u.username)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Table styles
const thStyle = {
  borderBottom: "2px solid #888",
  padding: "8px",
  textAlign: "left",
};

const tdStyle = {
  padding: "8px",
};

export default AdminSignupForm;
