import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../styles/DriverAvailableRides.css";
import { useNavigate } from "react-router-dom";

const BACKEND_BASE = "http://localhost:7973";

export default function DriverAvailableRides() {
  const navigate = useNavigate();

  const token = useMemo(() => localStorage.getItem("token"), []);
  const driverId = Number(localStorage.getItem("driverId")); // ✅ store at driver login

  const [radiusKm, setRadiusKm] = useState(5);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acceptingRideId, setAcceptingRideId] = useState(null);
  const [err, setErr] = useState("");

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchRides = async () => {
    if (!driverId) {
      setErr("driverId missing! Save it in localStorage at driver login.");
      return;
    }

    try {
      setErr("");
      setLoading(true);
      const res = await axios.get(
        `${BACKEND_BASE}/driver/${driverId}/available-rides?radiusKm=${radiusKm}`,
        { headers }
      );

      const list = Array.isArray(res.data) ? res.data : [];
      setRides(list);
    } catch (e) {
      console.error(e?.response?.data || e.message);
      setErr(e?.response?.data?.message || "Failed to fetch rides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
    const t = setInterval(fetchRides, 3000); // ✅ refresh every 3 sec
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusKm]);

  const acceptRide = async (rideId) => {
    try {
      setAcceptingRideId(rideId);
      const res = await axios.post(
        `${BACKEND_BASE}/driver/${driverId}/accept/${rideId}`,
        {},
        { headers }
      );

      // ✅ Store active ride for driver
      localStorage.setItem("activeRideId", String(rideId));

      // ✅ Remove accepted ride from list
      setRides((prev) => prev.filter((r) => r.rideId !== rideId));

      alert("Ride Accepted ✅");

      // OPTIONAL: navigate to driver tracking screen
      // navigate("/driver/active-ride");
    } catch (e) {
      console.error(e?.response?.data || e.message);
      alert(e?.response?.data?.message || "Accept failed (someone already accepted)");
    } finally {
      setAcceptingRideId(null);
    }
  };

  const rejectRide = async (rideId) => {
    // UI remove instantly
    setRides((prev) => prev.filter((r) => r.rideId !== rideId));

    // optional backend call
    try {
      await axios.post(
        `${BACKEND_BASE}/driver/${driverId}/reject/${rideId}`,
        {},
        { headers }
      );
    } catch (e) {
      // ignore reject API failure
      console.warn("Reject API failed:", e?.response?.data || e.message);
    }
  };

  return (
    <div className="dr-container">
      <div className="dr-navbar">
        <div className="dr-logo">QuickRide Driver</div>
        <div className="dr-actions">
          <select
            className="dr-select"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
          >
            <option value={3}>Radius: 3 km</option>
            <option value={5}>Radius: 5 km</option>
            <option value={10}>Radius: 10 km</option>
          </select>
          <button className="dr-btn secondary" onClick={fetchRides}>
            Refresh
          </button>
          <button className="dr-btn ghost" onClick={() => navigate("/Driver/Dashboard")}>
            Back
          </button>
        </div>
      </div>

      <div className="dr-card">
        <h2>Available Ride Requests</h2>
        <p className="dr-sub">
          You will see rides nearby. Accept fast — first driver wins.
        </p>

        {err && <div className="dr-alert">{err}</div>}

        {loading && <div className="dr-muted">Loading…</div>}

        {!loading && rides.length === 0 && (
          <div className="dr-empty">No ride requests right now.</div>
        )}

        <div className="dr-grid">
          {rides.map((r) => (
            <div key={r.rideId} className="dr-ride">
              <div className="dr-ride-top">
                <div>
                  <div className="dr-title">
                    Ride #{r.rideId} • {r.vehicleType}
                  </div>
                  <div className="dr-meta">
                    Status: <b>{r.status}</b>
                  </div>
                </div>

                <div className="dr-price">
                  ₹{Math.round(Number(r.fare || 0))}
                  <span>{Number(r.distanceKm || 0).toFixed(2)} km</span>
                </div>
              </div>

              <div className="dr-loc">
                <div className="dr-loc-row">
                  <span className="dot green" />
                  <div>
                    <div className="lbl">Pickup</div>
                    <div className="val">
                      {Number(r.pickupLat).toFixed(5)}, {Number(r.pickupLong).toFixed(5)}
                    </div>
                  </div>
                </div>

                <div className="dr-loc-row">
                  <span className="dot red" />
                  <div>
                    <div className="lbl">Drop</div>
                    <div className="val">
                      {Number(r.dropLat).toFixed(5)}, {Number(r.dropLong).toFixed(5)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="dr-row">
                <button
                  className="dr-btn primary"
                  onClick={() => acceptRide(r.rideId)}
                  disabled={acceptingRideId === r.rideId}
                >
                  {acceptingRideId === r.rideId ? "Accepting..." : "Accept"}
                </button>

                <button className="dr-btn danger" onClick={() => rejectRide(r.rideId)}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}