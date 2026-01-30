
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
  Trophy as TrophyIcon,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Box,
  LayoutGrid,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as ReTooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

const Reports: React.FC = () => {
  const { invoices, products, customers } = useApp();

  // Filter States
  const [activeView, setActiveView] = useState<'daily' | 'monthly'>('daily');

  // Helper for calculating true net profit from invoices using stored cost prices
  const calculateInvoiceProfit = (inv: any) => {
    return inv.items.reduce((sum: number, item: any) => {
      // Use stored purchasePrice if available, else fallback to current (for old invoices)
      const cost = item.purchasePrice || (products.find(p => p.id === item.productId)?.purchasePrice || 0);
      const itemCostTotal = cost * item.quantity;
      return sum + (item.total - itemCostTotal);
    }, 0);
  };

  // 1. Daily Profit Logic (Past 14 Days)
  const dailyProfitData = useMemo(() => {
    const map: Record<string, { date: string, profit: number, revenue: number }> = {};
    const last14Days = [...Array(14)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last14Days.forEach(date => {
      map[date] = { date: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), profit: 0, revenue: 0 };
    });

    invoices.forEach(inv => {
      const date = inv.date.split('T')[0];
      const displayDate = new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      if (map[date]) {
        map[date].revenue += inv.total;
        map[date].profit += calculateInvoiceProfit(inv);
      }
    });

    return Object.values(map);
  }, [invoices, products]);

  // 2. Monthly Profit Logic (Current Year)
  const monthlyProfitData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const map: Record<string, { month: string, profit: number, revenue: number }> = {};
    
    months.forEach((m, idx) => {
      const key = `${currentYear}-${(idx + 1).toString().padStart(2, '0')}`;
      map[key] = { month: m, profit: 0, revenue: 0 };
    });

    invoices.forEach(inv => {
      const date = new Date(inv.date);
      if (date.getFullYear() === currentYear) {
        const key = `${currentYear}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (map[key]) {
          map[key].revenue += inv.total;
          map[key].profit += calculateInvoiceProfit(inv);
        }
      }
    });

    return Object.values(map);
  }, [invoices, products]);

  // 3. Inventory SKU Valuation & Remaining Stock Report
  const skuInventoryReport = useMemo(() => {
    return products.map(p => ({
      sku: p.sku,
      name: p.name,
      remaining: p.stockQuantity,
      costValue: p.stockQuantity * p.purchasePrice,
      retailValue: p.stockQuantity * p.salePrice,
      potentialProfit: (p.salePrice - p.purchasePrice) * p.stockQuantity,
      status: p.stockQuantity <= 0 ? 'Out' : p.stockQuantity <= p.lowStockThreshold ? 'Low' : 'Optimal'
    })).sort((a, b) => b.costValue - a.costValue);
  }, [products]);

  const totalProfit = useMemo(() => invoices.reduce((sum, inv) => sum + calculateInvoiceProfit(inv), 0), [invoices, products]);
  const inventoryAssetsValue = useMemo(() => products.reduce((sum, p) => sum + (p.purchasePrice * p.stockQuantity), 0), [products]);
  const totalOutstanding = useMemo(() => customers.reduce((s, c) => s + c.totalOutstanding, 0), [customers]);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Hub</h2>
          <p className="text-slate-500 font-medium italic">Advanced profitability and SKU liquidity analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-2xl border-2 flex shadow-sm">
            <button 
              onClick={() => setActiveView('daily')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'daily' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Daily Pulse
            </button>
            <button 
              onClick={() => setActiveView('monthly')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'monthly' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Monthly Growth
            </button>
          </div>
          <button onClick={() => window.print()} className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 no-print">
            <FileDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        <ReportSummaryCard 
          title="Net Gross Profit" 
          value={`Rs. ${totalProfit.toLocaleString()}`} 
          icon={TrendingUp} 
          color="emerald" 
          description="Total realized earnings" 
          trend="+12.4%"
        />
        <ReportSummaryCard 
          title="Stock Assets" 
          value={`Rs. ${inventoryAssetsValue.toLocaleString()}`} 
          icon={Box} 
          color="blue" 
          description="Capital tied in shelf inventory" 
          trend="Stable"
        />
        <ReportSummaryCard 
          title="Ledger Credits" 
          value={`Rs. ${totalOutstanding.toLocaleString()}`} 
          icon={Wallet} 
          color="rose" 
          description="Pending customer payments" 
          trend="-3.1%"
        />
        <ReportSummaryCard 
          title="Avg. Profit / Sale" 
          value={`Rs. ${invoices.length ? Math.round(totalProfit / invoices.length).toLocaleString() : 0}`} 
          icon={LayoutGrid} 
          color="amber" 
          description="Mean earnings per invoice" 
          trend="+4.8%"
        />
      </div>

      {/* Profit Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
                <Clock className="w-6 h-6 text-blue-600" />
                {activeView === 'daily' ? '14-Day Velocity' : 'Fiscal Year Performance'}
              </h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Net Revenue vs Realized Profit</p>
            </div>
          </div>
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              {activeView === 'daily' ? (
                <AreaChart data={dailyProfitData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                  <ReTooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '20px' }}
                    itemStyle={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                    formatter={(val) => [`Rs. ${val.toLocaleString()}`, '']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={4} />
                </AreaChart>
              ) : (
                <BarChart data={monthlyProfitData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                  <ReTooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '20px' }}
                    formatter={(val) => [`Rs. ${val.toLocaleString()}`, '']}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={18} />
                  <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} barSize={18} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm flex flex-col no-print">
          <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3 tracking-tighter">
            <PieChart className="w-6 h-6 text-indigo-600" />
            Revenue Mix
          </h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie 
                  data={[
                    { name: 'Direct Sales', value: 70 },
                    { name: 'Credit Orders', value: 30 }
                  ]} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={70} 
                  outerRadius={100} 
                  paddingAngle={8} 
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <ReTooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-10 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
             <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Liquidity</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase">Optimal</span>
             </div>
             <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-emerald-500 w-[82%] rounded-full shadow-lg shadow-emerald-200"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Inventory SKU Report */}
      <div className="bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
        <div className="p-10 border-b-2 border-slate-50 bg-slate-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4 tracking-tighter">
              <Layers className="w-7 h-7 text-blue-600" />
              SKU Inventory Performance
            </h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">In-depth stock valuation and capital liquidity</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-6 py-3 bg-white border-2 rounded-2xl text-[10px] font-black text-slate-600 shadow-sm uppercase tracking-widest">
              {products.length} Unique Main SKUs
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Product SKU</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Remaining</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Cost Value</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Retail Potential</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Est. Profit</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {skuInventoryReport.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 border-2 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:border-blue-100 transition-all">
                        <Box className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-lg font-black text-slate-900 block group-hover:text-blue-600 transition-colors tracking-tight">{item.name}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-10 text-center">
                    <span className="text-xl font-black text-slate-900">{item.remaining}</span>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">Units on Shelf</p>
                  </td>
                  <td className="px-10 py-10 text-right">
                    <span className="text-base font-black text-slate-600 italic tracking-tight">Rs. {item.costValue.toLocaleString()}</span>
                  </td>
                  <td className="px-10 py-10 text-right">
                    <span className="text-base font-black text-blue-600 italic tracking-tight">Rs. {item.retailValue.toLocaleString()}</span>
                  </td>
                  <td className="px-10 py-10 text-right">
                    <span className="text-base font-black text-emerald-600 italic tracking-tight">+Rs. {item.potentialProfit.toLocaleString()}</span>
                  </td>
                  <td className="px-10 py-10 text-center">
                    <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                      item.status === 'Optimal' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      item.status === 'Low' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {skuInventoryReport.length === 0 && (
          <div className="p-32 text-center">
            <Box className="w-20 h-20 mx-auto text-slate-100 mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Stock Data Available</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ReportCardProps { 
  title: string; 
  value: string; 
  icon: any; 
  color: string; 
  description: string; 
  trend?: string;
}

const ReportSummaryCard: React.FC<ReportCardProps> = ({ title, value, icon: Icon, color, description, trend }) => {
  const colorMap: Record<string, string> = { 
    blue: 'text-blue-600 bg-blue-50', 
    emerald: 'text-emerald-600 bg-emerald-50', 
    rose: 'text-rose-600 bg-rose-50', 
    amber: 'text-amber-600 bg-amber-50', 
  };
  const borderMap: Record<string, string> = { 
    blue: 'border-blue-100 shadow-blue-50', 
    emerald: 'border-emerald-100 shadow-emerald-50', 
    rose: 'border-rose-100 shadow-rose-50', 
    amber: 'border-amber-100 shadow-amber-50', 
  };

  return (
    <div className={`bg-white rounded-[3rem] border-2 ${borderMap[color]} shadow-xl p-10 flex flex-col justify-between hover:-translate-y-2 transition-all cursor-default group relative overflow-hidden`}>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mb-16 opacity-50"></div>
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className={`p-5 rounded-[1.5rem] ${colorMap[color]} group-hover:scale-110 transition-transform shadow-lg border-2 border-white`}>
          <Icon className="w-7 h-7" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-400'}`}>
            {trend}
            {trend.startsWith('+') ? <ArrowUpRight className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">{title}</p>
        <h4 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight italic">{value}</h4>
        <div className="mt-8 pt-8 border-t-2 border-slate-50 flex items-center justify-between">
           <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-60">{description}</p>
           <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default Reports;
