
import React, { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Wallet, 
  Calendar,
  Filter,
  User,
  CreditCard,
  RefreshCcw,
  Search,
  FileDown,
  Trophy as TrophyIcon
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend } from 'recharts';

const Reports: React.FC = () => {
  const { invoices, products, customers } = useApp();

  // Filter States
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('all');
  const [selectedPaymentType, setSelectedPaymentType] = useState('all');

  // Filter Logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const invDate = new Date(inv.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      const matchesDateFrom = !fromDate || invDate >= fromDate;
      const matchesDateTo = !toDate || invDate <= toDate;
      const matchesCustomer = selectedCustomerId === 'all' || inv.customerId === selectedCustomerId;
      const matchesPayment = selectedPaymentType === 'all' || inv.paymentType === selectedPaymentType;

      return matchesDateFrom && matchesDateTo && matchesCustomer && matchesPayment;
    });
  }, [invoices, dateFrom, dateTo, selectedCustomerId, selectedPaymentType]);

  const totalSales = useMemo(() => filteredInvoices.reduce((sum, inv) => sum + inv.total, 0), [filteredInvoices]);
  
  const totalPurchaseCost = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => {
      return sum + inv.items.reduce((itemSum, item) => {
        const prod = products.find(p => p.id === item.productId);
        return itemSum + (prod ? prod.purchasePrice * item.quantity : 0);
      }, 0);
    }, 0);
  }, [filteredInvoices, products]);

  const totalProfit = totalSales - totalPurchaseCost;
  const totalOutstanding = useMemo(() => customers.reduce((sum, c) => sum + c.totalOutstanding, 0), [customers]);
  const inventoryValue = useMemo(() => products.reduce((sum, p) => sum + (p.purchasePrice * p.stockQuantity), 0), [products]);

  const paymentData = useMemo(() => [
    { name: 'Cash Sales', value: filteredInvoices.filter(i => i.paymentType === 'cash').reduce((sum, i) => sum + i.total, 0) },
    { name: 'Credit Sales', value: filteredInvoices.filter(i => i.paymentType === 'credit').reduce((sum, i) => sum + i.total, 0) },
  ], [filteredInvoices]);

  const COLORS = ['#3b82f6', '#f43f5e'];

  const resetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedCustomerId('all');
    setSelectedPaymentType('all');
  };

  const downloadCSV = () => {
    if (filteredInvoices.length === 0) return;

    const headers = ['Invoice #', 'Date', 'Customer', 'Items', 'Subtotal', 'Tax', 'Discount', 'Total', 'Paid', 'Type'];
    const rows = filteredInvoices.map(inv => [
      inv.invoiceNumber,
      new Date(inv.date).toLocaleDateString(),
      inv.customerName,
      inv.items.length,
      inv.subtotal,
      inv.tax,
      inv.discount,
      inv.total,
      inv.paidAmount,
      inv.paymentType
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Advanced Analytics</h2>
          <p className="text-slate-500">Dive deep into your sales and financial performance.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> Reset Filters
          </button>
          <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-black transition-all shadow-xl active:scale-95"
          >
            <FileDown className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
          <Filter className="w-4 h-4" /> 
          <span>Filter Report Data</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Start Date
            </label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> End Date
            </label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <User className="w-3 h-3" /> Customer
            </label>
            <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all">
              <option value="all">All Customers</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <CreditCard className="w-3 h-3" /> Payment Type
            </label>
            <select value={selectedPaymentType} onChange={(e) => setSelectedPaymentType(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all">
              <option value="all">All Types</option>
              <option value="cash">Cash Only</option>
              <option value="credit">Credit Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportSummaryCard title="Billed Revenue" value={`Rs. ${totalSales.toLocaleString()}`} icon={DollarSign} color="blue" description="Total of filtered invoices" />
        <ReportSummaryCard title="Net Profit" value={`Rs. ${totalProfit.toLocaleString()}`} icon={TrendingUp} color="emerald" description="Sales minus purchase cost" />
         <ReportSummaryCard title="Total Receivables" value={`Rs. ${totalOutstanding.toLocaleString()}`} icon={Wallet} color="rose" description="Current global outstanding" />
        <ReportSummaryCard title="Inventory Assets" value={`Rs. ${inventoryValue.toLocaleString()}`} icon={BarChart3} color="amber" description="Current stock valuation" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><PieChart className="w-5 h-5 text-blue-600" /> Sales Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                    {paymentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <ReTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, '']} />
                  <Legend verticalAlign="bottom" height={36}/>
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><TrophyIcon className="w-5 h-5 text-amber-500" /> Performance Rankings</h3>
          <div className="flex-1 space-y-4">
            {customers.map(c => ({ name: c.name, phone: c.phone, total: filteredInvoices.filter(inv => inv.customerId === c.id).reduce((s, i) => s + i.total, 0) })).filter(c => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 6).map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl font-black text-slate-400 shadow-sm group-hover:text-blue-600 transition-colors">#{idx+1}</div>
                    <div><span className="font-black text-slate-800 block leading-none">{c.name}</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.phone}</span></div>
                  </div>
                  <div className="text-right"><span className="font-black text-slate-900 block">Rs. {c.total.toLocaleString()}</span></div>
                </div>
            ))}
            {filteredInvoices.length === 0 && <div className="flex flex-col items-center justify-center py-20 text-slate-400"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><Search className="w-8 h-8 opacity-20" /></div><p className="font-bold text-sm">No sales data matches these filters.</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ReportCardProps { title: string; value: string; icon: any; color: string; description: string; }
const ReportSummaryCard: React.FC<ReportCardProps> = ({ title, value, icon: Icon, color, description }) => {
  const colorMap: Record<string, string> = { blue: 'text-blue-600 bg-blue-50', emerald: 'text-emerald-600 bg-emerald-50', rose: 'text-rose-600 bg-rose-50', amber: 'text-amber-600 bg-amber-50', };
  const borderMap: Record<string, string> = { blue: 'border-blue-100', emerald: 'border-emerald-100', rose: 'border-rose-100', amber: 'border-amber-100', };
  return (
    <div className={`bg-white rounded-[2rem] border ${borderMap[color]} shadow-sm p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-100 transition-all cursor-default group`}>
      <div className="flex items-center justify-between mb-6"><div className={`p-3 rounded-2xl ${colorMap[color]} group-hover:scale-110 transition-transform`}><Icon className="w-6 h-6" /></div><div className="h-1.5 w-8 bg-slate-100 rounded-full"></div></div>
      <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p><h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4><p className="text-[9px] text-slate-500 mt-4 font-bold italic opacity-60">{description}</p></div>
    </div>
  );
};

export default Reports;
