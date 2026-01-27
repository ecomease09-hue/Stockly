
import React, { useRef, useState } from 'react';
import { useApp } from '../store/AppContext';
import { 
  User, 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  Upload, 
  Building2, 
  Check, 
  ShieldCheck, 
  Key, 
  Camera,
  Hash
} from 'lucide-react';

const UserDetails: React.FC = () => {
  const { user, updateUser, products, invoices } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ logoUrl: reader.result as string });
        triggerFeedback();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'nextInvoiceNumber') {
      updateUser({ nextInvoiceNumber: parseInt(value) || 1 });
    } else {
      updateUser({ [name]: value });
    }
  };

  const triggerFeedback = () => {
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Profile Section */}
      <div className="relative bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative group">
            <div className="w-40 h-40 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl overflow-hidden border-8 border-white group-hover:scale-105 transition-transform duration-500">
              {user.logoUrl ? (
                <img src={user.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 border-4 border-white"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleLogoUpload} 
            />
          </div>
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <ShieldCheck className="w-3 h-3" /> Verified Shop Owner
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{user.name}</h2>
            <p className="text-slate-500 font-bold mb-6 flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4 text-blue-500" /> {user.email}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
               <StatBadge label="Products" value={products.length} />
               <StatBadge label="Sales" value={invoices.length} />
               <StatBadge label="Joined" value={new Date().getFullYear().toString()} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="bg-white rounded-[2.5rem] p-10 border shadow-sm space-y-8">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" /> Personal Identity
          </h3>
          <div className="space-y-6">
            <InputField 
              label="Full Name" 
              name="name" 
              value={user.name} 
              onChange={handleChange} 
              icon={User}
            />
            <InputField 
              label="Contact Email" 
              name="email" 
              value={user.email} 
              onChange={handleChange} 
              icon={Mail}
              disabled
            />
            <div className="pt-4">
              <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                <Key className="w-4 h-4" /> Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Shop Settings */}
        <div className="bg-white rounded-[2.5rem] p-10 border shadow-sm space-y-8">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <Store className="w-6 h-6 text-blue-600" /> Business Profile
          </h3>
          <div className="space-y-6">
            <InputField 
              label="Shop Name" 
              name="shopName" 
              value={user.shopName} 
              onChange={handleChange} 
              icon={Building2}
            />
            <InputField 
              label="Business Phone" 
              name="phone" 
              value={user.phone || ''} 
              onChange={handleChange} 
              icon={Phone}
              placeholder="+92 000 0000000"
            />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Shop Address
              </label>
              <textarea 
                name="address"
                rows={3}
                value={user.address || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900 resize-none text-sm leading-relaxed"
                placeholder="Enter complete physical address..."
              />
            </div>
            <InputField 
              label="Manual Invoice Offset" 
              name="nextInvoiceNumber" 
              type="number"
              value={user.nextInvoiceNumber} 
              onChange={handleChange} 
              icon={Hash}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center pb-12">
        <button 
          onClick={triggerFeedback}
          className={`
            px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all shadow-2xl flex items-center gap-4
            ${saveFeedback ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black active:scale-95'}
          `}
        >
          {saveFeedback ? (
            <><Check className="w-5 h-5" /> Settings Archived</>
          ) : (
            'Save All Changes'
          )}
        </button>
      </div>
    </div>
  );
};

const StatBadge: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-lg font-black text-slate-900 leading-none">{value}</p>
  </div>
);

const InputField: React.FC<{ 
  label: string; 
  name: string; 
  value: string | number; 
  onChange: (e: any) => void; 
  icon: any;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}> = ({ label, name, value, onChange, icon: Icon, type = 'text', placeholder, disabled }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
      <Icon className="w-3 h-3" /> {label}
    </label>
    <input 
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300'}`}
    />
  </div>
);

export default UserDetails;
