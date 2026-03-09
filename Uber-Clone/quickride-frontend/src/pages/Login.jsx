import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:7973/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Login failed");

      // expecting { id, role, message, token? }
      const data = await res.json();
      console.log("Login response:", data);

      // ✅ Save full response (optional)
      localStorage.setItem("user", JSON.stringify(data));

      // ✅ Save token if present
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // ✅ Store ROLE (important for session)
      // role will persist even after refresh
      if (data.role) {
        localStorage.setItem("role", data.role);
      }

      // ✅ IMPORTANT: Clear ids only (avoid mix-up)
      // ❌ Do not clear everything
      localStorage.removeItem("userId");
      localStorage.removeItem("driverId");

      // ✅ Save based on role
      if (data.role === "USER") {
        if (data.id) localStorage.setItem("userId", String(data.id));
        navigate("/user/dashboard");
        return;
      }

      if (data.role === "DRIVER") {
        if (data.id) localStorage.setItem("driverId", String(data.id));
        navigate("/driver/dashboard");
        return;
      }

      // fallback
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay">
        <div className="login-card glass fade-in delay">
          <h1>Welcome Back</h1>
          <p className="login-subtitle">
            Enter your credentials to continue using QuickRide
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="glass-input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="glass-input"
            />
            <button type="submit" className="btn primary">
              Login
            </button>
          </form>

          <p className="login-footer">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;