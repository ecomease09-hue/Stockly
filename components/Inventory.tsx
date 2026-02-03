
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
  Calculator
} from 'lucide-react';
import { Product, StockMovement } from '../types';

const Inventory: React.FC = () => {
  const { products, vendors, addProduct, updateProduct, deleteProduct } = useApp();
  const navigate = useNavigate();
  
  // Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isBulkRestockModalOpen, setIsBulkRestockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // Data States
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Product | null>(null);
  const [bulkQuantities, setBulkQuantities] = useState<Record<string, number>>({});

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

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
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleOpenRestock = (p: Product) => {
    setRestockingProduct(p);
    setIsRestockModalOpen(true);
  };

  const handleOpenBulkRestock = () => {
    const initialQtys: Record<string, number> = {};
    selectedProductIds.forEach(id => { initialQtys[id] = 0; });
    setBulkQuantities(initialQtys);
    setIsBulkRestockModalOpen(true);
  };

  const handleOpenHistory = (p: Product) => {
    setViewingHistory(p);
    setIsHistoryModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const vendorId = formData.get('vendorId') as string;
    const vendor = vendors.find(v => v.id === vendorId);

    const productData = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      purchasePrice: parseFloat(formData.get('purchasePrice') as string),
      salePrice: parseFloat(formData.get('salePrice') as string),
      stockQuantity: parseInt(formData.get('stockQuantity') as string),
      lowStockThreshold: parseInt(formData.get('lowStockThreshold') as string),
      vendorId: vendorId || undefined,
      vendorName: vendor?.name || undefined
    };

    if (editingProduct) {
      updateProduct({ ...editingProduct, ...productData }, 'Profile Update');
    } else {
      addProduct(productData);
    }
    setIsModalOpen(false);
  };

  const handleConfirmRestock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!restockingProduct) return;
    
    const formData = new FormData(e.currentTarget);
    const additionalStock = parseInt(formData.get('quantity') as string);
    const updatedProduct = {
      ...restockingProduct,
      stockQuantity: restockingProduct.stockQuantity + additionalStock
    };
    
    updateProduct(updatedProduct, `Stock Procurement (x${additionalStock})`);
    setIsRestockModalOpen(false);
  };

  const handleConfirmBulkRestock = (e: React.FormEvent) => {
    e.preventDefault();
    selectedProductIds.forEach(id => {
      const qty = bulkQuantities[id];
      const product = products.find(p => p.id === id);
      if (product && qty > 0) {
        updateProduct({
          ...product,
          stockQuantity: product.stockQuantity + qty
        }, `Bulk Procurement (x${qty})`);
      }
    });
    setIsBulkRestockModalOpen(false);
    setSelectedProductIds([]);
  };

  const goToVendorLedger = (vendorId: string) => {
    navigate('/vendor-ledger');
  };

  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Inventory Terminal</h2>
          <p className="text-slate-500 font-medium">Global stock tracking and procurement automation.</p>
        </div>
        <div className="flex gap-3">
          {selectedProductIds.length > 0 && (
            <button 
              onClick={handleOpenBulkRestock}
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

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter catalog by SKU, Name, or Source Supplier..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 border rounded-2xl">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility:</span>
          <span className="text-xs font-black text-slate-900">{filteredProducts.length} Assets</span>
        </div>
      </div>

      {/* Main Table */}
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
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest w-48">Procurement Source</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center w-36">Stock Level</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-40">Valuation</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-48 pr-10">Lifecycle Actions</th>
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
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border-2 transition-transform group-hover:scale-110 ${isLowStock ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-blue-50 border-blue-100 text-blue-500'}`}>
                          <Package className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 text-lg tracking-tight truncate">{product.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      {product.vendorId ? (
                        <button 
                          onClick={() => goToVendorLedger(product.vendorId!)}
                          className="flex items-center gap-2 group/vendor px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all w-full justify-between"
                        >
                           <div className="flex items-center gap-2 min-w-0">
                              <Truck className="w-4 h-4 text-slate-400 group-hover/vendor:text-white" />
                              <span className="text-xs font-bold truncate">{product.vendorName}</span>
                           </div>
                           <ChevronRight className="w-3 h-3 opacity-0 group-hover/vendor:opacity-100" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 border-dashed rounded-xl">
                          <Truck className="w-4 h-4 text-slate-200" />
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">No Source</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-8 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border ${isLowStock ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                          {product.stockQuantity} Units
                        </span>
                        {isLowStock && <span className="text-[8px] font-black text-rose-500 uppercase mt-2 tracking-widest animate-pulse">Critical Level</span>}
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <p className="text-base font-black text-slate-900 tracking-tight">Rs. {product.salePrice.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Cost: Rs. {product.purchasePrice}</p>
                    </td>
                    <td className="px-8 py-8 text-right pr-10">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleOpenRestock(product)} title="Single Restock" className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all active:scale-90">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleOpenHistory(product)} title="Stock Audit" className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all active:scale-90">
                          <History className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleOpenModal(product)} title="Edit Schema" className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all active:scale-90">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => deleteProduct(product.id)} title="Purge" className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all active:scale-90">
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
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-slate-200">
                <Package className="w-10 h-10 text-slate-200" />
             </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Empty Repository</p>
            <p className="text-xs font-bold text-slate-300 mt-2">No matching inventory records discovered.</p>
          </div>
        )}
      </div>

      {/* Bulk Restock Modal */}
      {isBulkRestockModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] shadow-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-12 border-b bg-emerald-50 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="flex items-center gap-8 relative z-10">
                <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-200">
                   <Layers className="w-10 h-10" />
                </div>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Bulk Procurement</h3>
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-2 flex items-center gap-2">
                     <CheckSquare className="w-3 h-3" /> Batching {selectedProductIds.length} Unique Assets
                   </p>
                </div>
              </div>
              <button onClick={() => setIsBulkRestockModalOpen(false)} className="p-4 text-emerald-900 hover:bg-white rounded-[1.5rem] transition-all relative z-10">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
               <div className="space-y-6">
                  {selectedProducts.map(p => (
                    <div key={p.id} className="flex items-center gap-8 p-6 bg-slate-50 border-2 border-slate-50 rounded-3xl hover:bg-white hover:border-emerald-100 transition-all group">
                       <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-900 text-xl tracking-tight truncate">{p.name}</p>
                          <div className="flex items-center gap-4 mt-2">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source: {p.vendorName || 'Direct'}</span>
                             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Shelf: {p.stockQuantity}</span>
                          </div>
                       </div>
                       <div className="w-40 relative">
                          <input 
                            type="number" 
                            min="0"
                            className="w-full pl-6 pr-12 py-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-xl outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all text-emerald-600"
                            placeholder="0"
                            value={bulkQuantities[p.id] || ''}
                            onChange={(e) => setBulkQuantities(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Qty</div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-12 border-t bg-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="p-4 bg-white border rounded-2xl shadow-sm">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Batch Value</p>
                     <p className="text-xl font-black text-slate-900">
                        Rs. {selectedProducts.reduce((sum, p) => sum + (p.purchasePrice * (bulkQuantities[p.id] || 0)), 0).toLocaleString()}
                     </p>
                  </div>
               </div>
               <div className="flex gap-4">
                 <button onClick={() => setIsBulkRestockModalOpen(false)} className="px-8 py-5 border-2 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-white transition-all">Cancel</button>
                 <button onClick={handleConfirmBulkRestock} className="px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-2xl shadow-emerald-200 active:scale-95 transition-all flex items-center gap-3">
                   <Calculator className="w-5 h-5" /> Commit Batch Update
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal (Single) */}
      {isRestockModalOpen && restockingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-3xl w-full max-w-md overflow-hidden">
            <div className="p-10 border-b bg-emerald-50 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-100">
                   <ShoppingCart className="w-7 h-7" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Procurement</h3>
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Source: {restockingProduct.vendorName || 'Direct'}</p>
                </div>
              </div>
              <button onClick={() => setIsRestockModalOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors relative z-10">
                <X className="w-8 h-8" />
              </button>
            </div>
            <form onSubmit={handleConfirmRestock} className="p-10 space-y-8">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Incoming Units (+)</label>
                  <input required type="number" name="quantity" min="1" autoFocus className="w-full px-6 py-5 text-4xl font-black border-4 border-slate-100 rounded-3xl focus:ring-4 focus:ring-emerald-100 outline-none text-emerald-600 bg-slate-50/50 shadow-inner transition-all" placeholder="0" />
                  <div className="flex justify-between mt-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Cost: Rs. {restockingProduct.purchasePrice}</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current: {restockingProduct.stockQuantity}</p>
                  </div>
               </div>
               <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 border-dashed">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Ledger Synchronization</p>
                  <p className="text-xs font-bold text-blue-700 leading-relaxed italic">This entry will automatically credit the supplier ledger and record outstanding payables if a vendor is linked.</p>
               </div>
               <div className="flex gap-4">
                <button type="button" onClick={() => setIsRestockModalOpen(false)} className="flex-1 py-5 border-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-2xl active:scale-95 transition-all">Log Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {isHistoryModalOpen && viewingHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-10 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-amber-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-amber-100">
                  <History className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Asset Audit Trail</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{viewingHistory.name} ({viewingHistory.sku})</p>
                </div>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-4 text-slate-400 hover:bg-white hover:text-rose-500 rounded-[1.5rem] transition-all">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
              {[...viewingHistory.movements].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((m, idx) => (
                <div key={m.id} className="flex items-start gap-6 group">
                   <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-sm border ${m.type === 'in' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-rose-100 text-rose-600 border-rose-200'}`}>
                         {m.type === 'in' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                      </div>
                      {idx !== viewingHistory.movements.length - 1 && <div className="w-0.5 h-16 bg-slate-100 my-1 group-hover:bg-blue-100 transition-colors"></div>}
                   </div>
                   <div className="flex-1 p-6 rounded-3xl border bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                         <span className={`text-[10px] font-black uppercase tracking-widest ${m.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {m.type === 'in' ? 'Procured (+)' : 'Dispatched (-)'}
                         </span>
                         <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {new Date(m.date).toLocaleString()}
                         </span>
                      </div>
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="font-black text-slate-800 text-lg tracking-tight">{m.reason}</p>
                            {m.referenceId && <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Reference: {m.referenceId}</p>}
                         </div>
                         <p className="text-3xl font-black text-slate-900 tracking-tighter">{m.quantity}</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Asset Schema Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="bg-white rounded-[3.5rem] shadow-3xl w-full max-w-xl overflow-hidden">
            <div className="p-10 border-b bg-blue-50 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-100">
                   {editingProduct ? <Edit2 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{editingProduct ? 'Modify Resource' : 'Register Asset'}</h3>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Source Supply</label>
                  <select name="vendorId" defaultValue={editingProduct?.vendorId || ''} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none cursor-pointer">
                    <option value="">Direct Procurement...</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Purchase Cost (Rs.)</label>
                  <input required type="number" step="0.01" name="purchasePrice" defaultValue={editingProduct?.purchasePrice} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all text-rose-600" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Retail Valuation (Rs.)</label>
                  <input required type="number" step="0.01" name="salePrice" defaultValue={editingProduct?.salePrice} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all text-emerald-600" />
                </div>
                {!editingProduct && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Opening Inventory</label>
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

export default Inventory;
