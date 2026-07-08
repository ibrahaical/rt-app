import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import Swal from "sweetalert2";

const PaymentsPage = () => {
  const [allResidents, setAllResidents] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState(null);
  const [selectedResidentBills, setSelectedResidentBills] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const paymentFormRef = useRef(null);
  const dropdownRef = useRef(null);

  const fetchAllResidents = async () => {
    try {
      const res = await api.get("/residents");
      setAllResidents(res.data.data || res.data); // Handle pagination format if any
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
  };

  useEffect(() => {
    fetchAllResidents();
  }, []);

  const fetchResidentBills = async (id) => {
    try {
      const res = await api.get(`/bills?resident_id=${id}`);
      setSelectedResidentBills(res.data);
    } catch (error) {
      console.error("Error fetching resident bills:", error);
    }
  };

  useEffect(() => {
    if (selectedResidentId) {
      fetchResidentBills(selectedResidentId);
    } else {
      setSelectedResidentBills([]);
    }
  }, [selectedResidentId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredResidents = allResidents.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.phone && r.phone.includes(searchQuery))
  );

  const selectedGroup = selectedResidentId ? {
    resident: allResidents.find(r => r.id === selectedResidentId),
    bills: selectedResidentBills
  } : null;

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
      
      if (selectedResidentId) fetchResidentBills(selectedResidentId);
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
      
      setSelectedBills([]);
      fetchResidentBills(selectedResidentId);
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
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-h2-mobile md:text-h2-md lg:text-h2-lg font-heading font-bold text-gray-900">Pembayaran & Riwayat Iuran</h2>
        <p className="text-body-mobile md:text-body-md text-gray-600 mt-1">Kelola pembayaran iuran atau cek seluruh riwayat tagihan (lunas dan belum lunas) per warga.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Cari & Pilih Warga</label>
        <div className="relative max-w-md" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 shadow-sm hover:border-primary-400 transition-colors cursor-pointer flex justify-between items-center"
          >
            <div className="flex flex-col min-w-0">
              {selectedGroup && selectedGroup.resident ? (
                <>
                  <span className="text-gray-900 text-sm font-semibold truncate">{selectedGroup.resident.name}</span>
                  <span className="text-gray-500 text-xs truncate mt-0.5">{selectedGroup.resident.phone}</span>
                </>
              ) : (
                <span className="text-gray-500 text-sm">Cari nama atau nomor telepon warga...</span>
              )}
            </div>
            <svg className={`h-5 w-5 text-gray-400 shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 border-b border-gray-100 bg-gray-50 shrink-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="Ketik untuk mencari warga..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
              </div>
              <div className="overflow-y-auto custom-scrollbar flex-1">
                {filteredResidents.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-gray-500 text-sm font-medium">Warga tidak ditemukan.</p>
                  </div>
                ) : (
                  filteredResidents.map(r => (
                    <div 
                      key={r.id}
                      onClick={() => {
                        setSelectedResidentId(r.id);
                        setSelectedBills([]);
                        setIsDropdownOpen(false);
                        setSearchQuery("");
                      }}
                      className={`px-4 py-3 cursor-pointer border-b border-gray-50 last:border-0 hover:bg-primary-50 transition-colors flex justify-between items-center ${selectedResidentId === r.id ? 'bg-primary-50' : ''}`}
                    >
                      <div className="flex flex-col min-w-0 mr-3">
                        <span className={`text-sm truncate ${selectedResidentId === r.id ? 'font-bold text-primary-900' : 'font-medium text-gray-900'}`}>{r.name}</span>
                        <span className="text-xs text-gray-500 truncate mt-0.5">{r.phone}</span>
                      </div>
                      {selectedResidentId === r.id && (
                        <svg className="h-4 w-4 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedGroup && selectedGroup.resident && (
        <form
          ref={paymentFormRef}
          onSubmit={handlePayment}
          className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="px-6 py-6 border-b border-gray-200 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
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
                    {(() => {
                      const unpaidCount = selectedGroup.bills.filter(b => b.status === 'belum_lunas').length;
                      const unpaidTotal = selectedGroup.bills.filter(b => b.status === 'belum_lunas').reduce((sum, b) => sum + parseInt(b.amount), 0);
                      
                      if (selectedGroup.bills.length === 0) {
                        return (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 shadow-sm border border-gray-200">
                            Belum Ada Tagihan
                          </span>
                        );
                      }

                      if (unpaidCount === 0) {
                        return (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200">
                            <svg className="w-4 h-4 mr-1.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Bebas Tunggakan
                          </span>
                        );
                      }

                      return (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-rose-100 text-rose-800 shadow-sm border border-rose-200">
                          <svg className="w-4 h-4 mr-1.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Menunggak {unpaidCount} Tagihan (Rp {unpaidTotal.toLocaleString('id-ID')})
                        </span>
                      );
                    })()}
                  </div>
                </div>

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
                      const unpaidBills = selectedGroup.bills.filter(b => b.status === 'belum_lunas');
                      if (selectedBills.length === unpaidBills.length && unpaidBills.length > 0) {
                        setSelectedBills([]);
                      } else {
                        setSelectedBills(unpaidBills.map(b => b.id));
                      }
                    }}
                    className="text-cta-mobile md:text-cta-md font-bold text-gray-700 hover:text-primary-600 bg-white px-5 py-2.5 rounded-lg border border-gray-300 hover:border-primary-300 transition-colors shadow-sm"
                  >
                    {(() => {
                      const unpaidBills = selectedGroup.bills.filter(b => b.status === 'belum_lunas');
                      return selectedBills.length === unpaidBills.length && unpaidBills.length > 0 ? "Batal Semua" : "Pilih Semua";
                    })()}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPayment}
                    className="text-cta-mobile md:text-cta-md font-bold text-gray-700 hover:text-rose-600 bg-white px-5 py-2.5 rounded-lg border border-gray-300 hover:border-rose-300 transition-colors shadow-sm"
                  >
                    Tutup Profil
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">Daftar Seluruh Riwayat Tagihan & Pembayaran Warga:</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-3 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedGroup.bills.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 font-medium">Belum ada satupun tagihan untuk warga ini.</p>
                </div>
              ) : (
                selectedGroup.bills.map((bill) => {
                  const isPaid = bill.status === 'lunas';
                  const isChecked = selectedBills.includes(bill.id);
                  return (
                    <label 
                      key={bill.id} 
                      className={`flex items-center p-4 border rounded-lg transition-colors ${
                        isPaid ? 'bg-emerald-50/30 border-emerald-200 opacity-90 cursor-default' : 
                        (isChecked ? 'bg-primary-50 border-primary-300 shadow-sm cursor-pointer' : 'bg-white border-gray-200 hover:bg-gray-50 cursor-pointer')
                      }`}
                    >
                      {!isPaid ? (
                        <input
                          type="checkbox"
                          value={bill.id}
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(bill.id)}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${isPaid ? 'text-emerald-900' : (isChecked ? 'text-primary-900' : 'text-gray-900')}`}>
                            {bill.fee_type?.name}
                          </span>
                          <div className="flex items-center gap-3">
                            {isPaid && <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">LUNAS</span>}
                            <span className={`font-bold ${isPaid ? 'text-emerald-700' : (isChecked ? 'text-primary-700' : 'text-gray-900')}`}>
                              Rp {parseInt(bill.amount).toLocaleString("id-ID")}
                            </span>
                          </div>
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
                })
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200">
              <div className="mb-4 sm:mb-0 text-center sm:text-left">
                <p className="text-sm text-gray-500 mb-1">Total yang harus dibayar saat ini</p>
                <h4 className="text-3xl font-bold text-primary-700">
                  Rp {totalSelectedAmount.toLocaleString("id-ID")}
                </h4>
              </div>
              <button 
                type="submit" 
                disabled={selectedBills.length === 0}
                className="w-full sm:w-auto text-cta-mobile md:text-cta-md font-bold px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-sm"
              >
                Konfirmasi Pembayaran
              </button>
            </div>
          </div>
        </form>
      )}

    </div>
  );
};

export default PaymentsPage;
