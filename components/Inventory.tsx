
import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Package, 
  History, 
  X, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Clock, 
  Truck, 
  ShoppingCart,
  CheckSquare,
  Square,
  Layers,
  ChevronRight,
  Calculator,
  Rocket,
  ArrowRight,
  AlertCircle,
  Activity,
  DollarSign,
  Eraser,
  ChevronDown
} from 'lucide-react';
import { Product, StockMovement } from '../types';

const Inventory: React.FC = () => {
  const { products, vendors, addProduct, updateProduct, deleteProduct, checkLimit } = useApp();
  const navigate = useNavigate();
  
  // UI & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  // Advanced Filter States
  const [vendorFilter, setVendorFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  
  // Selection & Modal States
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isBulkRestockModalOpen, setIsBulkRestockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Product | null>(null);
  const [bulkQuantities, setBulkQuantities] = useState<Record<string, number>>({});

  // Memoized Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesVendor = vendorFilter === '' || p.vendorId === vendorFilter;
      
      const isOut = p.stockQuantity <= 0;
      const isLow = p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0;
      const isHealthy = p.stockQuantity > p.lowStockThreshold;
      
      let matchesStock = true;
      if (stockStatusFilter === 'low') matchesStock = isLow;
      if (stockStatusFilter === 'out') matchesStock = isOut;
      if (stockStatusFilter === 'healthy') matchesStock = isHealthy;

      const price = p.purchasePrice;
      const min = minPrice === '' ? 0 : parseFloat(minPrice);
      const max = maxPrice === '' ? Infinity : parseFloat(maxPrice);
      const matchesPrice = price >= min && price <= max;

      return matchesSearch && matchesVendor && matchesStock && matchesPrice;
    });
  }, [products, searchTerm, vendorFilter, stockStatusFilter, minPrice, maxPrice]);

  const resetFilters = () => {
    setSearchTerm('');
    setVendorFilter('');
    setStockStatusFilter('all');
    setMinPrice('');
    setMaxPrice('');
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleOpenModal = (p: Product | null = null) => {
    if (!p) {
      const { allowed } = checkLimit('products');
      if (!allowed) {
        setIsLimitModalOpen(true);
        return;
      }
    }
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const vId = formData.get('vendorId') as string;
    const vendor = vendors.find(v => v.id === vId);

    const productData = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      purchasePrice: parseFloat(formData.get('purchasePrice') as string),
      salePrice: parseFloat(formData.get('salePrice') as string),
      stockQuantity: parseInt(formData.get('stockQuantity') as string),
      lowStockThreshold: parseInt(formData.get('lowStockThreshold') as string),
      vendorId: vId || undefined,
      vendorName: vendor?.name || undefined
    };

    if (editingProduct) {
      updateProduct({ ...editingProduct, ...productData }, 'Profile Update');
    } else {
      addProduct(productData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Inventory Terminal</h2>
          <p className="text-slate-500 font-medium italic">Monitor levels, filter assets, and restock batches.</p>
        </div>
        <div className="flex gap-3">
          {selectedProductIds.length > 0 && (
            <button 
              onClick={() => setIsBulkRestockModalOpen(true)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 animate-in slide-in-from-right-4"
            >
              <Layers className="w-5 h-5" /> Bulk Restock ({selectedProductIds.length})
            </button>
          )}
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            <Plus className="w-5 h-5" /> New Asset
          </button>
        </div>
      </div>

      {/* Advanced Filtering Suite */}
      <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden animate-in fade-in duration-500">
        <div className="p-6 flex flex-col md:flex-row gap-4 items-center bg-slate-50/50">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Instant SKU or Name lookup..." 
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${isFilterPanelOpen ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200'}`}
            >
              <Filter className="w-4 h-4" /> 
              {isFilterPanelOpen ? 'Hide Filters' : 'Advanced Filters'}
            </button>
            {(vendorFilter || stockStatusFilter !== 'all' || minPrice || maxPrice || searchTerm) && (
              <button 
                onClick={resetFilters}
                className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all"
                title="Clear Filters"
              >
                <Eraser className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Filter Panel */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isFilterPanelOpen ? 'max-h-[500px] border-t' : 'max-h-0'}`}>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10 bg-white">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Truck className="w-3 h-3 text-blue-500" /> Source Vendor
              </label>
              <select 
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="">All Suppliers</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3 text-blue-500" /> Stock Status
              </label>
              <div className="flex flex-wrap gap-2">
                <FilterPill label="All" active={stockStatusFilter === 'all'} onClick={() => setStockStatusFilter('all')} color="slate" />
                <FilterPill label="Critical" active={stockStatusFilter === 'out'} onClick={() => setStockStatusFilter('out')} color="rose" />
                <FilterPill label="Low" active={stockStatusFilter === 'low'} onClick={() => setStockStatusFilter('low')} color="amber" />
                <FilterPill label="Healthy" active={stockStatusFilter === 'healthy'} onClick={() => setStockStatusFilter('healthy')} color="emerald" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-blue-500" /> Cost Range (PKR)
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-300 font-black">/</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="px-8 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-blue-500 ${filteredProducts.length < products.length ? 'animate-pulse' : ''}`}></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {filteredProducts.length < products.length ? 'Active Filters' : 'Full Catalog View'}
                </span>
             </div>
             <p className="text-[10px] font-bold text-slate-500">Showing {filteredProducts.length} of {products.length} registered items</p>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-8 py-6 w-16 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600 transition-colors">
                    {selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest w-48">Source</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center w-36">Level</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-40">Retail</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-48 pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const isLowStock = product.stockQuantity <= product.lowStockThreshold;
                const isSelected = selectedProductIds.includes(product.id);
                return (
                  <tr key={product.id} className={`hover:bg-slate-50/50 transition-all group ${isSelected ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-8 py-8 text-center">
                      <button onClick={() => toggleSelect(product.id)} className="text-slate-300 group-hover:text-blue-400 transition-colors">
                        {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${isLowStock ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-blue-50 border-blue-100 text-blue-500'}`}>
                          <Package className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 text-lg truncate leading-none">{product.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl max-w-full">
                        <Truck className="w-4 h-4 text-slate-300" />
                        <span className="text-xs font-bold truncate text-slate-600">{product.vendorName || 'Direct'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border ${isLowStock ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                        {product.stockQuantity} Units
                      </span>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <p className="text-base font-black text-slate-900 tracking-tight">Rs. {product.salePrice.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-8 text-right pr-10">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setViewingHistory(product); setIsHistoryModalOpen(true); }} className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all">
                          <History className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleOpenModal(product)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200">
                <Search className="w-8 h-8 text-slate-200" />
             </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No matching results found</p>
            <button onClick={resetFilters} className="mt-4 text-blue-600 font-black uppercase text-[10px] tracking-widest hover:underline">Reset All Filters</button>
          </div>
        )}
      </div>

      {/* Limit Modal */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] shadow-3xl w-full max-w-md overflow-hidden animate-in zoom-in duration-500">
              <div className="p-10 border-b flex items-center justify-between">
                 <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100 shadow-inner">
                    <AlertCircle className="w-6 h-6" />
                 </div>
                 <button onClick={() => setIsLimitModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-xl transition-all">
                    <X className="w-6 h-6 text-slate-300" />
                 </button>
              </div>
              <div className="p-10 text-center space-y-8">
                 <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-200 animate-badge-bump">
                    <Rocket className="w-10 h-10" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Quota Reached</h3>
                    <p className="text-slate-500 font-bold leading-relaxed italic">You have hit the capacity limit for your current plan. Upgrade to a professional tier to unlock more asset slots.</p>
                 </div>
                 <button 
                  onClick={() => navigate('/pricing')}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                 >
                    Explore Upgrade Options <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Add/Edit Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="bg-white rounded-[3.5rem] shadow-3xl w-full max-w-xl overflow-hidden">
            <div className="p-10 border-b bg-blue-50 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-100">
                   {editingProduct ? <Edit2 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{editingProduct ? 'Modify Asset' : 'Register Asset'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors relative z-10">
                <X className="w-8 h-8" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Asset Label</label>
                  <input required name="name" defaultValue={editingProduct?.name} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all" placeholder="e.g., Premium Rice 5kg" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">SKU Identifier</label>
                  <input required name="sku" defaultValue={editingProduct?.sku} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all uppercase" placeholder="SKU-XXXX" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Source Supplier</label>
                  <select name="vendorId" defaultValue={editingProduct?.vendorId || ''} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none cursor-pointer">
                    <option value="">Direct Procurement...</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Cost Price (Rs.)</label>
                  <input required type="number" step="0.01" name="purchasePrice" defaultValue={editingProduct?.purchasePrice} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all text-rose-600" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Retail Price (Rs.)</label>
                  <input required type="number" step="0.01" name="salePrice" defaultValue={editingProduct?.salePrice} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all text-emerald-600" />
                </div>
                {!editingProduct && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Initial Stock</label>
                    <input required type="number" name="stockQuantity" defaultValue={0} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all text-xl" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Alert Threshold</label>
                  <input required type="number" name="lowStockThreshold" defaultValue={editingProduct?.lowStockThreshold || 5} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 border-2 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Discard</button>
                <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 shadow-2xl active:scale-95 transition-all">Commit Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterPill: React.FC<{ label: string, active: boolean, onClick: () => void, color: string }> = ({ label, active, onClick, color }) => {
  const colorMap: Record<string, string> = {
    slate: active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300',
    rose: active ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-rose-500 border-rose-100 hover:border-rose-300',
    amber: active ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-amber-500 border-amber-100 hover:border-amber-300',
    emerald: active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-500 border-emerald-100 hover:border-emerald-300',
  };

  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${colorMap[color]}`}
    >
      {label}
    </button>
  );
};

export default Inventory;
