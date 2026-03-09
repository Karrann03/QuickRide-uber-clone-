import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const mapContainerStyle = { width: "100%", height: "100%" };

// Hyderabad fallback
const defaultCenter = { lat: 17.445, lng: 78.348 };

// ✅ Put your key
const API_KEY = "AIzaSyAzC2NZ5fdQBv7h8S6XgPdxF4wmULA48KQ";
const BACKEND_BASE = "http://localhost:7973";

function DriverDashboard() {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const token = useMemo(() => localStorage.getItem("token"), []);
  const driverId = useMemo(() => localStorage.getItem("driverId"), []);

  const [currentPosition, setCurrentPosition] = useState(defaultCenter);
  const [statusMsg, setStatusMsg] = useState("Getting your location…");
  const [geoError, setGeoError] = useState("");
  const [isOnline, setIsOnline] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
  });

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const goToRequests = () => navigate("/driver/available-rides");
  const goToTrips = () => navigate("/driver/trips");

  // ✅ Call your backend API to update driver location
  const updateDriverLocation = async (lat, lng) => {
    if (!driverId) return;

    try {
      await axios.put(
        `${BACKEND_BASE}/driver/update-Location/${driverId}?latitude=${lat}&longitude=${lng}`,
        {},
        { headers }
      );
    } catch (err) {
      console.error("Location update failed:", err?.response?.data || err.message);
    }
  };

  // ✅ Start live location tracking
  useEffect(() => {
    if (!driverId) {
      setGeoError("driverId missing. Please login again as DRIVER.");
      setStatusMsg("driverId missing");
      setIsOnline(false);
      return;
    }

    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported");
      setStatusMsg("Geolocation not supported");
      setIsOnline(false);
      return;
    }

    setStatusMsg("Tracking your live location…");

    let lastSentAt = 0;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const loc = { lat, lng };

        setCurrentPosition(loc);
        setIsOnline(true);
        setStatusMsg("You are online ✅");

        // ✅ Pan map smoothly
        if (mapRef.current) {
          mapRef.current.panTo(loc);
          mapRef.current.setZoom(16);
        }

        // ✅ throttle backend updates every 3 seconds
        const now = Date.now();
        if (now - lastSentAt >= 3000) {
          lastSentAt = now;
          await updateDriverLocation(lat, lng);
        }

        setGeoError("");
      },
      (err) => {
        setGeoError(err?.message || "Location permission denied");
        setStatusMsg("Location permission denied");
        setIsOnline(false);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId]);

  if (loadError) return <div style={{ color: "white" }}>Error loading map</div>;
  if (!isLoaded) return <div style={{ color: "white" }}>Loading Maps…</div>;

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <div className="dashboard-navbar glass">
        <div className="logo">QuickRide</div>

        <div className="nav-links">
          <button onClick={handleLogout} className="btn logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Layout like user: left panel + map */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: "16px",
          marginTop: "16px",
          height: "calc(100vh - 150px)",
        }}
      >
        {/* Left panel */}
        <div
          className="glass"
          style={{
            borderRadius: "18px",
            padding: "16px",
            overflow: "auto",
          }}
        >
          <h2 style={{ marginBottom: "6px" }}>Driver Dashboard</h2>

          <p style={{ opacity: 0.75, marginBottom: "14px" }}>{statusMsg}</p>

          {geoError && (
            <p style={{ color: "tomato", marginBottom: 10 }}>{geoError}</p>
          )}

          {/* Status badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              marginBottom: "14px",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontWeight: 900 }}>Driver Status</div>
            <div
              style={{
                fontWeight: 900,
                padding: "6px 10px",
                borderRadius: "999px",
                background: isOnline
                  ? "rgba(34,197,94,0.18)"
                  : "rgba(239,68,68,0.18)",
                border: isOnline
                  ? "1px solid rgba(34,197,94,0.35)"
                  : "1px solid rgba(239,68,68,0.35)",
              }}
            >
              {isOnline ? "ONLINE" : "OFFLINE"}
            </div>
          </div>

          <div className="dashboard-hero" style={{ padding: 0, background: "transparent" }}>
            <h1 style={{ fontSize: "22px", marginBottom: "6px" }}>
              Welcome, Driver!
            </h1>
            <p style={{ marginBottom: "14px" }}>
              Accept ride requests, track earnings, and manage trips efficiently.
            </p>

            <div className="buttons">
              <button className="btn primary" onClick={goToRequests}>
                View Requests
              </button>

              <button className="btn secondary" onClick={goToTrips}>
                Your Trips
              </button>
            </div>
          </div>

          {/* Location card */}
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 6 }}>
              Your Current Location
            </div>

            <div style={{ fontSize: 13, opacity: 0.85 }}>
              Lat: <b>{currentPosition.lat.toFixed(5)}</b>
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              Lng: <b>{currentPosition.lng.toFixed(5)}</b>
            </div>

            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
              Tip: Allow location permissions to see rides and accept them.
            </div>
          </div>
        </div>

        {/* Map Right */}
        <div
          className="glass"
          style={{ borderRadius: "18px", overflow: "hidden", height: "100%" }}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={16}
            center={currentPosition}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              clickableIcons: false,
            }}
          >
            {/* Driver marker */}
            <Marker position={currentPosition} title="You (Driver)" />
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;