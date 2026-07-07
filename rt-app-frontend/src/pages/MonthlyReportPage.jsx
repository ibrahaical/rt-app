import React, { useState, useEffect } from "react";
import api from "../api";

const MonthlyReportPage = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState({ incomes: [], expenses: [] });

  const fetchReport = async () => {
    try {
      const response = await api.get(
        `/reports/monthly-detail?month=${month}&year=${year}`,
      );
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching detail:", error);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const formatRp = (num) => `Rp ${parseInt(num).toLocaleString("id-ID")}`;
  
  const totalIncome = reportData.incomes.reduce((sum, item) => sum + parseInt(item.total_amount || 0), 0);
  const totalExpense = reportData.expenses.reduce((sum, item) => sum + parseInt(item.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Laporan Keuangan Bulanan</h2>
          <p className="text-gray-600 mt-1">Rincian pemasukan dan pengeluaran kas RT per bulan.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 mr-2">Bulan:</span>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('id-ID', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div className="w-px h-6 bg-gray-300"></div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 mr-2">Tahun:</span>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-20 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Pemasukan */}
        <div className="space-y-4">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-blue-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-blue-900">Daftar Pemasukan (Iuran)</h3>
              <span className="font-bold text-blue-700">{formatRp(totalIncome)}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sumber</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.incomes.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">Tidak ada pemasukan bulan ini.</td>
                    </tr>
                  ) : (
                    reportData.incomes.map((inc) => (
                      <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(inc.paid_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{inc.resident?.name || 'Anonim'}</div>
                          <div className="text-gray-500 text-xs">Rumah: {inc.house?.house_number || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 text-right">
                          {formatRp(inc.total_amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kolom Pengeluaran */}
        <div className="space-y-4">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-rose-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-rose-900">Daftar Pengeluaran</h3>
              <span className="font-bold text-rose-700">{formatRp(totalExpense)}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.expenses.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">Tidak ada pengeluaran bulan ini.</td>
                    </tr>
                  ) : (
                    reportData.expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(exp.expense_date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {exp.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-rose-600 text-right">
                          {formatRp(exp.amount)}
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

export default MonthlyReportPage;
