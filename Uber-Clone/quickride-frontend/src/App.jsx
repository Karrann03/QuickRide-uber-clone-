import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import RideRequest from "./pages/RideRequest";
import DriverAvailableRides from "./pages/DriverAvailableRides";
import RequireAuth from "./components/RequireAuth";
import UserTrackRide from "./pages/UserTrackRide";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
          path="/user/dashboard"
            element={
              <RequireAuth allowedRole="USER">
              <UserDashboard />
             </RequireAuth>
                }
/>
      <Route
  path="/driver/dashboard"
  element={
    <RequireAuth allowedRole="DRIVER">
      <DriverDashboard />
    </RequireAuth>
  }
/>
      <Route path="/request-ride" element={<RideRequest />} />
      <Route path="/driver/available-rides" element={<DriverAvailableRides />} />
      <Route
  path="/user/track"
  element={
    <RequireAuth allowedRole="USER">
      <UserTrackRide />
    </RequireAuth>
  }
/>
    </Routes>
  );
}

export default App;