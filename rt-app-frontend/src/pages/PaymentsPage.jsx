import React, { useState, useEffect } from "react";
import api from "../api";
import Swal from "sweetalert2";
import { useSortableData } from "../hooks/useSortableData";

const PaymentsPage = () => {
  const [allUnpaidBills, setAllUnpaidBills] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedBills, setSelectedBills] = useState([]);

  const fetchAllUnpaid = async () => {
    try {
      const res = await api.get("/bills?status=belum_lunas");
      setAllUnpaidBills(res.data);
    } catch (error) {
      console.error("Error fetching unpaid bills:", error);
    }
  };

  useEffect(() => {
    fetchAllUnpaid();
  }, []);

  // Group bills by resident
  const groupedUnpaid = allUnpaidBills.reduce((acc, bill) => {
    if (!bill.resident) return acc; // Skip if no resident associated
    
    if (!acc[bill.resident_id]) {
      acc[bill.resident_id] = {
        resident: bill.resident,
        house: bill.house, // house where the bill was created
        bills: [],
        totalAmount: 0
      };
    }
    acc[bill.resident_id].bills.push(bill);
    acc[bill.resident_id].totalAmount += parseInt(bill.amount);
    return acc;
  }, {});

  const groupedArray = Object.values(groupedUnpaid);
  const { items: sortedGroups, requestSort, sortConfig } = useSortableData(groupedArray, { key: 'resident.name', direction: 'ascending' });

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedBills([]); // Reset checkbox
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelPayment = () => {
    setSelectedGroup(null);
    setSelectedBills([]);
  };

  const handleGenerateAdvance = async () => {
    const result = await Swal.fire({
      title: "Buat Tagihan Tahunan?",
      text: "Ini akan mencetak seluruh tagihan bulanan (sampai akhir tahun ini) untuk warga ini agar bisa dilunasi di muka.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Buat Sekarang",
      cancelButtonText: "Batal"
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.post("/bills/generate-advance", {
        resident_id: selectedGroup.resident.id,
      });
      
      Swal.fire({
        title: "Berhasil!",
        text: res.data.message,
        icon: "success",
      });
      
      fetchAllUnpaid();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Gagal",
        text: error.response?.data?.message || "Terjadi kesalahan saat membuat tagihan di muka.",
        icon: "error",
      });
    }
  };

  const handleCheckboxChange = (billId) => {
    setSelectedBills((prev) =>
      prev.includes(billId)
        ? prev.filter((id) => id !== billId)
        : [...prev, billId],
    );
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (selectedBills.length === 0) {
      return Swal.fire({
        title: "Pilih Tagihan",
        text: "Mohon centang setidaknya satu tagihan yang ingin dibayar terlebih dahulu.",
        icon: "warning",
        confirmButtonText: "Mengerti"
      });
    }

    // Ambil house_id dari tagihan pertama yang dipilih
    const firstSelectedBill = selectedGroup.bills.find(
      (b) => b.id === selectedBills[0],
    );

    try {
      await api.post("/payment-transactions", {
        resident_id: selectedGroup.resident.id,
        house_id: firstSelectedBill.house_id,
        bill_ids: selectedBills,
        notes: "Pembayaran Iuran Kolektif",
      });
      Swal.fire({
        title: "Pembayaran Diterima",
        text: "Terima kasih, pembayaran iuran berhasil dicatat dan sudah masuk ke kas RT.",
        icon: "success",
        confirmButtonText: "Selesai"
      });
      setSelectedGroup(null);
      setSelectedBills([]);
      fetchAllUnpaid(); // Refresh data
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Pembayaran Gagal",
        text: "Maaf, terjadi kesalahan saat memproses pembayaran. Mohon coba lagi.",
        icon: "error",
        confirmButtonText: "Tutup"
      });
    }
  };

  const totalSelectedAmount = selectedGroup
    ? selectedGroup.bills
        .filter((b) => selectedBills.includes(b.id))
        .reduce((sum, b) => sum + parseInt(b.amount), 0)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pembayaran Iuran</h2>
        <p className="text-gray-600 mt-1">Kelola dan terima pembayaran iuran dari warga yang memiliki tunggakan.</p>
      </div>

      {/* Form Pembayaran (Hanya Muncul Jika Warga Dipilih) */}
      {selectedGroup && (
        <form
          onSubmit={handlePayment}
          className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Proses Pembayaran: {selectedGroup.resident.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">Pilih tagihan yang akan dilunasi saat ini.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGenerateAdvance}
                className="text-sm font-medium text-primary-700 hover:text-primary-900 bg-primary-50 px-3 py-1.5 rounded border border-primary-200 hover:bg-primary-100 transition-colors shadow-sm"
              >
                Buat Tagihan 1 Tahun
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedBills.length === selectedGroup.bills.length) {
                    setSelectedBills([]);
                  } else {
                    setSelectedBills(selectedGroup.bills.map(b => b.id));
                  }
                }}
                className="text-sm font-medium text-gray-700 hover:text-primary-600 bg-white px-3 py-1.5 rounded border border-gray-300 hover:border-primary-300 transition-colors shadow-sm"
              >
                {selectedBills.length === selectedGroup.bills.length ? "Batal Semua" : "Pilih Semua"}
              </button>
              <button
                type="button"
                onClick={handleCancelPayment}
                className="text-sm font-medium text-gray-700 hover:text-rose-600 bg-white px-3 py-1.5 rounded border border-gray-300 hover:border-rose-300 transition-colors shadow-sm"
              >
                Tutup Form
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-3 mb-8">
              {selectedGroup.bills.map((bill) => {
                const isChecked = selectedBills.includes(bill.id);
                return (
                  <label 
                    key={bill.id} 
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      isChecked ? 'bg-primary-50 border-primary-300 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={bill.id}
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(bill.id)}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${isChecked ? 'text-primary-900' : 'text-gray-900'}`}>
                          {bill.fee_type?.name}
                        </span>
                        <span className={`font-bold ${isChecked ? 'text-primary-700' : 'text-gray-900'}`}>
                          Rp {parseInt(bill.amount).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm mt-1 gap-1 sm:gap-4">
                        <span className={`${isChecked ? 'text-primary-700' : 'text-gray-500'}`}>
                          Periode: {bill.period_month} / {bill.period_year}
                        </span>
                        {bill.house && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isChecked ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600'}`}>
                            Tagihan di Rumah {bill.house.house_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200">
              <div className="mb-4 sm:mb-0 text-center sm:text-left">
                <p className="text-sm text-gray-500 mb-1">Total yang harus dibayar</p>
                <h4 className="text-3xl font-bold text-primary-700">
                  Rp {totalSelectedAmount.toLocaleString("id-ID")}
                </h4>
              </div>
              <button 
                type="submit" 
                disabled={selectedBills.length === 0}
                className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-sm text-lg"
              >
                Konfirmasi Pembayaran
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Daftar Tunggakan (Selalu Tampil) */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Daftar Warga Menunggak</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
              {groupedArray.length} Warga
            </span>
          </div>
        </div>
        
        {groupedArray.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-emerald-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">Luar Biasa!</h3>
            <p className="mt-1 text-sm text-gray-500">Tidak ada satupun warga yang memiliki tunggakan iuran saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button type="button" onClick={() => requestSort('resident.name')} className="group flex items-center focus:outline-none">
                      Nama Warga {getSortIcon('resident.name')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Tunggakan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button type="button" onClick={() => requestSort('totalAmount')} className="group flex items-center focus:outline-none">
                      Total Nominal {getSortIcon('totalAmount')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedGroups.map((group) => (
                  <tr 
                    key={group.resident.id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedGroup?.resident.id === group.resident.id ? 'bg-primary-50/50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          {group.resident.ktp_photo ? (
                            <img
                              className="w-10 h-10 rounded-full object-cover border border-gray-300 shadow-sm"
                              src={`http://localhost:8000/storage/${group.resident.ktp_photo}`}
                              alt={`KTP ${group.resident.name}`}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg">
                              {group.resident.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{group.resident.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                        {group.bills.length} Tagihan
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-rose-600">
                      Rp {group.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <button
                        onClick={() => handleSelectGroup(group)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-primary-600 hover:border-primary-300 font-medium rounded-lg transition-colors shadow-sm"
                      >
                        Proses Pembayaran
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default PaymentsPage;
