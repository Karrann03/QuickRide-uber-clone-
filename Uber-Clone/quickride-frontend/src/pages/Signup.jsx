import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Signup.css";

function Signup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") || "user"; // default is user

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    vehicleType: "SEDAN", // default vehicle type for drivers
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update form data dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        role === "driver"
          ? "http://localhost:7973/driver/register"
          : "http://localhost:7973/user/register";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Signup failed");
      }

      // Success
      alert(`${role === "driver" ? "Driver" : "User"} registered successfully!`);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-overlay">
        <div className="signup-card glass fade-in">
          <h1>{role === "driver" ? "Join as a Driver" : "Sign Up"}</h1>
          <p className="signup-subtitle">
            {role === "driver"
              ? "Start your driving journey with QuickRide"
              : "Create your QuickRide account and book rides instantly"}
          </p>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <form className="signup-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="glass-input"
            />

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

            {role === "driver" && (
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="glass-input"
              >
                <option value="MINI_SUV">Mini SUV</option>
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
              </select>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? "Signing up..."
                : role === "driver"
                ? "Register as Driver"
                : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;