import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from "@react-google-maps/api";

const BACKEND_BASE = "http://localhost:7973";
const API_KEY = "AIzaSyAzC2NZ5fdQBv7h8S6XgPdxF4wmULA48KQ";
const libraries = ["places"];

const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 17.445, lng: 78.348 };

export default function UserTrackRide() {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const token = useMemo(() => localStorage.getItem("token"), []);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const [ride, setRide] = useState(null);
  const [statusMsg, setStatusMsg] = useState("Loading ride...");
  const [directions, setDirections] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries,
  });

  const onMapLoad = (map) => (mapRef.current = map);

  const fetchRide = async () => {
    const rideId = localStorage.getItem("activeRideId");
    if (!rideId) {
      setStatusMsg("No active ride. Please request a ride.");
      return;
    }

    try {
      // ✅ your controller mapping
      const res = await axios.get(`${BACKEND_BASE}/ride/rideId/${rideId}`, { headers });
      const r = res.data;
      setRide(r);

      if (r.status === "REQUESTED") setStatusMsg("Finding driver…");
      else if (r.status === "ACCEPTED") setStatusMsg("✅ Driver accepted! Driver is coming 🚗");
      else if (r.status === "ONGOING") setStatusMsg("Ride started ✅");
      else if (r.status === "COMPLETED" || r.status === "CANCELLED") {
        setStatusMsg(`Ride ${r.status}`);
        localStorage.removeItem("activeRideId");
      }

      // ✅ center map around pickup/driver
      const center = r.driverLat && r.driverLong
        ? { lat: r.driverLat, lng: r.driverLong }
        : r.pickupLat && r.pickupLong
          ? { lat: r.pickupLat, lng: r.pickupLong }
          : defaultCenter;

      if (mapRef.current) {
        mapRef.current.panTo(center);
      }
    } catch (e) {
      console.error(e?.response?.data || e.message);
      setStatusMsg("Could not fetch ride status");
    }
  };

  // polling
  useEffect(() => {
    fetchRide();
    const t = setInterval(fetchRide, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // directions pickup->drop
  useEffect(() => {
    if (!ride?.pickupLat || !ride?.pickupLong || !ride?.dropLat || !ride?.dropLong || !window.google) return;

    const dirService = new window.google.maps.DirectionsService();
    dirService.route(
      {
        origin: { lat: ride.pickupLat, lng: ride.pickupLong },
        destination: { lat: ride.dropLat, lng: ride.dropLong },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") setDirections(result);
        else setDirections(null);
      }
    );
  }, [ride]);

  const handleBackToDashboard = () => navigate("/user/dashboard");

  if (loadError) return <div style={{ color: "white" }}>Error loading map</div>;
  if (!isLoaded) return <div style={{ color: "white" }}>Loading Maps…</div>;

  const pickupPos = ride?.pickupLat ? { lat: ride.pickupLat, lng: ride.pickupLong } : null;
  const dropPos = ride?.dropLat ? { lat: ride.dropLat, lng: ride.dropLong } : null;
  const driverPos = ride?.driverLat ? { lat: ride.driverLat, lng: ride.driverLong } : null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-navbar glass">
        <div className="logo">QuickRide</div>
        <div className="nav-links">
          <button className="btn secondary" onClick={handleBackToDashboard}>
            Back
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: "16px",
          marginTop: "16px",
          height: "calc(100vh - 150px)",
        }}
      >
        {/* left card */}
        <div className="glass" style={{ borderRadius: 18, padding: 16, overflow: "auto" }}>
          <h2 style={{ marginBottom: 6 }}>Tracking Ride</h2>
          <p style={{ opacity: 0.8 }}>{statusMsg}</p>

          {ride && (
            <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
              <div>Ride ID: <b>{ride.rideId}</b></div>
              <div>Status: <b>{ride.status}</b></div>
              {ride.driverId && <div>Driver ID: <b>{ride.driverId}</b></div>}
              <div>Fare: <b>₹{Math.round(Number(ride.fare || 0))}</b></div>
              <div>Distance: <b>{Number(ride.distanceKm || 0).toFixed(2)} km</b></div>
            </div>
          )}

          {ride?.status === "COMPLETED" && (
            <button className="btn primary" style={{ marginTop: 12 }} onClick={() => navigate("/user/dashboard")}>
              Done
            </button>
          )}
        </div>

        {/* map */}
        <div className="glass" style={{ borderRadius: 18, overflow: "hidden" }}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={14}
            center={driverPos || pickupPos || defaultCenter}
            onLoad={onMapLoad}
            options={{ disableDefaultUI: true, zoomControl: true, clickableIcons: false }}
          >
            {directions && <DirectionsRenderer directions={directions} />}

            {pickupPos && <Marker position={pickupPos} title="Pickup" />}
            {dropPos && <Marker position={dropPos} title="Drop" />}
            {driverPos && <Marker position={driverPos} title="Driver" />}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}