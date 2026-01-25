
import React, { useRef } from 'react';
import { useApp } from '../store/AppContext';
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
  Hash
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
  const { products, customers, invoices, user, updateUser } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculations
  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPurchaseCost = invoices.reduce((sum, inv) => {
    return sum + inv.items.reduce((itemSum, item) => {
      const prod = products.find(p => p.id === item.productId);
      return itemSum + (prod ? prod.purchasePrice * item.quantity : 0);
    }, 0);
  }, 0);
  const totalProfit = totalSales - totalPurchaseCost;
  
  const lowStockCount = products.filter(p => p.stockQuantity <= p.lowStockThreshold).length;
  const totalCustomers = customers.length;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'nextInvoiceNumber') {
      updateUser({ nextInvoiceNumber: parseInt(value) || 1 });
    } else {
      updateUser({ [name]: value });
    }
  };

  const data = [
    { name: 'Mon', sales: 4000, profit: 2400 },
    { name: 'Tue', sales: 3000, profit: 1398 },
    { name: 'Wed', sales: 2000, profit: 9800 },
    { name: 'Thu', sales: 2780, profit: 3908 },
    { name: 'Fri', sales: 1890, profit: 4800 },
    { name: 'Sat', sales: 2390, profit: 3800 },
    { name: 'Sun', sales: 3490, profit: 4300 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Business Overview</h2>
          <p className="text-slate-500">Welcome back, {user?.name}! Here is your shop status.</p>
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
          title="Low Stock Alerts" 
          value={lowStockCount.toString()} 
          trend={lowStockCount > 0 ? "Action Required" : "Stock healthy"} 
          trendUp={false} 
          icon={AlertTriangle} 
          color={lowStockCount > 0 ? "rose" : "amber"} 
        />
        <KpiCard 
          title="Total Customers" 
          value={totalCustomers.toString()} 
          trend="Active database" 
          trendUp={true} 
          icon={UserPlus} 
          color="indigo" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Revenue vs Profit
          </h3>
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

        {/* Shop Settings & Alerts */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              Shop Identity
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl bg-slate-50 relative group">
                <div className="w-24 h-24 bg-white rounded-2xl border shadow-sm flex items-center justify-center overflow-hidden mb-4">
                  {user?.logoUrl ? (
                    <img src={user.logoUrl} alt="Shop Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-10 h-10 text-slate-300" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  <Upload className="w-3 h-3" /> {user?.logoUrl ? 'Update Logo' : 'Set Shop Logo'}
                </button>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Appears automatically on all invoices</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                />
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Shop Name</label>
                  <input 
                    name="shopName"
                    value={user?.shopName || ''}
                    onChange={handleProfileUpdate}
                    className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Address
                  </label>
                  <textarea 
                    name="address"
                    rows={2}
                    value={user?.address || ''}
                    onChange={handleProfileUpdate}
                    className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 resize-none"
                    placeholder="Enter shop address..."
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
                      placeholder="Phone..."
                    />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block flex items-center gap-1">
                      <Hash className="w-3 h-3" /> Next Inv #
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
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Stock Alerts
            </h3>
            <div className="space-y-4">
              {products.filter(p => p.stockQuantity <= p.lowStockThreshold).length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-slate-500 text-sm">All products in stock.</p>
                </div>
              ) : (
                products.filter(p => p.stockQuantity <= p.lowStockThreshold).slice(0, 3).map(prod => (
                  <div key={prod.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{prod.name}</p>
                      <p className="text-[10px] text-slate-400">SKU: {prod.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-rose-600">{prod.stockQuantity} left</p>
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
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : null}
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
