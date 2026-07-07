import React, { useState, useEffect } from "react";
import api from "../api";

const MonthlyReportPage = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState({ incomes: [], expenses: [] });

  const fetchReport = async () => {
    try {
      const response = await api.get(
        `/reports/monthly-detail?month=${month}&year=${year}`,
      );
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching detail:", error);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const formatRp = (num) => `Rp ${parseInt(num).toLocaleString("id-ID")}`;

  return (
    <div>
      <h2>Laporan Detail Bulanan</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>Bulan: </label>
        <input
          type="number"
          min="1"
          max="12"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <label>Tahun: </label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ marginRight: "10px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* Tabel Pemasukan */}
        <div style={{ flex: 1, minWidth: "400px" }}>
          <h3 style={{ color: "blue" }}>Daftar Pemasukan (Iuran)</h3>
          <table
            border="1"
            cellPadding="8"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f0f8ff" }}>
                <th>Tanggal</th>
                <th>Dari Rumah</th>
                <th>Warga</th>
                <th>Total Pemasukan</th>
              </tr>
            </thead>
            <tbody>
              {reportData.incomes.map((inc) => (
                <tr key={inc.id}>
                  <td>{new Date(inc.paid_at).toLocaleDateString()}</td>
                  <td>{inc.house?.house_number}</td>
                  <td>{inc.resident?.name}</td>
                  <td>{formatRp(inc.total_amount)}</td>
                </tr>
              ))}
              {reportData.incomes.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    Tidak ada data pemasukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tabel Pengeluaran */}
        <div style={{ flex: 1, minWidth: "400px" }}>
          <h3 style={{ color: "red" }}>Daftar Pengeluaran</h3>
          <table
            border="1"
            cellPadding="8"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#fff0f5" }}>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Total Pengeluaran</th>
              </tr>
            </thead>
            <tbody>
              {reportData.expenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{new Date(exp.expense_date).toLocaleDateString()}</td>
                  <td>{exp.title}</td>
                  <td>{formatRp(exp.amount)}</td>
                </tr>
              ))}
              {reportData.expenses.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    Tidak ada data pengeluaran
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportPage;
