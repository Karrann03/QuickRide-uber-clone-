// RideRequestPage.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import axios from "axios";

const libraries = ["places"];

const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 17.445, lng: 78.348 };

const API_KEY = "AIzaSyAzC2NZ5fdQBv7h8S6XgPdxF4wmULA48KQ";
const BACKEND_BASE = "http://localhost:7973";
const DEFAULT_STATUS = "AVAILABLE";

const RideRequest = () => {
  const navigate = useNavigate();

  const mapRef = useRef(null);

  const [currentPosition, setCurrentPosition] = useState(defaultCenter);
  const [geoError, setGeoError] = useState("");

  const [pickup, setPickup] = useState(null); // {lat,lng}
  const [drop, setDrop] = useState(null);

  const [pickupText, setPickupText] = useState("");
  const [dropText, setDropText] = useState("");

  const [drivers, setDrivers] = useState([]);
  const [statusMsg, setStatusMsg] = useState("Getting your location…");

  const [directions, setDirections] = useState(null);

  const pickupAutoRef = useRef(null);
  const dropAutoRef = useRef(null);

  // ✅ Vehicle selected by user (NO localStorage dependency)
  const [vehicleType, setVehicleType] = useState("SEDAN");

  // ✅ Fare/Distance estimate shown BEFORE request
  const [estimate, setEstimate] = useState(null); // {distanceKm, fare}
  const [estimating, setEstimating] = useState(false);

  // ✅ Ride response after request
  const [rideRes, setRideRes] = useState(null);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries,
  });

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // 1) Track user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported");
      setStatusMsg("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        setCurrentPosition(loc);
        setStatusMsg("Select pickup & drop");

        setPickup((prev) => prev ?? loc);

        if (mapRef.current) {
          mapRef.current.panTo(loc);
          mapRef.current.setZoom(15);
        }

        if (window.google?.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: loc }, (results, status) => {
            if (status === "OK" && results?.[0]) {
              setPickupText((prev) => prev || results[0].formatted_address);
            }
          });
        }

        setGeoError("");
      },
      (err) => {
        setGeoError(err?.message || "Location permission denied");
        setStatusMsg("Location permission denied");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 2) Fetch nearby drivers
  const fetchNearbyDrivers = async (lat, lng) => {
    try {
      setStatusMsg("Finding nearby drivers…");

      const url = `${BACKEND_BASE}/driver/nearby?lat=${lat}&lng=${lng}&radius=50&status=${DEFAULT_STATUS}`;

      const res = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const list = Array.isArray(res.data) ? res.data : [];

      const normalized = list
        .map((d) => {
          const dLat =
            d.latitude ?? d.lat ?? d.pickupLat ?? d.currentLat ?? d.driverLat;
          const dLng =
            d.longitude ?? d.lng ?? d.pickupLng ?? d.currentLng ?? d.driverLng;

          return {
            ...d,
            latitude: typeof dLat === "string" ? parseFloat(dLat) : dLat,
            longitude: typeof dLng === "string" ? parseFloat(dLng) : dLng,
          };
        })
        .filter(
          (d) =>
            typeof d.latitude === "number" &&
            !Number.isNaN(d.latitude) &&
            typeof d.longitude === "number" &&
            !Number.isNaN(d.longitude)
        );

      setDrivers(normalized);
      setStatusMsg(normalized.length ? "Drivers online nearby" : "No drivers nearby");
    } catch (err) {
      console.error("Error fetching drivers:", err?.response?.data || err.message);
      setStatusMsg("Driver API error (status/enum mismatch OR backend issue)");
      setDrivers([]);
    }
  };

  // 3) Poll drivers
  useEffect(() => {
    const base = pickup || currentPosition;
    if (!base?.lat || !base?.lng) return;

    fetchNearbyDrivers(base.lat, base.lng);
    const t = setInterval(() => fetchNearbyDrivers(base.lat, base.lng), 3000);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup, currentPosition]);

  // 4) Directions + distanceKm compute
  useEffect(() => {
    if (!pickup || !drop || !window.google) return;

    const dirService = new window.google.maps.DirectionsService();
    dirService.route(
      {
        origin: pickup,
        destination: drop,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);

          // ✅ extract distance in km from Google directions
          const leg = result.routes?.[0]?.legs?.[0];
          const meters = leg?.distance?.value; // meters
          const distanceKm = meters ? meters / 1000 : null;

          // Just set distance; fare depends on vehicleType (we will compute below)
          if (distanceKm) {
            // we’ll compute fare using backend-like logic OR call backend estimate endpoint
            setEstimate((prev) => ({ ...(prev || {}), distanceKm }));
          }
        } else {
          setDirections(null);
          setEstimate(null);
        }
      }
    );
  }, [pickup, drop]);

  // ✅ 4.1) Whenever distance changes OR vehicle changes -> compute fare (frontend formula same as backend)
  useEffect(() => {
    if (!estimate?.distanceKm) return;

    // Option: call backend /fare/estimate - but you don't have it yet
    // So use SAME formula as your backend calculateFare
    const baseFare = 50;
    let perKmRate = 10;

    if (vehicleType === "MINI_SUV") perKmRate = 10;
    else if (vehicleType === "SEDAN") perKmRate = 15;
    else if (vehicleType === "SUV") perKmRate = 20;

    const fare = baseFare + perKmRate * estimate.distanceKm;

    setEstimate((prev) => ({ ...(prev || {}), fare }));
  }, [estimate?.distanceKm, vehicleType]);

  // 5) Map click for pickup/drop
  const handleMapClick = (e) => {
    const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };

    if (!pickup) {
      setPickup(coords);
      setPickupText("Picked on map");
      return;
    }

    if (!drop) {
      setDrop(coords);
      setDropText("Dropped on map");
      return;
    }

    setDrop(coords);
    setDropText("Dropped on map");
  };

  // 6) Pickup autocomplete
  const onPickupPlaceChanged = () => {
    const place = pickupAutoRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const loc = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setPickup(loc);
    setPickupText(place.formatted_address || place.name || "");

    if (mapRef.current) {
      mapRef.current.panTo(loc);
      mapRef.current.setZoom(15);
    }
  };

  // 7) Drop autocomplete
  const onDropPlaceChanged = () => {
    const place = dropAutoRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const loc = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setDrop(loc);
    setDropText(place.formatted_address || place.name || "");

    if (mapRef.current) {
      mapRef.current.panTo(loc);
      mapRef.current.setZoom(14);
    }
  };

  const resetPins = () => {
    setPickup(null);
    setDrop(null);
    setDirections(null);
    setDrivers([]);
    setPickupText("");
    setDropText("");
    setEstimate(null);
    setRideRes(null);
    setStatusMsg("Select pickup & drop");
  };

  const useMyLocation = () => {
    setPickup(currentPosition);
    setPickupText("Current location");
    if (mapRef.current) {
      mapRef.current.panTo(currentPosition);
      mapRef.current.setZoom(16);
    }
  };

  // ✅ 8) Request ride and SHOW backend response in UI
  const requestRide = async () => {
    if (!pickup || !drop) return alert("Select pickup and drop locations!");

    const userId = Number(localStorage.getItem("userId"));
    if (!userId) return alert("userId missing! Save it in localStorage at login.");

    try {
      setRideRes(null);
      setEstimating(true);

      const res = await axios.post(
        `${BACKEND_BASE}/ride/request`,
        {
          userId,
          vehicleType, // ✅ from UI dropdown
          pickupLat: pickup.lat,
          pickupLong: pickup.lng,
          dropLat: drop.lat,
          dropLong: drop.lng,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      // ✅ store response and show in UI
      setRideRes(res.data);

      alert("Ride requested successfully!");
    } catch (err) {
      console.error("ride request error:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Error requesting ride.");
    } finally {
      setEstimating(false);
    }
  };

  // Marker Icons
  const pickupIcon = useMemo(() => {
    if (!window.google) return null;
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#22c55e",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    };
  }, [isLoaded]);

  const dropIcon = useMemo(() => {
    if (!window.google) return null;
    return {
      path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
      scale: 6,
      fillColor: "#ef4444",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    };
  }, [isLoaded]);

  const driverIcon = useMemo(() => {
    if (!window.google) return null;
    return {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 5,
      fillColor: "#3b82f6",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    };
  }, [isLoaded]);

  if (loadError) return <div style={{ color: "white" }}>Error loading map</div>;
  if (!isLoaded) return <div style={{ color: "white" }}>Loading Maps…</div>;

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <div className="dashboard-navbar glass">
        <div className="logo">QuickRide</div>

        <div className="nav-links">
          <button className="btn secondary" onClick={resetPins}>
            Reset
          </button>
          <button className="btn logout-btn" onClick={() => navigate("/User/Dashboard")}>
            Back
          </button>
        </div>
      </div>

      {/* Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: "16px",
          marginTop: "16px",
          height: "calc(100vh - 150px)",
        }}
      >
        {/* Left Panel */}
        <div className="glass" style={{ borderRadius: "18px", padding: "16px", overflow: "auto" }}>
          <h2 style={{ marginBottom: "6px" }}>Request a Ride</h2>
          <p style={{ opacity: 0.75, marginBottom: "14px" }}>{statusMsg}</p>
          {geoError && <p style={{ color: "tomato", marginBottom: 10 }}>{geoError}</p>}

          {/* Pickup */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", opacity: 0.8 }}>Pickup</label>
            <Autocomplete onLoad={(ac) => (pickupAutoRef.current = ac)} onPlaceChanged={onPickupPlaceChanged}>
              <input
                value={pickupText}
                onChange={(e) => setPickupText(e.target.value)}
                placeholder="Enter pickup location"
                className="rr-input"
                style={{ width: "100%" }}
              />
            </Autocomplete>

            <button className="btn secondary" style={{ width: "100%", marginTop: 10 }} onClick={useMyLocation}>
              Use My Current Location
            </button>
          </div>

          {/* Drop */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", opacity: 0.8 }}>Drop</label>
            <Autocomplete onLoad={(ac) => (dropAutoRef.current = ac)} onPlaceChanged={onDropPlaceChanged}>
              <input
                value={dropText}
                onChange={(e) => setDropText(e.target.value)}
                placeholder="Where to?"
                className="rr-input"
                style={{ width: "100%" }}
              />
            </Autocomplete>
          </div>

          {/* ✅ Vehicle Type Selector */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", opacity: 0.8 }}>Vehicle Type</label>
            <select
              className="rr-input"
              style={{ width: "100%" }}
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="MINI_SUV">MINI_SUV</option>
              <option value="SEDAN">SEDAN</option>
              <option value="SUV">SUV</option>
            </select>
          </div>

          {/* ✅ SHOW ESTIMATE BEFORE REQUEST */}
          {pickup && drop && estimate?.distanceKm != null && (
            <div
              style={{
                padding: "12px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                marginBottom: "12px",
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Estimate</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Distance: <b>{estimate.distanceKm.toFixed(2)} km</b>
              </div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Fare ({vehicleType}): <b>₹{Math.round(estimate.fare || 0)}</b>
              </div>
            </div>
          )}

          <button className="btn primary" style={{ width: "100%" }} onClick={requestRide} disabled={estimating}>
            {estimating ? "Requesting..." : "Request Ride"}
          </button>

          {/* ✅ SHOW BACKEND RESPONSE AFTER REQUEST */}
          {rideRes && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontWeight: 900 }}>Ride Created ✅</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>
                RideId: <b>{rideRes.rideId}</b>
              </div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Status: <b>{rideRes.status}</b>
              </div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Vehicle: <b>{rideRes.vehicleType}</b>
              </div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Distance: <b>{Number(rideRes.distanceKm).toFixed(2)} km</b>
              </div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Fare: <b>₹{Math.round(Number(rideRes.fare))}</b>
              </div>
            </div>
          )}

          {/* Driver list */}
          <div style={{ marginTop: "16px" }}>
            <h3 style={{ fontSize: "16px" }}>Live Drivers</h3>

            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {drivers.length === 0 ? (
                <div style={{ opacity: 0.7 }}>No drivers visible</div>
              ) : (
                drivers.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      padding: "10px",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "#fff",
                        color: "#000",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 800,
                      }}
                    >
                      {(d.name || "D").slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800 }}>{d.name ?? `Driver ${d.id}`}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        {d.vehicleType ?? d.vehicle ?? "Vehicle"} • {d.status ?? DEFAULT_STATUS}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.55 }}>
                        {Number(d.latitude).toFixed(5)}, {Number(d.longitude).toFixed(5)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <p style={{ marginTop: "14px", opacity: 0.7, fontSize: "12px" }}>
            Tip: You can also set pickup/drop by clicking on the map.
          </p>
        </div>

        {/* Map Right */}
        <div className="glass" style={{ borderRadius: "18px", overflow: "hidden", height: "100%" }}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={15}
            center={pickup || currentPosition}
            onLoad={onMapLoad}
            onClick={handleMapClick}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              clickableIcons: false,
            }}
          >
            {directions && <DirectionsRenderer directions={directions} />}

            {currentPosition && <Marker position={currentPosition} title="You" />}

            {pickup && <Marker position={pickup} title="Pickup" icon={pickupIcon || undefined} />}
            {drop && <Marker position={drop} title="Drop" icon={dropIcon || undefined} />}

            {drivers.map((driver) => (
              <Marker
                key={driver.id}
                position={{ lat: driver.latitude, lng: driver.longitude }}
                title={driver.name ?? `Driver ${driver.id}`}
                icon={driverIcon || undefined}
              />
            ))}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
};

export default RideRequest;