import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../style/Login.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState(null);
  const [adminExists, setAdminExists] = useState(true);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [signupForm, setSignupForm] = useState({ username: "", password: "", role: "counser" });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get("api/auth/admin-exists");
        setAdminExists(res.data.exists);
      } catch (err) {
        setAdminExists(true);
      }
    };
    checkAdmin();
  }, []);

  const handleChange = (e, isLogin) => {
    const { name, value } = e.target;
    if (isLogin) {
      setLoginForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setSignupForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("api/auth/login", loginForm);
      const { username, role } = res.data;
      login(username, role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("api/auth/signup", signupForm, {
        headers: { role: user?.role || "none" },
      });
      alert("User created successfully");
      setSignupForm({ username: "", password: "", role: "counser" });
      setIsSignup(false);
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <img
            src="https://manovaidya.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.1c88d462.png&w=640&q=75"
            alt="Manovaidya Logo"
            className="logo-image"
          />
          <h3 className="welcome-text">Welcome!</h3>
        </div>

        <h2>{isSignup ? "Create User" : "🩺 Clinic Panel Login"}</h2>
        {error && <div className="error-message">{error}</div>}

        {!isSignup ? (
          !adminExists ? (
            <form onSubmit={handleSignup}>
              <div className="input-group">
                <i className="fas fa-user icon" />
                <input
                  type="text"
                  name="username"
                  placeholder="Create Admin Username"
                  value={signupForm.username}
                  onChange={(e) => handleChange(e, false)}
                  required
                />
              </div>

              <div className="input-group">
                <i className="fas fa-lock icon" />
                <input
                  type={showSignupPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create Admin Password"
                  value={signupForm.password}
                  onChange={(e) => handleChange(e, false)}
                  required
                />
                <span
                  onClick={() => setShowSignupPassword((prev) => !prev)}
                  className="toggle-eye"
                >
                  <i className={`fas ${showSignupPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </span>
              </div>

              <select name="role" value="admin" disabled>
                <option value="admin">Admin</option>
              </select>
              <button type="submit">Create Admin</button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <i className="fas fa-user icon" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) => handleChange(e, true)}
                  required
                />
              </div>
              <div className="input-group">
                <i className="fas fa-lock icon" />
                <input
                  type={showLoginPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => handleChange(e, true)}
                  required
                />
                <span
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  className="toggle-eye"
                >
                  <i className={`fas ${showLoginPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </span>
              </div>
              <button type="submit">Login</button>

              {user?.role === "admin" && (
                <p style={{ marginTop: "10px" }}>
                  Want to create a new user?{" "}
                  <button type="button" onClick={() => setIsSignup(true)}>
                    Go to Signup
                  </button>
                </p>
              )}
            </form>
          )
        ) : user?.role !== "admin" ? (
          <p>Access denied. Only admin can create users.</p>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="input-group">
              <i className="fas fa-user icon" />
              <input
                type="text"
                name="username"
                placeholder="New Username"
                value={signupForm.username}
                onChange={(e) => handleChange(e, false)}
                required
              />
            </div>
            <div className="input-group">
              <i className="fas fa-lock icon" />
              <input
                type={showSignupPassword ? "text" : "password"}
                name="password"
                placeholder="New Password"
                value={signupForm.password}
                onChange={(e) => handleChange(e, false)}
                required
              />
              <span
                onClick={() => setShowSignupPassword((prev) => !prev)}
                className="toggle-eye"
              >
                <i className={`fas ${showSignupPassword ? "fa-eye-slash" : "fa-eye"}`} />
              </span>
            </div>
            <select name="role" value={signupForm.role} onChange={(e) => handleChange(e, false)}>
              <option value="counser">Counser</option>
              <option value="receptionist">Receptionist</option>
              <option value="account">Account</option>
              <option value="medicine">Medicine</option>
              <option value="chithi">Chithi</option>
              <option value="packoing">Packoing</option>
              <option value="courier">Courier</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">Create User</button>
            <p style={{ marginTop: "10px" }}>
              <button type="button" onClick={() => setIsSignup(false)}>
                Back to Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
