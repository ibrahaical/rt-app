import React, { useState, useEffect } from "react";
import api from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashRes = await api.get(
          `/dashboard?month=${currentMonth}&year=${currentYear}`,
        );
        setDashboardData(dashRes.data);

        const chartRes = await api.get(
          `/reports/yearly-chart?year=${currentYear}`,
        );
        setChartData(chartRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboard();
  }, [currentMonth, currentYear]);

  if (!dashboardData) return (
    <div className="flex flex-col items-center justify-center h-64">
      <svg className="animate-spin h-8 w-8 text-primary-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-gray-500 text-sm">Memuat data dashboard...</p>
    </div>
  );

  const formatRp = (num) => `Rp ${parseInt(num).toLocaleString("id-ID")}`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard SmartRT</h2>
        <p className="text-gray-600">Ringkasan data dan keuangan pada tahun {currentYear}</p>
      </div>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-500">Total Saldo Kas RT</h4>
              <div className="p-2 bg-emerald-50 rounded-lg" aria-hidden="true">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-emerald-600">
              {formatRp(dashboardData.financial_total.balance)}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-500">Pemasukan Bulan Ini</h4>
              <div className="p-2 bg-blue-50 rounded-lg" aria-hidden="true">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-blue-600">
              {formatRp(dashboardData.financial_month.income)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-500">Pengeluaran Bulan Ini</h4>
              <div className="p-2 bg-rose-50 rounded-lg" aria-hidden="true">
                <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-rose-600">
              {formatRp(dashboardData.financial_month.expense)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-500">Status Rumah</h4>
              <div className="p-2 bg-indigo-50 rounded-lg" aria-hidden="true">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold">{dashboardData.houses.total} Unit</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-emerald-600">Dihuni:</span>
              <span className="font-semibold text-emerald-700">{dashboardData.houses.dihuni}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-rose-600">Kosong:</span>
              <span className="font-semibold text-rose-700">{dashboardData.houses.kosong}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grafik Tahunan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Grafik Keuangan Tahun {currentYear}</h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
              <YAxis 
                tickFormatter={(value) => `Rp ${value / 1000}k`} 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#6b7280', fontSize: 12}}
                dx={-10}
              />
              <Tooltip 
                formatter={(value) => formatRp(value)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="pemasukan" name="Pemasukan" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
