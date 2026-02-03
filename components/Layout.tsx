
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  ReceiptText, 
  Users, 
  BookOpenText, 
  BarChart3, 
  Menu, 
  X,
  LogOut,
  UserCircle,
  Truck,
  Wallet2
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/billing', icon: ReceiptText, label: 'Billing' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/ledger', icon: BookOpenText, label: 'Customer Ledger' },
    { to: '/vendors', icon: Truck, label: 'Vendors' },
    { to: '/vendor-ledger', icon: Wallet2, label: 'Vendor Ledger' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/profile', icon: UserCircle, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden no-print flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <Package className="w-6 h-6" /> Stockly
        </h1>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar / Sidebar Overlay */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 
        w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out
        flex flex-col no-print
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-400" />
            <span>Stockly</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
            {user?.shopName || 'Smart Shop'}
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
              {user?.name.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
