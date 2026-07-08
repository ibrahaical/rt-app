import React, { useState, useEffect } from "react";
import api from "../api";

const MonthlyReportPage = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState({ incomes: [], expenses: [] });
  const [activeTab, setActiveTab] = useState('pemasukan');

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
          <h2 className="text-h2-mobile md:text-h2-md lg:text-h2-lg font-heading font-bold text-gray-900">Laporan Keuangan Bulanan</h2>
          <p className="text-body-mobile md:text-body-md text-gray-600 mt-1">Rincian pemasukan dan pengeluaran kas RT per bulan.</p>
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

      {/* Tabs Navigasi */}
      <div className="flex border-b border-gray-200">
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pemasukan' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('pemasukan')}
        >
          Pemasukan (Rp {totalIncome.toLocaleString('id-ID')})
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pengeluaran' 
              ? 'border-rose-600 text-rose-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('pengeluaran')}
        >
          Pengeluaran (Rp {totalExpense.toLocaleString('id-ID')})
        </button>
      </div>

      <div>
        {/* Kolom Pemasukan */}
        {activeTab === 'pemasukan' && (
          <div className="space-y-4">
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-blue-50 flex justify-between items-center">
                <h3 className="text-h3-mobile md:text-h3-md font-heading font-semibold text-blue-900">Daftar Pemasukan (Iuran)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left w-12 text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">No.</th>
                      <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Tanggal</th>
                      <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Sumber</th>
                      <th scope="col" className="px-6 py-3 text-right text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.incomes.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">Tidak ada pemasukan bulan ini.</td>
                      </tr>
                    ) : (
                      reportData.incomes.map((inc, index) => (
                        <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(inc.paid_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="font-medium text-base">{inc.resident?.name || 'Anonim'}</div>
                            <div className="text-gray-500 text-xs mb-1">Rumah: {inc.house?.house_number || '-'}</div>
                            
                            {inc.bills && inc.bills.length > 0 && (
                              <details className="mt-2.5 group">
                                <summary className="text-xs font-semibold text-blue-600 cursor-pointer select-none hover:text-blue-800 transition-colors list-none flex items-center">
                                  <span>Rincian {inc.bills.length} Tagihan</span>
                                  <svg className="w-3.5 h-3.5 ml-1 transform group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </summary>
                                <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-blue-200 py-1 max-h-48 overflow-y-auto custom-scrollbar">
                                  {inc.bills.map(b => (
                                    <div key={b.id} className="text-xs flex justify-between items-center gap-4">
                                      <span className="text-gray-600">{b.fee_type?.name} <span className="text-gray-400">({b.period_month}/{b.period_year})</span></span>
                                      <span className="font-medium text-gray-800">{formatRp(b.amount)}</span>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
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
        )}

        {/* Kolom Pengeluaran */}
        {activeTab === 'pengeluaran' && (
          <div className="space-y-4">
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-rose-50 flex justify-between items-center">
                <h3 className="text-h3-mobile md:text-h3-md font-heading font-semibold text-rose-900">Daftar Pengeluaran</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left w-12 text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">No.</th>
                      <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Tanggal</th>
                      <th scope="col" className="px-6 py-3 text-left text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Keterangan</th>
                      <th scope="col" className="px-6 py-3 text-right text-label-mobile md:text-label-md lg:text-label-lg font-accent font-semibold uppercase tracking-[0.2em] text-gray-500">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.expenses.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">Tidak ada pengeluaran bulan ini.</td>
                      </tr>
                    ) : (
                      reportData.expenses.map((exp, index) => (
                        <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                            {index + 1}
                          </td>
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
        )}
      </div>
    </div>
  );
};

export default MonthlyReportPage;
