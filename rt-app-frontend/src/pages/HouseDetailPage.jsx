// src/pages/HouseDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

const HouseDetailPage = () => {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [residents, setResidents] = useState([]); // Untuk pilihan dropdown
  const [assignForm, setAssignForm] = useState({
    resident_id: "",
    start_date: new Date().toISOString().split("T")[0], // Default hari ini
  });

  const fetchData = async () => {
    try {
      // Fetch detail rumah beserta riwayatnya
      const houseRes = await api.get(`/houses/${id}`);
      setHouse(houseRes.data);

      // Fetch semua penghuni untuk opsi dropdown
      const residentsRes = await api.get("/residents");
      setResidents(residentsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/houses/${id}/assign-resident`, assignForm);
      alert("Penghuni berhasil ditempatkan!");
      setAssignForm({
        resident_id: "",
        start_date: new Date().toISOString().split("T")[0],
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error assigning resident:", error);
      alert("Gagal menempatkan penghuni.");
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Yakin ingin mengeluarkan penghuni ini?")) return;
    try {
      await api.post(`/houses/${id}/remove-resident`, {
        end_date: new Date().toISOString().split("T")[0],
      });
      alert("Penghuni berhasil dikeluarkan.");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error removing resident:", error);
    }
  };

  if (!house) return <p>Loading...</p>;

  // Cek apakah ada penghuni aktif
  const currentResident = house.histories.find((h) => h.end_date === null);

  return (
    <div>
      <Link to="/houses">← Kembali ke Daftar Rumah</Link>
      <h3>Detail Rumah: {house.house_number}</h3>
      <p>
        Status:{" "}
        <strong style={{ color: house.status === "dihuni" ? "green" : "red" }}>
          {house.status === "dihuni" ? "Dihuni" : "Kosong"}
        </strong>
      </p>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h4>Penghuni Sekarang</h4>
        {currentResident ? (
          <div>
            <p>Nama: {currentResident.resident?.name}</p>
            <p>Mulai Menempati: {currentResident.start_date}</p>
            <button onClick={handleRemove} style={{ color: "red" }}>
              Keluarkan Penghuni
            </button>
          </div>
        ) : (
          <div>
            <p>
              <i>Rumah sedang kosong.</i>
            </p>
            <form onSubmit={handleAssign}>
              <div style={{ marginBottom: "10px" }}>
                <label>Pilih Penghuni: </label>
                <select
                  required
                  value={assignForm.resident_id}
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      resident_id: e.target.value,
                    })
                  }
                >
                  <option value="">-- Pilih --</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>Tanggal Masuk: </label>
                <input
                  type="date"
                  required
                  value={assignForm.start_date}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, start_date: e.target.value })
                  }
                />
              </div>
              <button type="submit">Tempatkan Penghuni</button>
            </form>
          </div>
        )}
      </div>

      <h4>Riwayat Penghuni</h4>
      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Nama Penghuni</th>
            <th>Tanggal Masuk</th>
            <th>Tanggal Keluar</th>
          </tr>
        </thead>
        <tbody>
          {house.histories.map((history) => (
            <tr key={history.id}>
              <td>{history.resident?.name}</td>
              <td>{history.start_date}</td>
              <td>{history.end_date ? history.end_date : "Sekarang"}</td>
            </tr>
          ))}
          {house.histories.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                Belum ada riwayat
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h4>Riwayat Tagihan & Pembayaran</h4>
      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Periode (Bulan/Tahun)</th>
            <th>Jenis Iuran</th>
            <th>Penghuni</th>
            <th>Nominal</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {house.bills && house.bills.length > 0 ? (
            house.bills.map((bill) => (
              <tr key={bill.id}>
                <td>
                  {bill.period_month} / {bill.period_year}
                </td>
                <td>{bill.fee_type?.name}</td>
                <td>{bill.resident?.name}</td>
                <td>Rp {parseInt(bill.amount).toLocaleString("id-ID")}</td>
                <td style={{ color: bill.status === "lunas" ? "green" : "red" }}>
                  {bill.status === "lunas" ? "Lunas" : "Belum Lunas"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                Belum ada riwayat tagihan
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HouseDetailPage;
