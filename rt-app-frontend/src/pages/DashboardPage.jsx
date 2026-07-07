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
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500 text-lg">Loading Dashboard...</p>
    </div>
  );

  const formatRp = (num) => `Rp ${parseInt(num).toLocaleString("id-ID")}`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard RT</h2>
        <p className="text-gray-600">Ringkasan data dan keuangan RT pada tahun {currentYear}</p>
      </div>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Total Saldo Kas RT</h4>
            <h2 className="text-3xl font-bold text-emerald-600">
              {formatRp(dashboardData.financial_total.balance)}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Pemasukan Bulan Ini</h4>
            <h3 className="text-2xl font-bold text-blue-600">
              {formatRp(dashboardData.financial_month.income)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Pengeluaran Bulan Ini</h4>
            <h3 className="text-2xl font-bold text-rose-600">
              {formatRp(dashboardData.financial_month.expense)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Status Rumah</h4>
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
              <Bar dataKey="pemasukan" name="Pemasukan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
