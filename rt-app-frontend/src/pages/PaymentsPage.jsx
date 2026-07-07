import React, { useState, useEffect } from "react";
import api from "../api";
import Swal from "sweetalert2";

const PaymentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState("");
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);

  useEffect(() => {
    api.get("/residents").then((res) => setResidents(res.data.data));
  }, []);

  // Fetch tagihan belum lunas setiap kali memilih resident
  useEffect(() => {
    if (selectedResident) {
      api
        .get(`/bills?resident_id=${selectedResident}&status=belum_lunas`)
        .then((res) => setUnpaidBills(res.data))
        .catch((err) => console.error(err));
      setSelectedBills([]); // Reset checkbox
    } else {
      setUnpaidBills([]);
    }
  }, [selectedResident]);

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

    // Ambil house_id dari tagihan pertama yang dipilih (asumsi 1 warga 1 rumah aktif)
    const firstSelectedBill = unpaidBills.find(
      (b) => b.id === selectedBills[0],
    );

    try {
      await api.post("/payment-transactions", {
        resident_id: selectedResident,
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
      setSelectedResident("");
      setUnpaidBills([]);
      setSelectedBills([]);
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

  const totalAmount = unpaidBills
    .filter((b) => selectedBills.includes(b.id))
    .reduce((sum, b) => sum + parseInt(b.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pembayaran Iuran</h2>
        <p className="text-gray-600 mt-1">Pilih warga dan centang tagihan yang akan dibayarkan.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="max-w-md">
          <label htmlFor="select-resident" className="block text-sm font-medium text-gray-700 mb-2">Pilih Warga</label>
          <select
            id="select-resident"
            value={selectedResident}
            onChange={(e) => setSelectedResident(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
          >
            <option value="">-- Pilih Warga --</option>
            {residents.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedResident && (
        <form
          onSubmit={handlePayment}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Checklist Tagihan Belum Lunas</h3>
            <div className="flex items-center gap-3">
              {unpaidBills.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedBills.length === unpaidBills.length) {
                      setSelectedBills([]);
                    } else {
                      setSelectedBills(unpaidBills.map(b => b.id));
                    }
                  }}
                  className="text-xs font-medium text-primary-700 hover:text-primary-900 underline transition-colors"
                >
                  {selectedBills.length === unpaidBills.length ? "Batal Semua" : "Pilih Semua"}
                </button>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                {unpaidBills.length} Tagihan Tertunggak
              </span>
            </div>
          </div>
          
          <div className="p-6">
            {unpaidBills.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500 font-medium">Tidak ada tagihan tertunggak untuk warga ini.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {unpaidBills.map((bill) => {
                  const isChecked = selectedBills.includes(bill.id);
                  return (
                    <label 
                      key={bill.id} 
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        isChecked ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200 hover:bg-gray-50'
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
                            {bill.fee_type.name}
                          </span>
                          <span className={`font-semibold ${isChecked ? 'text-primary-700' : 'text-gray-900'}`}>
                            Rp {parseInt(bill.amount).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${isChecked ? 'text-primary-700' : 'text-gray-500'}`}>
                          Periode: {bill.period_month} / {bill.period_year}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {unpaidBills.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200">
                <div className="mb-4 sm:mb-0 text-center sm:text-left">
                  <p className="text-sm text-gray-500 mb-1">Total yang harus dibayar</p>
                  <h4 className="text-2xl font-bold text-primary-700">
                    Rp {totalAmount.toLocaleString("id-ID")}
                  </h4>
                </div>
                <button 
                  type="submit" 
                  disabled={selectedBills.length === 0}
                  className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  Konfirmasi Pembayaran
                </button>
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default PaymentsPage;
