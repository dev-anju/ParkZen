import React, { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:5000";

const mallVenues = ["Mall A", "Mall B", "Mall C"];
const restaurantVenues = [
  "Restaurant A",
  "Restaurant B",
  "Restaurant C",
];

function App() {
  const [page, setPage] = useState("login");
  const [userType, setUserType] = useState("customer");

  const [venueType, setVenueType] = useState("mall");
  const [selectedVenue, setSelectedVenue] = useState("Mall A");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [adminVenue, setAdminVenue] = useState("Mall A");
  const [adminSection, setAdminSection] = useState("dashboard");

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  const continueToApp = () => {
    if (userType === "admin") {
      setPage("admin");
    } else {
      setPage("home");
    }
  };

  const logout = () => {
    setPage("login");
    setResult(null);
    setError("");
  };

  // --------------------------------------------------
  // VENUE TYPE
  // --------------------------------------------------

  const handleVenueType = (type) => {
    setVenueType(type);
    setResult(null);
    setError("");

    if (type === "mall") {
      setSelectedVenue("Mall A");
    } else {
      setSelectedVenue("Restaurant A");
    }
  };

  // --------------------------------------------------
  // CHECK PARKING
  // --------------------------------------------------

  const checkParkingAvailability = async () => {
    if (!selectedVenue) {
      setError("Please select a destination first.");
      return;
    }

    console.log("Check Parking clicked");
    console.log("Selected venue:", selectedVenue);

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          venue: selectedVenue,
        }),
      });

      const data = await response.json();

      console.log("ParkZen response:", data);

      if (!response.ok) {
        throw new Error(
          data.error || "Parking detection failed."
        );
      }

      setResult(data);
      setPage("parking-result");
    } catch (err) {
      console.error("ParkZen AI Error:", err);

      setError(
        err.message ||
          "Unable to connect to ParkZen AI. Make sure the Flask backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOGIN PAGE
  // --------------------------------------------------

  if (page === "login") {
    return (
      <div className="app">
        <div className="login-page">
          <div className="login-card">

            <div className="brand-logo">
              <div className="brand-icon">P</div>
              <span>ParkZen</span>
            </div>

            <div className="login-content">
              <span className="eyebrow">
                SMART PARKING INTELLIGENCE
              </span>

              <h1>
                Parking,
                <br />
                without the guesswork.
              </h1>

              <p>
                Find available parking spaces instantly with
                AI-powered YOLO11 detection.
              </p>

              <div className="role-selector">
                <button
                  className={
                    userType === "customer"
                      ? "role-card active"
                      : "role-card"
                  }
                  onClick={() => setUserType("customer")}
                >
                  <span className="role-icon">🚗</span>
                  <div>
                    <strong>Customer</strong>
                    <small>
                      Find available parking
                    </small>
                  </div>
                </button>

                <button
                  className={
                    userType === "admin"
                      ? "role-card active"
                      : "role-card"
                  }
                  onClick={() => setUserType("admin")}
                >
                  <span className="role-icon">⚙️</span>
                  <div>
                    <strong>Admin</strong>
                    <small>
                      Manage parking analytics
                    </small>
                  </div>
                </button>
              </div>

              <button
                className="primary-button"
                onClick={continueToApp}
              >
                Continue as{" "}
                {userType === "customer"
                  ? "Customer"
                  : "Admin"}
                <span>→</span>
              </button>

              <div className="login-footer">
                <span>AI Detection</span>
                <span>•</span>
                <span>YOLO11</span>
                <span>•</span>
                <span>Smart Parking</span>
              </div>
            </div>
          </div>

          <div className="login-visual">
            <div className="visual-overlay">
              <span>POWERED BY</span>
              <strong>YOLO11</strong>
              <p>
                Real-time parking space detection
                and intelligent recommendations.
              </p>
            </div>

            <div className="parking-illustration">
              <div className="parking-road">
                <div className="parking-slot occupied">
                  <span>P01</span>
                  🚙
                </div>

                <div className="parking-slot empty">
                  <span>P02</span>
                </div>

                <div className="parking-slot occupied">
                  <span>P03</span>
                  🚗
                </div>

                <div className="parking-slot empty">
                  <span>P04</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // CUSTOMER HOME
  // --------------------------------------------------

  if (page === "home") {
    const venues =
      venueType === "mall"
        ? mallVenues
        : restaurantVenues;

    return (
      <div className="app">

        {/* NAVBAR */}
        <nav className="navbar">

          <div className="nav-brand">
            <div className="nav-logo">P</div>
            <span>ParkZen</span>
          </div>

          <div className="nav-links">
            <button
              className="nav-link active"
              onClick={() => setPage("home")}
            >
              Home
            </button>

            <button
              className="nav-link"
              onClick={() => {
                setPage("home");
                setResult(null);
              }}
            >
              Find Parking
            </button>

            <button
              className="nav-link"
              onClick={() => {
                if (result) {
                  setPage("parking-result");
                }
              }}
            >
              Parking Status
            </button>

            <button className="nav-link">
              Profile
            </button>
          </div>

          <div className="nav-user">
            <div className="user-circle">C</div>

            <button
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>

        </nav>

        {/* MAIN */}
        <main className="customer-page">

          <div className="customer-heading">
            <span className="eyebrow">
              PARKZEN INTELLIGENCE
            </span>

            <h1>Where are you parking today?</h1>

            <p>
              Select your destination and ParkZen will
              check the parking availability for you.
            </p>

            <div className="powered-line">
              POWERED BY <strong>YOLO11</strong>{" "}
              AI Parking Detection
            </div>
          </div>

          {/* PARKING SEARCH CARD */}
          <section className="parking-search-card">

            <div className="destination-types">

              <button
                className={
                  venueType === "mall"
                    ? "destination-card active"
                    : "destination-card"
                }
                onClick={() => handleVenueType("mall")}
              >
                <div className="destination-icon">
                  🏬
                </div>

                <div className="destination-text">
                  <h3>Shopping Mall</h3>

                  <p>
                    Find available parking at a shopping
                    mall
                  </p>
                </div>

                <span className="destination-arrow">
                  →
                </span>
              </button>

              <button
                className={
                  venueType === "restaurant"
                    ? "destination-card active"
                    : "destination-card"
                }
                onClick={() =>
                  handleVenueType("restaurant")
                }
              >
                <div className="destination-icon">
                  🍽️
                </div>

                <div className="destination-text">
                  <h3>Restaurant</h3>

                  <p>
                    Check parking before dining
                  </p>
                </div>

                <span className="destination-arrow">
                  →
                </span>
              </button>

            </div>

            {/* LOCATION */}
            <div className="location-section">

              <div className="location-label">
                <span>📍</span>

                <div>
                  <small>Your destination</small>

                  <strong>
                    Select a{" "}
                    {venueType === "mall"
                      ? "location"
                      : "restaurant"}
                  </strong>
                </div>
              </div>

              <select
                value={selectedVenue}
                onChange={(e) =>
                  setSelectedVenue(e.target.value)
                }
                className="venue-select"
              >
                {venues.map((venue) => (
                  <option
                    value={venue}
                    key={venue}
                  >
                    {venue}
                  </option>
                ))}
              </select>

              {/* CHECK BUTTON */}
              <button
                type="button"
                className="check-parking-btn"
                onClick={checkParkingAvailability}
                disabled={loading}
              >
                {loading
                  ? "Analyzing..."
                  : "Check Parking →"}
              </button>

            </div>

            {/* ERROR */}
            {error && (
              <div className="parking-error">
                <strong>ParkZen AI Error</strong>
                <br />
                {error}
              </div>
            )}

            {/* AI INFO */}
            <div className="ai-info">

              <span className="ai-badge">
                AI DETECTION
              </span>

              <span className="model-badge">
                YOLO11
              </span>

              <span>
                Parking availability is analyzed
                automatically.
              </span>

            </div>

          </section>

          {/* HOW IT WORKS */}
          <section className="how-section">

            <span className="eyebrow">
              SIMPLE. SMART. FAST.
            </span>

            <h2>
              Parking, without the guesswork.
            </h2>

            <div className="steps">

              <div className="step">
                <span>01</span>

                <h3>Choose</h3>

                <p>
                  Select the mall or restaurant where
                  you are heading.
                </p>
              </div>

              <div className="step">
                <span>02</span>

                <h3>Detect</h3>

                <p>
                  ParkZen automatically analyzes the
                  parking area using YOLO11.
                </p>
              </div>

              <div className="step">
                <span>03</span>

                <h3>Park</h3>

                <p>
                  Get available spaces and a recommended
                  parking slot.
                </p>
              </div>

            </div>

          </section>

        </main>
      </div>
    );
  }

  // --------------------------------------------------
  // PARKING RESULT
  // --------------------------------------------------

  if (page === "parking-result") {
    return (
      <div className="app">

        {/* NAVBAR */}
        <nav className="navbar">

          <div className="nav-brand">
            <div className="nav-logo">P</div>
            <span>ParkZen</span>
          </div>

          <div className="nav-links">

            <button
              className="nav-link"
              onClick={() => setPage("home")}
            >
              Home
            </button>

            <button
              className="nav-link"
              onClick={() => setPage("home")}
            >
              Find Parking
            </button>

            <button className="nav-link active">
              Parking Status
            </button>

            <button className="nav-link">
              Profile
            </button>

          </div>

          <div className="nav-user">
            <div className="user-circle">C</div>

            <button
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>

        </nav>

        <main className="result-page">

          <div className="result-header">

            <div>
              <span className="eyebrow">
                PARKZEN AI ANALYSIS
              </span>

              <h1>
                Parking availability
              </h1>

              <p>
                {result?.venue ||
                  selectedVenue}
              </p>
            </div>

            <button
              className="back-button"
              onClick={() => setPage("home")}
            >
              ← Check another location
            </button>

          </div>

          {/* MAIN STATS */}
          <div className="result-stats">

            <div className="stat-card">
              <span>Total Spaces</span>
              <strong>
                {result?.total_slots ?? 0}
              </strong>
            </div>

            <div className="stat-card occupied-stat">
              <span>Occupied</span>
              <strong>
                {result?.occupied ?? 0}
              </strong>
            </div>

            <div className="stat-card available-stat">
              <span>Available</span>
              <strong>
                {result?.empty ?? 0}
              </strong>
            </div>

            <div className="stat-card">
              <span>Occupancy</span>
              <strong>
                {result?.occupancy ?? 0}%
              </strong>
            </div>

          </div>

          {/* STATUS */}
          <div className="status-card">

            <div>
              <span className="status-label">
                CURRENT STATUS
              </span>

              <h2>
                {result?.parking_status ||
                  "Parking analysis complete"}
              </h2>
            </div>

            {result?.recommended_slot && (
              <div className="recommended-slot">
                <span>
                  RECOMMENDED SLOT
                </span>

                <strong>
                  {result.recommended_slot}
                </strong>
              </div>
            )}

          </div>

          {/* PARKING MAP */}
          <section className="parking-map-section">

            <div className="section-heading">

              <div>
                <span className="eyebrow">
                  AI PARKING MAP
                </span>

                <h2>
                  Detected parking spaces
                </h2>
              </div>

              <div className="map-legend">
                <span>
                  <i className="legend-empty"></i>
                  Available
                </span>

                <span>
                  <i className="legend-occupied"></i>
                  Occupied
                </span>
              </div>

            </div>

            <div className="parking-grid">

              {result?.slots?.length > 0 ? (
                result.slots.map((slot, index) => {

                  const isEmpty =
                    slot.status === "empty" ||
                    slot.status === "available";

                  const isRecommended =
                    slot.id ===
                    result.recommended_slot;

                  return (
                    <div
                      className={`parking-space ${
                        isEmpty
                          ? "space-empty"
                          : "space-occupied"
                      } ${
                        isRecommended
                          ? "space-recommended"
                          : ""
                      }`}
                      key={slot.id || index}
                    >

                      <span className="space-id">
                        {slot.id ||
                          `P${String(
                            index + 1
                          ).padStart(2, "0")}`}
                      </span>

                      <div className="space-icon">
                        {isEmpty ? "✓" : "🚗"}
                      </div>

                      <span className="space-status">
                        {isEmpty
                          ? "Available"
                          : "Occupied"}
                      </span>

                      {isRecommended && (
                        <span className="recommended-label">
                          Recommended
                        </span>
                      )}

                    </div>
                  );
                })
              ) : (
                <div className="no-slots">
                  No parking slot data returned.
                </div>
              )}

            </div>

          </section>

          {/* FOOTER INFO */}
          <div className="result-footer">

            <div>
              <span className="ai-badge">
                YOLO11
              </span>

              <span>
                AI detection completed
              </span>
            </div>

            <span>
              Analysis generated by ParkZen AI
            </span>

          </div>

        </main>

      </div>
    );
  }

  // --------------------------------------------------
  // ADMIN DASHBOARD
  // --------------------------------------------------

  if (page === "admin") {
    return (
      <div className="app admin-app">

        {/* ADMIN NAVBAR */}
        <nav className="navbar">

          <div className="nav-brand">
            <div className="nav-logo">P</div>
            <span>ParkZen</span>
          </div>

          <div className="nav-links">

            <button
              className={
                adminSection === "dashboard"
                  ? "nav-link active"
                  : "nav-link"
              }
              onClick={() =>
                setAdminSection("dashboard")
              }
            >
              Dashboard
            </button>

            <button
              className={
                adminSection === "analytics"
                  ? "nav-link active"
                  : "nav-link"
              }
              onClick={() =>
                setAdminSection("analytics")
              }
            >
              Analytics
            </button>

            <button
              className={
                adminSection === "alerts"
                  ? "nav-link active"
                  : "nav-link"
              }
              onClick={() =>
                setAdminSection("alerts")
              }
            >
              Alerts
            </button>

          </div>

          <div className="nav-user">

            <div className="user-circle">
              A
            </div>

            <button
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </nav>

        <main className="admin-page">

          <div className="admin-header">

            <div>
              <span className="eyebrow">
                PARKZEN ADMIN
              </span>

              <h1>
                Parking Intelligence Dashboard
              </h1>

              <p>
                Monitor AI-powered parking
                availability across venues.
              </p>
            </div>

            <select
              className="venue-select"
              value={adminVenue}
              onChange={(e) =>
                setAdminVenue(e.target.value)
              }
            >
              {[...mallVenues, ...restaurantVenues].map(
                (venue) => (
                  <option
                    value={venue}
                    key={venue}
                  >
                    {venue}
                  </option>
                )
              )}
            </select>

          </div>

          {/* ADMIN STATS */}
          <div className="result-stats">

            <div className="stat-card">
              <span>Total Parking Spaces</span>
              <strong>120</strong>
            </div>

            <div className="stat-card occupied-stat">
              <span>Occupied</span>
              <strong>74</strong>
            </div>

            <div className="stat-card available-stat">
              <span>Available</span>
              <strong>46</strong>
            </div>

            <div className="stat-card">
              <span>Occupancy</span>
              <strong>61.7%</strong>
            </div>

          </div>

          {/* ADMIN ANALYSIS */}
          <section className="admin-panel">

            <div className="section-heading">

              <div>
                <span className="eyebrow">
                  VENUE MONITORING
                </span>

                <h2>
                  {adminVenue}
                </h2>
              </div>

              <span className="ai-badge">
                YOLO11 ACTIVE
              </span>

            </div>

            <div className="admin-analysis-grid">

              <div className="admin-info-card">
                <span>Detection Status</span>

                <strong>
                  ● Active
                </strong>

                <p>
                  YOLO11 parking-space detection
                  service is ready.
                </p>
              </div>

              <div className="admin-info-card">
                <span>Model</span>

                <strong>
                  YOLO11
                </strong>

                <p>
                  Space-empty / space-occupied
                  classification.
                </p>
              </div>

              <div className="admin-info-card">
                <span>Selected Venue</span>

                <strong>
                  {adminVenue}
                </strong>

                <p>
                  Connected parking source.
                </p>
              </div>

            </div>

          </section>

          {/* ANALYTICS */}
          {adminSection === "analytics" && (
            <section className="admin-panel">

              <span className="eyebrow">
                ANALYTICS
              </span>

              <h2>
                Parking usage overview
              </h2>

              <div className="analytics-placeholder">

                <div>
                  <strong>61.7%</strong>
                  <span>
                    Current occupancy
                  </span>
                </div>

                <div>
                  <strong>46</strong>
                  <span>
                    Available spaces
                  </span>
                </div>

                <div>
                  <strong>120</strong>
                  <span>
                    Total spaces
                  </span>
                </div>

              </div>

            </section>
          )}

          {/* ALERTS */}
          {adminSection === "alerts" && (
            <section className="admin-panel">

              <span className="eyebrow">
                ALERTS
              </span>

              <h2>
                Parking alerts
              </h2>

              <div className="alert-card">
                <strong>
                  Parking availability is normal
                </strong>

                <p>
                  No critical parking capacity
                  alerts for {adminVenue}.
                </p>
              </div>

            </section>
          )}

          {/* DEFAULT DASHBOARD */}
          {adminSection === "dashboard" && (
            <section className="admin-panel">

              <div className="section-heading">

                <div>
                  <span className="eyebrow">
                    SYSTEM STATUS
                  </span>

                  <h2>
                    ParkZen AI
                  </h2>
                </div>

                <span className="status-online">
                  ● ONLINE
                </span>

              </div>

              <div className="system-status-grid">

                <div>
                  <span>Backend</span>
                  <strong>Flask API</strong>
                </div>

                <div>
                  <span>AI Model</span>
                  <strong>YOLO11</strong>
                </div>

                <div>
                  <span>API Port</span>
                  <strong>5000</strong>
                </div>

                <div>
                  <span>Frontend</span>
                  <strong>React</strong>
                </div>

              </div>

            </section>
          )}

        </main>

      </div>
    );
  }

  return null;
}

export default App;