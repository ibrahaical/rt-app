import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import Swal from "sweetalert2";
import { useSortableData } from "../hooks/useSortableData";
import { PhoneInput, defaultCountries } from 'react-international-phone';
import 'react-international-phone/style.css';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const ResidentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    resident_type: "",
    is_married: "",
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

  const { items: sortedResidents, requestSort, sortConfig } = useSortableData(residents, { key: 'name', direction: 'ascending' });

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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, ktp_photo: file });
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleEditClick = (resident) => {
    setEditingId(resident.id);
    setFormData({
      name: resident.name,
      phone: resident.phone,
      resident_type: resident.resident_type,
      is_married: resident.is_married ? 1 : 0,
      ktp_photo: null,
    });
    setPreviewUrl(resident.ktp_photo ? `http://localhost:8000/storage/${resident.ktp_photo}` : null);
    // Auto-scroll ke form
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      phone: "",
      resident_type: "",
      is_married: "",
      ktp_photo: null,
    });
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    data.append("resident_type", formData.resident_type);
    data.append("is_married", parseInt(formData.is_married) ? 1 : 0);
    if (formData.ktp_photo) {
      data.append("ktp_photo", formData.ktp_photo);
    }

    try {
      if (editingId) {
        data.append("_method", "PUT");
        await api.post(`/residents/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({
          title: "Data Diperbarui",
          text: "Informasi warga telah berhasil diperbarui.",
          icon: "success",
          confirmButtonText: "Selesai"
        });
      } else {
        await api.post("/residents", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({
          title: "Data Tersimpan",
          text: "Data warga baru telah berhasil ditambahkan ke dalam sistem.",
          icon: "success",
          confirmButtonText: "Selesai"
        });
      }
      
      fetchResidents();
      handleCancelEdit();
    } catch (error) {
      console.error("Error saving resident:", error);
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
      <div>
        <h2 className="text-h2-mobile md:text-h2-md lg:text-h2-lg font-heading font-bold text-gray-900">Data Penghuni</h2>
        <p className="text-body-mobile md:text-body-md text-gray-600 mt-1">Kelola data warga perumahan, baik warga tetap maupun kontrak.</p>
      </div>

      {/* Form Tambah/Edit Penghuni */}
      <div ref={formRef} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-h3-mobile md:text-h3-md font-heading font-semibold text-gray-900 mb-4">
          {editingId ? "Edit Penghuni" : "Tambah Penghuni Baru"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Data Teks (Kiri) */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="resident-name" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    id="resident-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    placeholder="Misal: Budi Santoso"
                  />
                </div>
                <div>
                  <label htmlFor="resident-phone" className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
                  <div className="flex items-center w-full border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-colors bg-white">
                    <div className="px-4 py-2 bg-gray-50 border-r border-gray-200 text-gray-600 font-medium select-none">
                      +62
                    </div>
                    <input
                      type="tel"
                      id="resident-phone"
                      name="phone"
                      value={formData.phone ? formData.phone.replace(/^\+62\s*/, '') : ''}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^\d\s-]/g, '');
                        if (val.startsWith('0')) {
                          val = val.substring(1);
                        }
                        setFormData({ ...formData, phone: val ? '+62' + val.replace(/[\s-]/g, '') : '' });
                      }}
                      required
                      placeholder="812 3456 7890"
                      className="w-full px-4 py-2 border-0 outline-none focus:ring-0"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="resident-type" className="block text-sm font-medium text-gray-700 mb-1">Status Penghuni</label>
                  <select
                    id="resident-type"
                    name="resident_type"
                    value={formData.resident_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  >
                    <option value="" disabled>-- Pilih Status Hunian --</option>
                    <option value="tetap">Tetap</option>
                    <option value="kontrak">Kontrak</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="resident-married" className="block text-sm font-medium text-gray-700 mb-1">Status Pernikahan</label>
                  <select
                    id="resident-married"
                    name="is_married"
                    value={formData.is_married}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  >
                    <option value="" disabled>-- Pilih Status Nikah --</option>
                    <option value={0}>Belum Menikah</option>
                    <option value={1}>Sudah Menikah</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Kolom Foto KTP (Kanan) */}
            <div className="lg:col-span-1 lg:border-l lg:border-gray-200 lg:pl-6 pt-4 lg:pt-0 border-t border-gray-200 lg:border-t-0 mt-4 lg:mt-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dokumen KTP</label>
              <div className="flex flex-col gap-4">
                {previewUrl ? (
                  <div className="w-full">
                    <img 
                      src={previewUrl} 
                      alt="Preview KTP" 
                      className="w-full h-auto aspect-[8/5] object-cover rounded-lg border border-gray-300 shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[8/5] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-medium">Belum ada foto</span>
                  </div>
                )}
                
                <div className="w-full space-y-2 mt-2">
                  <input 
                    type="file" 
                    name="ktp_photo" 
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100 transition-colors cursor-pointer"
                  />
                  {editingId && (
                    <span className="text-xs text-gray-500 block leading-tight">
                      *Abaikan jika tidak ingin mengubah KTP.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="submit" 
              className="text-cta-mobile md:text-cta-md font-bold px-5 md:px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm"
            >
              {editingId ? "Update Penghuni" : "Simpan Penghuni"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-cta-mobile md:text-cta-md font-bold px-5 md:px-6 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabel List Penghuni */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-h3-mobile md:text-h3-md font-heading font-semibold text-gray-900">Daftar Warga Terdaftar</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {residents.length} Orang
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">
                  <button type="button" onClick={() => requestSort('name')} className="group flex items-center focus:outline-none hover:text-primary-600 transition-colors">
                    Profil / KTP {getSortIcon('name')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">
                  <button type="button" onClick={() => requestSort('phone')} className="group flex items-center focus:outline-none hover:text-primary-600 transition-colors">
                    Kontak {getSortIcon('phone')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">
                  <button type="button" onClick={() => requestSort('resident_type')} className="group flex items-center focus:outline-none hover:text-primary-600 transition-colors">
                    Status Hunian {getSortIcon('resident_type')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">
                  <button type="button" onClick={() => requestSort('is_married')} className="group flex items-center focus:outline-none hover:text-primary-600 transition-colors">
                    Status Nikah {getSortIcon('is_married')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {residents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm text-gray-500 font-medium">Belum ada data warga yang terdaftar.</p>
                    <p className="text-xs text-gray-400 mt-1">Silakan tambahkan warga baru menggunakan form di atas.</p>
                  </td>
                </tr>
              ) : (
                sortedResidents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-16 h-10">
                          {resident.ktp_photo ? (
                            <img
                              className="w-16 h-10 rounded-md object-cover border border-gray-300 shadow-sm"
                              src={`http://localhost:8000/storage/${resident.ktp_photo}`}
                              alt={`KTP ${resident.name}`}
                            />
                          ) : (
                            <div className="w-16 h-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">No KTP</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{resident.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {(() => {
                        try {
                          const phoneNumber = parsePhoneNumberFromString(resident.phone);
                          return phoneNumber ? phoneNumber.formatInternational() : resident.phone;
                        } catch (e) {
                          return resident.phone;
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        resident.resident_type === 'tetap' ? 'bg-indigo-100 text-indigo-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {resident.resident_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {resident.is_married ? (
                        <span className="text-emerald-600 font-medium">Sudah Menikah</span>
                      ) : (
                        <span className="text-gray-500">Belum Menikah</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <div className="flex items-center justify-end">
                        <button 
                          onClick={() => handleEditClick(resident)}
                          className="text-cta-mobile md:text-cta-md font-bold px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors shadow-sm flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
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

export default ResidentsPage;
