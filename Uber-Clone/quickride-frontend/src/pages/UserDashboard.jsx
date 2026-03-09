import React, { useEffect, useMemo, useState } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_BASE = "http://localhost:7973";

function UserDashboard() {
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), []);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const [ride, setRide] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ✅ NEW: Recover activeRideId after refresh (if missing)
  const recoverActiveRide = async () => {
    const rideId = localStorage.getItem("activeRideId");
    if (rideId) return; // already have it

    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      // ✅ backend: GET /ride/active/user/{userId}
      const res = await axios.get(
        `${BACKEND_BASE}/ride/active/user/${userId}`,
        { headers }
      );

      if (res.data?.rideId) {
        localStorage.setItem("activeRideId", String(res.data.rideId));
        setRide(res.data);

        // also set message immediately based on status
        const st = res.data.status;
        if (st === "REQUESTED") setStatusMsg("Searching driver…");
        else if (st === "ACCEPTED")
          setStatusMsg("✅ Driver accepted! Driver is coming 🚗");
        else if (st === "ONGOING") setStatusMsg("Ride started ✅");
      }
    } catch (e) {
      // no active ride found - ignore
    }
  };

  const fetchRideStatus = async () => {
    const rideId = localStorage.getItem("activeRideId");
    if (!rideId) {
      setRide(null);
      setStatusMsg("");
      return;
    }

    try {
      // ✅ FIXED URL: your controller is /ride/rideId/{rideId}
      const res = await axios.get(
        `${BACKEND_BASE}/ride/rideId/${rideId}`,
        { headers }
      );

      const r = res.data;
      setRide(r);

      if (r.status === "REQUESTED") setStatusMsg("Searching driver…");
      else if (r.status === "ACCEPTED")
        setStatusMsg("✅ Driver accepted! Driver is coming 🚗");
      else if (r.status === "ONGOING") setStatusMsg("Ride started ✅");
      else if (r.status === "COMPLETED" || r.status === "CANCELLED") {
        setStatusMsg(`Ride ${r.status}`);
        localStorage.removeItem("activeRideId");
      }
    } catch (e) {
      console.error(e?.response?.data || e.message);
      setStatusMsg("Could not fetch ride status");
    }
  };

  useEffect(() => {
    // ✅ first try to recover ride after refresh
    recoverActiveRide();

    // ✅ then fetch immediately
    fetchRideStatus();

    // ✅ polling every 2 sec
    const t = setInterval(fetchRideStatus, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-navbar glass">
        <div className="logo">QuickRide</div>
        <div className="nav-links">
          <button onClick={handleLogout} className="btn logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-hero">
        <h1>Welcome, Rider!</h1>
        <p>Book rides, track your trips, and enjoy the journey.</p>

        {/* ✅ live status popup */}
        {statusMsg && (
          <div
            className="glass"
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              width: "min(520px, 95%)",
            }}
          >
            <div style={{ fontWeight: 900 }}>{statusMsg}</div>

            {ride && (
              <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9 }}>
                <div>
                  Ride ID: <b>{ride.rideId}</b>
                </div>
                <div>
                  Status: <b>{ride.status}</b>
                </div>
                {ride.driverId && (
                  <div>
                    Driver ID: <b>{ride.driverId}</b>
                  </div>
                )}
                <div>
                  Fare: <b>₹{Math.round(Number(ride.fare || 0))}</b> •{" "}
                  <b>{Number(ride.distanceKm || 0).toFixed(2)} km</b>
                </div>
              </div>
            )}

            {ride?.status === "ACCEPTED" && (
              <button
                className="btn primary"
                style={{ marginTop: 12 }}
                onClick={() => navigate("/user/track")}
              >
                Track Driver
              </button>
            )}
          </div>
        )}

        <div className="buttons" style={{ marginTop: 20 }}>
          <button
            className="btn primary"
            onClick={() => navigate("/request-ride")}
          >
            Request a Ride
          </button>
          <button
            className="btn secondary"
            onClick={() => navigate("/user/trips")}
          >
            Your Trips
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;