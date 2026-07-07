// src/pages/ResidentsPage.jsx
import React, { useState, useEffect } from "react";
import api from "../api";

const ResidentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    resident_type: "tetap",
    is_married: 0,
    ktp_photo: null,
  });

  const fetchResidents = async () => {
    try {
      const response = await api.get("/residents");
      setResidents(response.data.data);
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, ktp_photo: e.target.files[0] });
  };

  const handleEditClick = (resident) => {
    setEditingId(resident.id);
    setFormData({
      name: resident.name,
      phone: resident.phone,
      resident_type: resident.resident_type,
      is_married: resident.is_married ? 1 : 0,
      ktp_photo: null, // Jangan isi file dari backend, biar user upload ulang jika mau
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      phone: "",
      resident_type: "tetap",
      is_married: 0,
      ktp_photo: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    data.append("resident_type", formData.resident_type);
    data.append("is_married", formData.is_married ? 1 : 0);
    if (formData.ktp_photo) {
      data.append("ktp_photo", formData.ktp_photo);
    }

    try {
      if (editingId) {
        data.append("_method", "PUT");
        await api.post(`/residents/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Penghuni berhasil diperbarui!");
      } else {
        await api.post("/residents", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Penghuni berhasil ditambahkan!");
      }
      
      fetchResidents();
      handleCancelEdit();
    } catch (error) {
      console.error("Error saving resident:", error);
      const errorMessage = error.response?.data?.message || "Gagal menyimpan data.";
      const errorDetails = error.response?.data?.errors 
        ? JSON.stringify(error.response.data.errors) 
        : "";
      alert(`${errorMessage}\n${errorDetails}`);
    }
  };

  return (
    <div>
      <h3>Daftar Penghuni</h3>

      {/* Form Tambah Penghuni */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h4>{editingId ? "Edit Penghuni" : "Tambah Penghuni Baru"}</h4>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label>Nama Lengkap: </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>No. HP: </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Status Penghuni: </label>
            <select
              name="resident_type"
              value={formData.resident_type}
              onChange={handleInputChange}
            >
              <option value="tetap">Tetap</option>
              <option value="kontrak">Kontrak</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Status Pernikahan: </label>
            <select
              name="is_married"
              value={formData.is_married}
              onChange={handleInputChange}
            >
              <option value={0}>Belum Menikah</option>
              <option value={1}>Sudah Menikah</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Foto KTP: </label>
            <input type="file" name="ktp_photo" onChange={handleFileChange} />
            {editingId && (
              <small style={{ display: "block", color: "gray" }}>
                *Biarkan kosong jika tidak ingin mengubah foto KTP
              </small>
            )}
          </div>
          <button type="submit">{editingId ? "Update Penghuni" : "Simpan Penghuni"}</button>
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

      {/* Tabel List Penghuni */}
      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Foto KTP</th>
            <th>Nama</th>
            <th>No. HP</th>
            <th>Status</th>
            <th>Menikah</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {residents.map((resident) => (
            <tr key={resident.id}>
              <td>
                {/* Menampilkan Foto KTP */}
                {resident.ktp_photo ? (
                  <img
                    src={`http://localhost:8000/storage/${resident.ktp_photo}`}
                    alt={`KTP ${resident.name}`}
                    style={{
                      width: "80px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  "Tidak ada foto"
                )}
              </td>
              <td>{resident.name}</td>
              <td>{resident.phone}</td>
              <td>{resident.resident_type}</td>
              <td>{resident.is_married ? "Ya" : "Tidak"}</td>
              <td>
                <button onClick={() => handleEditClick(resident)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResidentsPage;
