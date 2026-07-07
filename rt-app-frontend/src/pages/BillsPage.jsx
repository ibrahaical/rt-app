// src/pages/BillsPage.jsx
import React, { useState, useEffect } from "react";
import api from "../api";

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchBills = async () => {
    try {
      const response = await api.get("/bills");
      setBills(response.data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Hit POST /bills/generate sesuai instruksi
      const response = await api.post("/bills/generate");
      alert(
        `Selesai! ${response.data.created} tagihan baru dibuat, ${response.data.skipped} dilewati/sudah ada.`,
      );
      fetchBills(); // Refresh tabel tagihan
    } catch (error) {
      console.error("Error generating bills:", error);
      alert("Gagal men-generate tagihan.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <h3>Kelola Tagihan Iuran</h3>

      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f0f8ff",
          border: "1px solid #b0c4de",
        }}
      >
        <p>
          Klik tombol di bawah ini untuk membuat tagihan iuran Satpam &
          Kebersihan bulan ini untuk semua rumah yang sedang dihuni.
        </p>
        <button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? "Memproses..." : "Generate Tagihan Bulan Ini"}
        </button>
      </div>

      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Rumah</th>
            <th>Penghuni</th>
            <th>Jenis Iuran</th>
            <th>Periode</th>
            <th>Nominal</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill) => (
            <tr key={bill.id}>
              <td>{bill.house?.house_number}</td>
              <td>{bill.resident?.name}</td>
              <td>{bill.fee_type?.name}</td>
              <td>
                {bill.period_month} / {bill.period_year}
              </td>
              <td>Rp {bill.amount.toLocaleString("id-ID")}</td>
              <td>
                <span
                  style={{
                    color: bill.status === "lunas" ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {bill.status === "lunas" ? "Lunas" : "Belum Lunas"}
                </span>
              </td>
            </tr>
          ))}
          {bills.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Belum ada tagihan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BillsPage;
