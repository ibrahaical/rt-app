// src/pages/HousesPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Rumah</h2>
          <p className="text-gray-600 mt-1">Total: {houses.length} unit rumah yang terdaftar di perumahan ini.</p>
        </div>
      </div>

      {/* Form Tambah/Edit Rumah */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingId ? "Edit Nomor Rumah" : "Tambah Rumah Baru"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rumah</label>
            <input
              type="text"
              name="house_number"
              value={formData.house_number}
              onChange={handleInputChange}
              required
              placeholder="Misal: A1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              type="submit" 
              className="flex-1 sm:flex-none px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              {editingId ? "Update" : "Simpan"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 sm:flex-none px-6 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabel List Rumah */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Rumah</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Hunian</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penghuni Saat Ini</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {houses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Belum ada data rumah.</td>
                </tr>
              ) : (
                houses.map((house) => (
                  <tr key={house.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {house.house_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        house.status === "dihuni" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {house.status === "dihuni" ? "Dihuni" : "Kosong"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {house.current_resident_history?.resident?.name || <span className="text-gray-400 italic">Tidak ada</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <button 
                        onClick={() => handleEditClick(house)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </button>
                      <Link 
                        to={`/houses/${house.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HousesPage;
