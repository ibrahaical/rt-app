// src/pages/HousesPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Tambahkan import ini
import api from "../api";

const HousesPage = () => {
  const [houses, setHouses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    house_number: "",
  });

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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (house) => {
    setEditingId(house.id);
    setFormData({
      house_number: house.house_number,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ house_number: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/houses/${editingId}`, formData);
        alert("Rumah berhasil diperbarui!");
      } else {
        await api.post("/houses", formData);
        alert("Rumah berhasil ditambahkan!");
      }
      fetchHouses();
      handleCancelEdit();
    } catch (error) {
      console.error("Error saving house:", error);
      const errorMessage = error.response?.data?.message || "Gagal menyimpan data.";
      const errorDetails = error.response?.data?.errors 
        ? JSON.stringify(error.response.data.errors) 
        : "";
      alert(`${errorMessage}\n${errorDetails}`);
    }
  };

  return (
    <div>
      <h3>Daftar Rumah</h3>
      <p>Total Rumah: {houses.length} unit</p>

      {/* Form Tambah/Edit Rumah */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h4>{editingId ? "Edit Rumah" : "Tambah Rumah Baru"}</h4>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label>Nomor Rumah: </label>
            <input
              type="text"
              name="house_number"
              value={formData.house_number}
              onChange={handleInputChange}
              required
              placeholder="Misal: A1"
            />
          </div>
          <button type="submit">{editingId ? "Update Rumah" : "Simpan Rumah"}</button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{ marginLeft: "10px", backgroundColor: "gray", color: "white" }}
            >
              Batal Edit
            </button>
          )}
        </form>
      </div>

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
                <button 
                  onClick={() => handleEditClick(house)}
                  style={{ marginRight: "10px" }}
                >
                  Edit
                </button>
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
