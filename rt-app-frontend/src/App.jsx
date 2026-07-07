// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import ResidentsPage from "./pages/ResidentsPage";
import HousesPage from "./pages/HousesPage";
import HouseDetailPage from "./pages/HouseDetailPage";
import BillsPage from "./pages/BillsPage";
import PaymentsPage from "./pages/PaymentsPage";
import ExpensesPage from "./pages/ExpensesPage";
import DashboardPage from "./pages/DashboardPage";
import MonthlyReportPage from "./pages/MonthlyReportPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/reports/monthly" element={<MonthlyReportPage />} />
          <Route path="/residents" element={<ResidentsPage />} />
          <Route path="/houses" element={<HousesPage />} />
          <Route path="/houses/:id" element={<HouseDetailPage />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
