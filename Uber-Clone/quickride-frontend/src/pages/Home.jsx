import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-container">

      {/* Navbar */}
      <nav className="navbar">
        <h2 className="logo">QuickRide</h2>
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/signup" className="signup-nav">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <h1 className="fade-in">Move Smarter With QuickRide</h1>

        <p className="fade-in delay">
          Reliable rides. Professional drivers. Anytime, anywhere.
        </p>

        <div className="buttons fade-in delay-2">
          <Link to="/signup?role=user" className="btn secondary">
            Ride with Us
          </Link>

          <Link to="/signup?role=driver" className="btn secondary">
            Become a Driver
          </Link>
        </div>

        <div className="login-redirect fade-in delay-2">
          Already have an account? 
          <Link to="/login" className="login-link"> Login</Link>
        </div>

      </div>

    </div>
  );
}

export default Home;