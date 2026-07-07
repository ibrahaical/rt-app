import React, { useState, useEffect } from "react";
import api from "../api";
import Swal from "sweetalert2";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    expense_date: "",
    description: "",
  });

  const fetchExpenses = () => {
    api
      .get("/expenses")
      .then((res) => setExpenses(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expenses", formData);
      Swal.fire({
        title: "Catatan Disimpan",
        text: "Pengeluaran kas RT telah berhasil dicatat.",
        icon: "success",
        confirmButtonText: "Selesai"
      });
      setFormData({ title: "", amount: "", expense_date: "", description: "" });
      fetchExpenses();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Gagal Disimpan",
        text: "Maaf, terjadi kesalahan saat menyimpan pengeluaran. Mohon coba lagi.",
        icon: "error",
        confirmButtonText: "Tutup"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pengeluaran Kas RT</h2>
        <p className="text-gray-600 mt-1">Catat dan pantau semua pengeluaran operasional RT.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah Pengeluaran */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Catat Pengeluaran Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="expense-title" className="block text-sm font-medium text-gray-700 mb-1">Judul Pengeluaran</label>
                <input
                  id="expense-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="Misal: Bayar Listrik Pos Kamling"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="expense-amount" className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Rp</span>
                  </div>
                  <input
                    id="expense-amount"
                    type="text"
                    value={formData.amount ? formData.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, "");
                      setFormData({ ...formData, amount: rawValue });
                    }}
                    required
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="expense-date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                  id="expense-date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expense_date: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tabel List Pengeluaran */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Riwayat Pengeluaran</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Pengeluaran</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Belum ada riwayat pengeluaran.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(exp.expense_date).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {exp.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-rose-600 text-right">
                          Rp {parseInt(exp.amount).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
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

export default ExpensesPage;
