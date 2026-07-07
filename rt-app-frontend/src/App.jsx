// src/App.jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ResidentsPage from "./pages/ResidentsPage";
import HousesPage from "./pages/HousesPage";

function App() {
  return (
    <BrowserRouter>
      <nav style={{ marginBottom: "20px", display: "flex", gap: "20px" }}>
        <Link to="/residents">Data Penghuni</Link>
        <Link to="/houses">Data Rumah</Link>
      </nav>
      <Routes>
        <Route path="/residents" element={<ResidentsPage />} />
        <Route path="/houses" element={<HousesPage />} />
        <Route path="/" element={<ResidentsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
