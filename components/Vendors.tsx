
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Plus, Search, User, Phone, MapPin, History, ChevronRight, Truck, Mail, Trash2, Edit2, X, Package, ExternalLink } from 'lucide-react';
import { Vendor, Product } from '../types';

const Vendors: React.FC = () => {
  const { vendors, products, addVendor, updateVendor, deleteVendor } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Vendor | null>(null);

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phone.includes(searchTerm)
  );

  const handleOpenModal = (v: Vendor | null = null) => {
    setEditingVendor(v);
    setIsModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const vendorData = {
      name: formData.get('name') as string,
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
    };

    if (editingVendor) {
      updateVendor({ ...editingVendor, ...vendorData });
    } else {
      addVendor(vendorData);
    }
    setIsModalOpen(false);
  };

  const getVendorProducts = (vendorId: string) => {
    return products.filter(p => p.vendorId === vendorId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Supplier Network</h2>
          <p className="text-slate-500">Manage procurement sources and product origins.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200"
        >
          <Plus className="w-5 h-5" /> New Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Lookup by company, contact or phone..." 
              className="w-full pl-12 pr-4 py-4 bg-white border-2 rounded-[1.5rem] focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-bold text-slate-800 border-slate-50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVendors.map(vendor => {
                const linkedProducts = getVendorProducts(vendor.id);
                return (
                  <div 
                    key={vendor.id} 
                    className={`bg-white p-6 rounded-[2rem] border-2 shadow-sm transition-all cursor-pointer group relative overflow-hidden ${viewingHistory?.id === vendor.id ? 'border-blue-500 ring-2 ring-blue-50' : 'hover:border-slate-200 border-transparent hover:shadow-xl'}`}
                    onClick={() => setViewingHistory(vendor)}
                  >
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner border border-slate-100">
                        <Truck className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-900 text-lg truncate leading-tight">{vendor.name}</h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
                          <User className="w-3 h-3 text-blue-500" /> {vendor.contactPerson}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => { e.stopPropagation(); handleOpenModal(vendor); }} className="p-2 bg-slate-50 hover:bg-white border rounded-xl shadow-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                         <button onClick={(e) => { e.stopPropagation(); deleteVendor(vendor.id); }} className="p-2 bg-slate-50 hover:bg-rose-50 border rounded-xl shadow-sm text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-slate-50">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Procured Assets</span>
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black">{linkedProducts.length} SKUs</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Contact Line</span>
                          <span className="text-xs font-bold text-slate-600">{vendor.phone}</span>
                       </div>
                    </div>
                  </div>
                );
            })}
            {filteredVendors.length === 0 && (
                <div className="md:col-span-2 py-20 text-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
                   <Truck className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                   <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No suppliers found.</p>
                </div>
            )}
          </div>
        </div>

        {/* Catalog View Side Panel */}
        <div className="bg-white rounded-[3rem] border shadow-sm flex flex-col h-[calc(100vh-16rem)] min-h-[500px] sticky top-8 overflow-hidden">
          {viewingHistory ? (
            <>
              <div className="p-8 border-b bg-slate-50 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                   <h3 className="font-black text-slate-800 flex items-center gap-2 text-xl tracking-tighter uppercase">
                     <Package className="w-5 h-5 text-blue-600" /> Sourced Catalog
                   </h3>
                   <button onClick={() => setViewingHistory(null)} className="p-2 hover:bg-white rounded-xl transition-all"><X className="w-6 h-6 text-slate-300" /></button>
                </div>
                
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-slate-500">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-bold truncate">{viewingHistory.email}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-bold truncate">{viewingHistory.address}</span>
                   </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y custom-scrollbar">
                {getVendorProducts(viewingHistory.id).length === 0 ? (
                  <div className="p-16 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-black text-xs uppercase tracking-widest">No Products Linked</p>
                  </div>
                ) : (
                  getVendorProducts(viewingHistory.id).map(prod => (
                    <div key={prod.id} className="p-6 hover:bg-slate-50 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-base font-black text-slate-900 tracking-tight">{prod.name}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${prod.stockQuantity <= prod.lowStockThreshold ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                           {prod.stockQuantity} Left
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">SKU: {prod.sku}</span>
                        <span className="text-blue-600 font-black italic">Rs. {prod.purchasePrice} / unit</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
                 <Truck className="w-10 h-10 opacity-10" />
              </div>
              <h4 className="font-black text-slate-700 uppercase tracking-widest text-sm mb-2">Supplier Analysis</h4>
              <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-[200px]">Select a vendor to inspect their product catalog and procurement history.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="bg-white rounded-[3.5rem] shadow-3xl w-full max-w-md overflow-hidden">
            <div className="p-10 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-slate-200">
                   {editingVendor ? <Edit2 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{editingVendor ? 'Modify Supplier' : 'Onboard Vendor'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>
            <form onSubmit={handleSaveVendor} className="p-10 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Company Name</label>
                <input required name="name" defaultValue={editingVendor?.name} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-800" placeholder="e.g., Apex Global Trading" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Contact Person</label>
                    <input required name="contactPerson" defaultValue={editingVendor?.contactPerson} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-800" placeholder="Full Name" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Contact Number</label>
                    <input required name="phone" defaultValue={editingVendor?.phone} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-800" placeholder="+92 ..." />
                 </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Email Address</label>
                <input required type="email" name="email" defaultValue={editingVendor?.email} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-800" placeholder="sales@provider.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Physical Location</label>
                <textarea required name="address" rows={3} defaultValue={editingVendor?.address} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-800 resize-none text-sm leading-relaxed" placeholder="Warehouse or HQ address..."></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border-2 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Discard</button>
                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-black shadow-2xl active:scale-95 transition-all">Archive Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
