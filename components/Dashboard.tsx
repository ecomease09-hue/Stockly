
import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { 
  TrendingUp, 
  AlertTriangle, 
  ShoppingBag, 
  UserPlus, 
  ArrowUpRight, 
  Store,
  Upload,
  Building2,
  MapPin,
  Phone,
  Hash,
  ChevronRight,
  ArrowRight,
  Truck,
  Wallet2,
  BrainCircuit,
  Sparkles,
  RefreshCw,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Dashboard: React.FC = () => {
  const { products, customers, vendors, invoices, user, updateUser } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Calculations
  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPurchaseCost = invoices.reduce((sum, inv) => {
    return sum + inv.items.reduce((itemSum, item) => {
      const prod = products.find(p => p.id === item.productId);
      return itemSum + (prod ? prod.purchasePrice * item.quantity : 0);
    }, 0);
  }, 0);
  const totalProfit = totalSales - totalPurchaseCost;
  
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.lowStockThreshold);
  const lowStockCount = lowStockProducts.length;
  
  const totalVendorPayables = vendors.reduce((sum, v) => sum + (v.totalBalance || 0), 0);

  const fetchAiInsight = async () => {
    if (products.length === 0) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = `Inventory: ${products.map(p => `${p.name} at ${p.stockQuantity}`).join(', ')}. Sales total: Rs. ${totalSales}. Low stock SKUs: ${lowStockCount}. Provide one actionable 15-word business tip.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: context }] }],
      });
      setAiInsight(response.text || "Optimize stock levels based on current sales velocity.");
    } catch (e) {
      setAiInsight("Monitor SKU velocity for optimal reordering.");
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAiInsight();
  }, [products.length]);

  const data = [
    { name: 'Mon', sales: 4000, profit: 2400 },
    { name: 'Tue', sales: 3000, profit: 1398 },
    { name: 'Wed', sales: 2000, profit: 9800 },
    { name: 'Thu', sales: 2780, profit: 3908 },
    { name: 'Fri', sales: 1890, profit: 4800 },
    { name: 'Sat', sales: 2390, profit: 3800 },
    { name: 'Sun', sales: 3490, profit: 4300 },
  ];

  const handleProfileUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'nextInvoiceNumber') {
      updateUser({ nextInvoiceNumber: parseInt(value) || 1 });
    } else {
      updateUser({ [name]: value });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Business Overview</h2>
          <p className="text-slate-500">Welcome back, {user?.name}! Your shop is running smooth.</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-white px-4 py-2 border rounded-xl shadow-sm flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center overflow-hidden border">
                {user?.logoUrl ? (
                  <img src={user.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-4 h-4 text-blue-500" />
                )}
             </div>
             <span className="text-sm font-bold text-slate-700">{user?.shopName}</span>
           </div>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl animate-in zoom-in duration-500">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[80px] -mr-48 -mt-48 transition-transform group-hover:scale-110"></div>
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/50">
                  <BrainCircuit className="w-8 h-8" />
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/30">Intelligence Node</span>
                    {isAiLoading && <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />}
                  </div>
                  <h3 className="text-xl font-black tracking-tight">Gemini Strategy Recommendation</h3>
                  <p className="text-blue-100/60 text-sm font-medium mt-1 italic">"{aiInsight || 'Analyzing real-time stock patterns...'}"</p>
               </div>
            </div>
            <button 
              onClick={() => navigate('/inventory')}
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-blue-50 transition-all active:scale-95"
            >
               Optimize Now <Zap className="w-4 h-4 text-blue-600" />
            </button>
         </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Sales" 
          value={`Rs. ${totalSales.toLocaleString()}`} 
          trend="+12.5%" 
          trendUp={true} 
          icon={ShoppingBag} 
          color="blue" 
        />
        <KpiCard 
          title="Total Profit" 
          value={`Rs. ${totalProfit.toLocaleString()}`} 
          trend="+8.2%" 
          trendUp={true} 
          icon={TrendingUp} 
          color="emerald" 
        />
        <KpiCard 
          title="Vendor Payables" 
          value={`Rs. ${totalVendorPayables.toLocaleString()}`} 
          trend={totalVendorPayables > 0 ? "Outstanding Debt" : "Clear Dues"} 
          trendUp={false} 
          icon={Truck} 
          color={totalVendorPayables > 0 ? "rose" : "blue"} 
        />
        <KpiCard 
          title="Low Stock SKUs" 
          value={lowStockCount.toString()} 
          trend={lowStockCount > 0 ? "Restock Needed" : "Optimal Levels"} 
          trendUp={false} 
          icon={AlertTriangle} 
          color={lowStockCount > 0 ? "rose" : "amber"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Performance Analytics
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-slate-500 font-medium">Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-slate-500 font-medium">Profit</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  formatter={(value) => [`Rs. ${value}`, '']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              Shop Configuration
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Shop Identity</label>
                  <input 
                    name="shopName"
                    value={user?.shopName || ''}
                    onChange={handleProfileUpdate}
                    className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                  />
              </div>
              <div className="flex gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone
                    </label>
                    <input 
                      name="phone"
                      value={user?.phone || ''}
                      onChange={handleProfileUpdate}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block flex items-center gap-1">
                      <Hash className="w-3 h-3" /> Inv #
                    </label>
                    <input 
                      name="nextInvoiceNumber"
                      type="number"
                      value={user?.nextInvoiceNumber || 1}
                      onChange={handleProfileUpdate}
                      className="w-full bg-transparent text-sm font-bold text-blue-600 outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                    />
                  </div>
                </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Inventory Alerts
              </h3>
              {lowStockCount > 0 && (
                <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
                  {lowStockCount} SKUs
                </span>
              )}
            </div>
            
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed">
                  <p className="text-slate-400 text-sm font-medium">Stock levels are healthy.</p>
                </div>
              ) : (
                lowStockProducts.map(prod => (
                  <div 
                    key={prod.id} 
                    onClick={() => navigate('/inventory')}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-rose-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate group-hover:text-rose-600 transition-colors">{prod.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sourced from: {prod.vendorName || 'Direct'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-black ${prod.stockQuantity <= 0 ? 'text-rose-600 animate-pulse' : 'text-amber-600'}`}>
                        {prod.stockQuantity} Units
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface KpiCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: any;
  color: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, trend, trendUp, icon: Icon, color }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colorMap[color]} border shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trendUp ? 'text-emerald-600' : 'text-slate-400'}`}>
          {trend}
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</p>
        <h4 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{value}</h4>
      </div>
    </div>
  );
};

export default Dashboard;
