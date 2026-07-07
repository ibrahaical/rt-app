import React, { useState, useEffect } from "react";
import api from "../api";
import Swal from "sweetalert2";

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchBills = async () => {
    try {
      const response = await api.get("/bills");
      setBills(response.data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Hit POST /bills/generate sesuai instruksi
      const response = await api.post("/bills/generate");
      
      let message = "";
      if (response.data.created > 0 && response.data.skipped === 0) {
        message = "Sukses! Tagihan bulan ini telah berhasil diterbitkan untuk semua rumah yang ada penghuninya.";
      } else if (response.data.created > 0 && response.data.skipped > 0) {
        message = "Berhasil menambahkan tagihan untuk penghuni yang belum ditagih. Penghuni yang sudah ditagih sebelumnya tidak ditagih ulang (tidak ada tagihan ganda).";
      } else if (response.data.created === 0 && response.data.skipped > 0) {
        message = "Tagihan untuk bulan ini sudah pernah Anda terbitkan sebelumnya. Sistem membatalkan proses agar tidak terjadi tagihan ganda pada warga.";
      } else {
        message = "Belum ada warga yang menempati rumah, sehingga tidak ada tagihan yang diterbitkan.";
      }

      Swal.fire({
        title: "Selesai",
        text: message,
        icon: "success",
        confirmButtonText: "Baik, Terima Kasih"
      });
      fetchBills(); // Refresh tabel tagihan
    } catch (error) {
      console.error("Error generating bills:", error);
      Swal.fire({
        title: "Terjadi Kesalahan",
        text: "Sistem gagal membuat tagihan. Mohon coba beberapa saat lagi.",
        icon: "error",
        confirmButtonText: "Tutup"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Kelola Tagihan Iuran</h2>
        <p className="text-gray-600 mt-1">Buat tagihan iuran bulanan untuk semua warga yang menempati rumah.</p>
      </div>

      <div className="bg-primary-50 p-6 rounded-xl border border-primary-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-primary-900">Generate Tagihan Bulan Ini</h3>
          <p className="text-primary-700 mt-1 text-sm max-w-2xl">
            Klik tombol di samping untuk membuat tagihan iuran Satpam & Kebersihan bulan ini. Sistem secara otomatis hanya akan menagih rumah yang sedang dihuni. Tagihan yang sudah ada untuk bulan ini akan dilewati.
          </p>
        </div>
        <button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="flex-shrink-0 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center min-w-[200px]"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </>
          ) : (
            "Generate Tagihan"
          )}
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Semua Tagihan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rumah</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penghuni</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Iuran</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bills.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                    Belum ada tagihan. Silakan klik tombol generate di atas.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Blok {bill.house?.house_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {bill.resident?.name || <span className="text-gray-400 italic">Kosong</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {bill.fee_type?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {bill.period_month} / {bill.period_year}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                      Rp {parseInt(bill.amount).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {bill.status === "lunas" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Lunas
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                          Belum Lunas
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
    </div>
  );
};

export default BillsPage;
