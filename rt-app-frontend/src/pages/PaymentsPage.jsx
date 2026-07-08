import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import Swal from "sweetalert2";
import { useSortableData } from "../hooks/useSortableData";

const PaymentsPage = () => {
  const [allUnpaidBills, setAllUnpaidBills] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState(null);
  const [selectedBills, setSelectedBills] = useState([]);
  const paymentFormRef = useRef(null);

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
  const selectedGroup = selectedResidentId && groupedUnpaid[selectedResidentId] ? groupedUnpaid[selectedResidentId] : null;
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
    setSelectedResidentId(group.resident.id);
    setSelectedBills([]); // Reset checkbox
    // Auto-scroll ke form agar pengguna yang scroll ke bawah bisa langsung melihat form di atas
    setTimeout(() => paymentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleCancelPayment = () => {
    setSelectedResidentId(null);
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
      // Biarkan form tetap terbuka. Jika tagihan lunas semua, form akan otomatis hilang.
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
        <h2 className="text-h2-mobile md:text-h2-md lg:text-h2-lg font-heading font-bold text-gray-900">Pembayaran Iuran</h2>
        <p className="text-body-mobile md:text-body-md text-gray-600 mt-1">Kelola dan terima pembayaran iuran dari warga yang memiliki tunggakan.</p>
      </div>

      {/* Form Pembayaran (Hanya Muncul Jika Warga Dipilih) */}
      {selectedGroup && (
        <form
          ref={paymentFormRef}
          onSubmit={handlePayment}
          className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden mb-8 scroll-mt-6"
        >
          <div className="px-6 py-6 border-b border-gray-200 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* KTP Photo Column */}
              <div className="md:col-span-4 lg:col-span-3">
                {selectedGroup.resident.ktp_photo ? (
                  <a href={`http://localhost:8000/storage/${selectedGroup.resident.ktp_photo}`} target="_blank" rel="noreferrer" title="Klik untuk memperbesar KTP">
                    <img
                      className="w-full aspect-[8/5] rounded-xl object-cover border border-gray-300 shadow-sm hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer"
                      src={`http://localhost:8000/storage/${selectedGroup.resident.ktp_photo}`}
                      alt={`KTP ${selectedGroup.resident.name}`}
                    />
                  </a>
                ) : (
                  <div className="w-full aspect-[8/5] rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex flex-col items-center justify-center font-bold shadow-sm">
                    <span className="text-4xl mb-2">{selectedGroup.resident.name.charAt(0)}</span>
                    <span className="text-xs text-indigo-400 font-medium uppercase tracking-wider">No KTP</span>
                  </div>
                )}
              </div>
              
              {/* Info & Actions Column */}
              <div className="md:col-span-8 lg:col-span-9 flex flex-col h-full justify-center gap-4">
                <div>
                  <h3 className="text-h2-mobile md:text-h2-md lg:text-h2-lg font-heading font-bold text-gray-900">{selectedGroup.resident.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 capitalize shadow-sm">
                      Warga {selectedGroup.resident.resident_type}
                    </span>
                    <span className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                      <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {selectedGroup.resident.phone}
                    </span>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleGenerateAdvance}
                    className="text-cta-mobile md:text-cta-md font-bold text-primary-700 hover:text-primary-900 bg-primary-50 px-5 py-2.5 rounded-lg border border-primary-200 hover:bg-primary-100 transition-colors shadow-sm"
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
                    className="text-cta-mobile md:text-cta-md font-bold text-gray-700 hover:text-primary-600 bg-white px-5 py-2.5 rounded-lg border border-gray-300 hover:border-primary-300 transition-colors shadow-sm"
                  >
                    {selectedBills.length === selectedGroup.bills.length ? "Batal Semua" : "Pilih Semua"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPayment}
                    className="text-cta-mobile md:text-cta-md font-bold text-gray-700 hover:text-rose-600 bg-white px-5 py-2.5 rounded-lg border border-gray-300 hover:border-rose-300 transition-colors shadow-sm"
                  >
                    Tutup Form
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">Pilih tagihan yang akan dilunasi saat ini:</p>
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
                className="w-full sm:w-auto text-cta-mobile md:text-cta-md font-bold px-8 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-sm"
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
            <h3 className="text-h3-mobile md:text-h3-md font-heading font-semibold text-gray-900">Daftar Warga Menunggak</h3>
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
                  <th scope="col" className="px-6 py-3 text-left w-12 text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">
                    No.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">
                    <button type="button" onClick={() => requestSort('resident.name')} className="group flex items-center focus:outline-none hover:text-primary-600 transition-colors">
                      Nama Warga {getSortIcon('resident.name')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Jumlah Tunggakan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">
                    <button type="button" onClick={() => requestSort('totalAmount')} className="group flex items-center focus:outline-none hover:text-primary-600 transition-colors">
                      Total Nominal {getSortIcon('totalAmount')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedGroups.map((group, index) => (
                  <tr 
                    key={group.resident.id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedGroup?.resident.id === group.resident.id ? 'bg-primary-50/50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{group.resident.name}</div>
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
                        className="text-cta-mobile md:text-cta-md font-bold px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-primary-600 hover:border-primary-300 rounded-lg transition-colors shadow-sm"
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
