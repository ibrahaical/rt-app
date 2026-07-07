import React, { useState, useEffect } from "react";
import api from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashRes = await api.get(
          `/dashboard?month=${currentMonth}&year=${currentYear}`,
        );
        setDashboardData(dashRes.data);

        const chartRes = await api.get(
          `/reports/yearly-chart?year=${currentYear}`,
        );
        setChartData(chartRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboard();
  }, [currentMonth, currentYear]);

  if (!dashboardData) return <p>Loading Dashboard...</p>;

  const formatRp = (num) => `Rp ${parseInt(num).toLocaleString("id-ID")}`;

  return (
    <div>
      <h2>Dashboard RT - Tahun {currentYear}</h2>

      {/* Kartu Ringkasan */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "8px",
            minWidth: "200px",
          }}
        >
          <h4>Total Saldo Kas RT</h4>
          <h2 style={{ color: "green" }}>
            {formatRp(dashboardData.financial_total.balance)}
          </h2>
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "8px",
            minWidth: "200px",
          }}
        >
          <h4>Pemasukan Bulan Ini</h4>
          <h3 style={{ color: "blue" }}>
            {formatRp(dashboardData.financial_month.income)}
          </h3>
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "8px",
            minWidth: "200px",
          }}
        >
          <h4>Pengeluaran Bulan Ini</h4>
          <h3 style={{ color: "red" }}>
            {formatRp(dashboardData.financial_month.expense)}
          </h3>
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "8px",
            minWidth: "200px",
          }}
        >
          <h4>Status Rumah</h4>
          <p>Total: {dashboardData.houses.total} Unit</p>
          <p style={{ color: "green", margin: 0 }}>
            Dihuni: {dashboardData.houses.dihuni}
          </p>
          <p style={{ color: "red", margin: 0 }}>
            Kosong: {dashboardData.houses.kosong}
          </p>
        </div>
      </div>

      {/* Grafik Tahunan */}
      <h3>Grafik Keuangan Tahun {currentYear}</h3>
      <div
        style={{
          width: "100%",
          height: 400,
          border: "1px solid #eee",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bulan" />
            <YAxis tickFormatter={(value) => `Rp ${value / 1000}k`} />
            <Tooltip formatter={(value) => formatRp(value)} />
            <Legend />
            <Bar dataKey="pemasukan" name="Pemasukan" fill="#8884d8" />
            <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardPage;
