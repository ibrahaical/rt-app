import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import Swal from "sweetalert2";

const HouseDetailPage = () => {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [residents, setResidents] = useState([]);
  const [assignForm, setAssignForm] = useState({
    resident_id: "",
    start_date: new Date().toISOString().split("T")[0],
  });

  const fetchData = async () => {
    try {
      const houseRes = await api.get(`/houses/${id}`);
      setHouse(houseRes.data);

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
      Swal.fire({
        title: "Penghuni Ditempatkan",
        text: "Warga yang dipilih sekarang resmi menempati rumah ini.",
        icon: "success",
        confirmButtonText: "Baik"
      });
      setAssignForm({
        resident_id: "",
        start_date: new Date().toISOString().split("T")[0],
      });
      fetchData();
    } catch (error) {
      console.error("Error assigning resident:", error);
      Swal.fire({
        title: "Gagal Menempatkan",
        text: "Maaf, terjadi kesalahan saat menempatkan penghuni.",
        icon: "error",
        confirmButtonText: "Tutup"
      });
    }
  };

  const handleRemove = async () => {
    const result = await Swal.fire({
      title: "Keluarkan Penghuni?",
      text: "Apakah Anda yakin warga ini sudah tidak lagi menempati rumah ini? Riwayat sebelumnya akan tetap tersimpan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Ya, Warga Sudah Pindah",
      cancelButtonText: "Batal"
    });

    if (!result.isConfirmed) return;

    try {
      await api.post(`/houses/${id}/remove-resident`, {
        end_date: new Date().toISOString().split("T")[0],
      });
      Swal.fire({
        title: "Penghuni Dikeluarkan",
        text: "Warga tersebut telah dipindahkan dari rumah ini.",
        icon: "success",
        confirmButtonText: "Selesai"
      });
      fetchData();
    } catch (error) {
      console.error("Error removing resident:", error);
      Swal.fire({
        title: "Gagal Diproses",
        text: "Terjadi kesalahan saat mengeluarkan penghuni.",
        icon: "error",
        confirmButtonText: "Tutup"
      });
    }
  };

  if (!house) return (
    <div className="flex flex-col items-center justify-center h-64">
      <svg className="animate-spin h-8 w-8 text-primary-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-gray-500 text-sm">Memuat detail rumah...</p>
    </div>
  );

  const currentResident = house.histories.find((h) => h.end_date === null);
  const isOccupied = house.status === "dihuni";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link 
          to="/houses" 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Daftar Rumah
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-h2-mobile md:text-h2-md lg:text-h2-lg font-heading font-bold text-gray-900">Detail Rumah {house.house_number}</h2>
            <div className="mt-2 flex items-center">
              <span className="text-gray-600 mr-2">Status Saat Ini:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isOccupied ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {isOccupied ? "Dihuni" : "Kosong"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Penghuni Sekarang */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-h3-mobile md:text-h3-md font-heading font-semibold text-gray-900">Penghuni Sekarang</h3>
            </div>
            <div className="p-6">
              {currentResident ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-start gap-3">
                      {currentResident.resident?.ktp_photo ? (
                        <div className="flex-shrink-0">
                          <img 
                            src={`http://localhost:8000/storage/${currentResident.resident.ktp_photo}`}
                            alt={`KTP ${currentResident.resident.name}`}
                            className="w-32 h-auto aspect-[8/5] object-cover rounded-md border border-gray-300 shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-32 h-auto aspect-[8/5] rounded-md bg-gray-100 border border-gray-200 flex flex-col items-center justify-center">
                           <div className="text-primary-600 font-bold text-xl mb-1">
                             {currentResident.resident?.name.charAt(0)}
                           </div>
                           <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">No KTP</span>
                        </div>
                      )}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{currentResident.resident?.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Sejak {new Date(currentResident.start_date).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <button 
                      onClick={handleRemove} 
                      className="w-full flex justify-center text-cta-mobile md:text-cta-md font-bold px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
                    >
                      Keluarkan Penghuni
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-center py-4 mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500 italic">Rumah sedang kosong.</p>
                  </div>
                  <form onSubmit={handleAssign} className="space-y-4 border-t border-gray-200 pt-4">
                    <div>
                      <label htmlFor="assign-resident" className="block text-sm font-medium text-gray-700 mb-1">Pilih Penghuni</label>
                      <select
                        id="assign-resident"
                        required
                        value={assignForm.resident_id}
                        onChange={(e) =>
                          setAssignForm({
                            ...assignForm,
                            resident_id: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">-- Pilih Warga --</option>
                        {residents.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                      
                      {/* Dynamic Helper Text */}
                      {(() => {
                        const selectedResident = residents.find(r => r.id.toString() === assignForm.resident_id.toString());
                        if (!selectedResident) return null;
                        
                        if (selectedResident.current_house_history && selectedResident.current_house_history.house) {
                          return (
                            <div className="mt-2 p-2.5 rounded-md bg-amber-50 border border-amber-200 flex items-start gap-2">
                              <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <p className="text-xs text-amber-700 leading-relaxed">
                                <span className="font-semibold">Perhatian:</span> Warga ini sedang menempati <span className="font-bold">Rumah {selectedResident.current_house_history.house.house_number}</span>. Proses ini akan otomatis memindahkannya dari rumah lamanya.
                              </p>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="mt-2 p-2.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-emerald-700 font-medium">
                              Warga ini belum menempati rumah manapun.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                    <div>
                      <label htmlFor="assign-date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Masuk</label>
                      <input
                        id="assign-date"
                        type="date"
                        required
                        value={assignForm.start_date}
                        onChange={(e) =>
                          setAssignForm({ ...assignForm, start_date: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full flex justify-center text-cta-mobile md:text-cta-md font-bold px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                      Tempatkan Penghuni
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Riwayat-riwayat */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Riwayat Penghuni */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-h3-mobile md:text-h3-md font-heading font-semibold text-gray-900">Riwayat Penghuni</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left w-12 text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">No.</th>
                    <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Nama Penghuni</th>
                    <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Tanggal Masuk</th>
                    <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Tanggal Keluar</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {house.histories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Belum ada riwayat penghuni.</td>
                    </tr>
                  ) : (
                    house.histories.map((history, index) => (
                      <tr key={history.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {history.resident?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(history.start_date).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {history.end_date ? (
                            new Date(history.end_date).toLocaleDateString("id-ID")
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                Sekarang
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Riwayat Tagihan & Pembayaran */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-h3-mobile md:text-h3-md font-heading font-semibold text-gray-900">Riwayat Tagihan & Pembayaran</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left w-12 text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">No.</th>
                    <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Periode</th>
                    <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Jenis Iuran</th>
                    <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Penghuni</th>
                    <th scope="col" className="px-6 py-3 text-right text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Nominal</th>
                    <th scope="col" className="px-6 py-3 text-center text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {house.bills && house.bills.length > 0 ? (
                    house.bills.map((bill, index) => (
                      <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {bill.period_month} / {bill.period_year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {bill.fee_type?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bill.resident?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          Rp {parseInt(bill.amount).toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bill.status === "lunas" 
                              ? "bg-emerald-100 text-emerald-800" 
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {bill.status === "lunas" ? "Lunas" : "Belum Lunas"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        Belum ada riwayat tagihan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HouseDetailPage;
