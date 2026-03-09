import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { CreditCard, DollarSign, Filter, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { parseData, Order } from '../data';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FDB462'];

export default function Dashboard() {
  const [data] = useState<Order[]>(parseData());
  
  // Filter states
  const [selectedProduct, setSelectedProduct] = useState<string>('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('All');

  // Extract unique options for filters
  const productList = useMemo(() => ['All', ...new Set(data.map(d => d.product))], [data]);
  const paymentMethodList = useMemo(() => ['All', ...new Set(data.map(d => d.paymentMethod))], [data]);

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter(order => {
      const matchProduct = selectedProduct === 'All' || order.product === selectedProduct;
      const matchPayment = selectedPaymentMethod === 'All' || order.paymentMethod === selectedPaymentMethod;
      return matchProduct && matchPayment;
    });
  }, [data, selectedProduct, selectedPaymentMethod]);

  const kpis = useMemo(() => {
    const totalRevenue = filteredData.reduce((sum, order) => sum + order.price, 0);
    const totalOrders = new Set(filteredData.map(o => o.orderNumber)).size;
    const totalItems = filteredData.length;
    
    const productCounts = filteredData.reduce((acc, order) => {
      acc[order.product] = (acc[order.product] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sortedProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);
    const topProduct = sortedProducts.length > 0 ? sortedProducts[0][0] : 'N/A';

    return {
      totalRevenue,
      totalOrders,
      totalItems,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      topProduct
    };
  }, [filteredData]);

  const revenueByDate = useMemo(() => {
    const daily = filteredData.reduce((acc, order) => {
      acc[order.date] = (acc[order.date] || 0) + order.price;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(daily)
      .map(([date, revenue]) => ({
        date,
        formattedDate: format(parseISO(date), 'MMM dd'),
        revenue
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  const salesByProduct = useMemo(() => {
    const productSales = filteredData.reduce((acc, order) => {
      if (!acc[order.product]) {
        acc[order.product] = { count: 0, revenue: 0 };
      }
      acc[order.product].count += 1;
      acc[order.product].revenue += order.price;
      return acc;
    }, {} as Record<string, { count: number, revenue: number }>);

    return Object.entries(productSales)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredData]);

  const paymentMethodStats = useMemo(() => {
    const methods = filteredData.reduce((acc, order) => {
      acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Sales Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview of store performance and sales metrics</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 px-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select 
                value={selectedProduct} 
                onChange={e => setSelectedProduct(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {productList.map(p => <option key={p} value={p}>{p === 'All' ? 'All Products' : p}</option>)}
              </select>
              <select 
                value={selectedPaymentMethod} 
                onChange={e => setSelectedPaymentMethod(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {paymentMethodList.map(p => <option key={p} value={p}>{p === 'All' ? 'All Payment Methods' : p}</option>)}
              </select>
            </div>
          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Total Revenue" 
            value={`$${kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          />
          <KpiCard 
            title="Total Orders" 
            value={kpis.totalOrders.toString()}
            icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          />
          <KpiCard 
            title="Avg Order Value" 
            value={`$${kpis.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
          />
          <KpiCard 
            title="Top Product" 
            value={kpis.topProduct}
            icon={<Package className="w-5 h-5 text-amber-600" />}
            valueClass="text-lg truncate"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Over Time */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Revenue Over Time</h2>
            <div className="h-72">
              {revenueByDate.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueByDate} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="formattedDate" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#0ea5e9" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">No data for selected filters</div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Payment Methods</h2>
            <div className="h-72">
              {paymentMethodStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodStats}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentMethodStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">No data</div>
              )}
            </div>
          </div>

          {/* Sales by Product */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-3">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Revenue by Product</h2>
            <div className="h-80">
              {salesByProduct.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByProduct} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis 
                      type="number" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 12 }}
                      width={140}
                    />
                    <Tooltip 
                      cursor={{ fill: '#F1F5F9' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">No data</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Order Number</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Payment Method</th>
                  <th className="p-4 font-medium text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length > 0 ? (
                  filteredData.slice().reverse().slice(0, 10).map((order, i) => (
                    <tr key={`${order.orderNumber}-${i}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm font-medium text-slate-900">{order.orderNumber}</td>
                      <td className="p-4 text-sm text-slate-500">{order.date}</td>
                      <td className="p-4 text-sm text-slate-700">{order.product}</td>
                      <td className="p-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-900 text-right">
                        ${order.price.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No orders match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, valueClass = "text-3xl" }: { title: string, value: string, icon: React.ReactNode, valueClass?: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className="p-2 bg-slate-50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mt-auto">
        <div className={`font-bold text-slate-900 ${valueClass}`}>{value}</div>
      </div>
    </div>
  );
}
