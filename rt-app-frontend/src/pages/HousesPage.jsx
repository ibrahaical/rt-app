// src/pages/HousesPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Tambahkan import ini
import api from "../api";

const HousesPage = () => {
  const [houses, setHouses] = useState([]);

  const fetchHouses = async () => {
    try {
      const response = await api.get("/houses");
      setHouses(response.data);
    } catch (error) {
      console.error("Error fetching houses:", error);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  return (
    <div>
      <h3>Daftar Rumah</h3>
      <p>Total Rumah: {houses.length} unit</p>

      {/* Tabel List Rumah */}
      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Nomor Rumah</th>
            <th>Status Hunian</th>
            <th>Penghuni Saat Ini</th>
            <th>Aksi</th> {/* Kolom baru untuk tombol detail */}
          </tr>
        </thead>
        <tbody>
          {houses.map((house) => (
            <tr key={house.id}>
              <td>{house.house_number}</td>
              <td>
                <span
                  style={{ color: house.status === "dihuni" ? "green" : "red" }}
                >
                  {house.status === "dihuni" ? "Dihuni" : "Kosong"}
                </span>
              </td>
              <td>{house.current_resident_history?.resident?.name || "-"}</td>
              <td>
                {/* Tombol Lihat Detail */}
                <Link to={`/houses/${house.id}`}>Lihat Detail</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HousesPage;
