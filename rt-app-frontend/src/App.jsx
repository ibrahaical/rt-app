// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ResidentsPage from "./pages/ResidentsPage";
import HousesPage from "./pages/HousesPage";
import HouseDetailPage from "./pages/HouseDetailPage"; // Baru
import BillsPage from "./pages/BillsPage"; // Baru

function App() {
  return (
    <Router>
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <nav
          style={{
            marginBottom: "20px",
            paddingBottom: "10px",
            borderBottom: "1px solid #ccc",
          }}
        >
          <h2>Dashboard RT</h2>
          <Link to="/residents" style={{ marginRight: "15px" }}>
            Kelola Penghuni
          </Link>
          <Link to="/houses" style={{ marginRight: "15px" }}>
            Kelola Rumah
          </Link>
          <Link to="/bills">Tagihan Iuran</Link>
        </nav>

        <Routes>
          <Route
            path="/"
            element={<h3>Selamat datang di Aplikasi Kas RT</h3>}
          />
          <Route path="/residents" element={<ResidentsPage />} />
          <Route path="/houses" element={<HousesPage />} />
          <Route path="/houses/:id" element={<HouseDetailPage />} />
          <Route path="/bills" element={<BillsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
