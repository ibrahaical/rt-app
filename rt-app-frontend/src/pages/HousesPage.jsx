import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Swal from "sweetalert2";
import { useSortableData } from "../hooks/useSortableData";

const HousesPage = () => {
  const [houses, setHouses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef(null);
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

  const { items: sortedHouses, requestSort, sortConfig } = useSortableData(houses, { key: 'house_number', direction: 'ascending' });

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    if (sortConfig.direction === 'ascending') {
      return (
        <svg className="w-4 h-4 ml-1 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 ml-1 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (house) => {
    setEditingId(house.id);
    setFormData({
      house_number: house.house_number,
    });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
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
        Swal.fire({
          title: "Data Diperbarui",
          text: "Data nomor rumah berhasil diperbarui.",
          icon: "success",
          confirmButtonText: "Selesai"
        });
      } else {
        await api.post("/houses", formData);
        Swal.fire({
          title: "Data Tersimpan",
          text: "Data rumah baru berhasil ditambahkan.",
          icon: "success",
          confirmButtonText: "Selesai"
        });
      }
      fetchHouses();
      handleCancelEdit();
    } catch (error) {
      console.error("Error saving house:", error);
      const errorMessage = error.response?.data?.message || "Gagal menyimpan data.";
      Swal.fire({
        title: "Gagal Tersimpan",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Tutup"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-h2-mobile md:text-h2-md lg:text-h2-lg font-heading font-bold text-gray-900">Data Rumah</h2>
          <p className="text-body-mobile md:text-body-md text-gray-600 mt-1">Total: {houses.length} unit rumah yang terdaftar di perumahan ini.</p>
        </div>
      </div>

      {/* Form Tambah/Edit Rumah */}
      <div ref={formRef} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-h3-mobile md:text-h3-md font-heading font-semibold text-gray-900 mb-4">
          {editingId ? "Edit Nomor Rumah" : "Tambah Rumah Baru"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="house-number" className="block text-sm font-medium text-gray-700 mb-1">Nomor Rumah</label>
            <input
              id="house-number"
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
              className="flex-1 sm:flex-none text-cta-mobile md:text-cta-md font-bold px-5 md:px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm"
            >
              {editingId ? "Update" : "Simpan"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 sm:flex-none text-cta-mobile md:text-cta-md font-bold px-5 md:px-6 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
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
                <th scope="col" className="px-6 py-3 text-left w-12 text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">
                  No.
                </th>
                <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">
                  <button type="button" onClick={() => requestSort('house_number')} className="group flex items-center focus:outline-none hover:text-primary-600 transition-colors">
                    Nomor Rumah {getSortIcon('house_number')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">
                  <button type="button" onClick={() => requestSort('status')} className="group flex items-center focus:outline-none hover:text-primary-600 transition-colors">
                    Status Hunian {getSortIcon('status')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">
                  <button type="button" onClick={() => requestSort('current_resident_history.resident.name')} className="group flex items-center focus:outline-none hover:text-primary-600 transition-colors">
                    Penghuni Saat Ini {getSortIcon('current_resident_history.resident.name')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {houses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Belum ada data rumah.</td>
                </tr>
              ) : (
                sortedHouses.map((house, index) => (
                  <tr key={house.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {index + 1}
                    </td>
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
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(house)}
                          className="text-cta-mobile md:text-cta-md font-bold px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors shadow-sm flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <Link 
                          to={`/houses/${house.id}`}
                          className="text-cta-mobile md:text-cta-md font-bold px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors shadow-sm flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Detail
                        </Link>
                      </div>
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
