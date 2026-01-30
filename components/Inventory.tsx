
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Plus, Search, Filter, Edit2, Trash2, Package, History, X, ArrowDownCircle, ArrowUpCircle, Clock } from 'lucide-react';
import { Product, StockMovement } from '../types';

const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (p: Product | null = null) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleOpenHistory = (p: Product) => {
    setViewingHistory(p);
    setIsHistoryModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      purchasePrice: parseFloat(formData.get('purchasePrice') as string),
      salePrice: parseFloat(formData.get('salePrice') as string),
      stockQuantity: parseInt(formData.get('stockQuantity') as string),
      lowStockThreshold: parseInt(formData.get('lowStockThreshold') as string),
    };

    if (editingProduct) {
      updateProduct({ ...editingProduct, ...productData }, 'Manual Admin Adjustment');
    } else {
      addProduct(productData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Ecosystem</h2>
          <p className="text-slate-500">Track lifecycle of products and stock history.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
        >
          <Plus className="w-5 h-5" /> New SKU
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter by SKU or Name..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="px-6 py-4 bg-blue-50 text-blue-600 font-black uppercase text-[10px] tracking-widest rounded-2xl border border-blue-100 flex items-center shadow-sm">
            {products.length} Active SKUs
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-10">Asset Detail</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Shelf Stock</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Unit Valuations</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Potential Margin</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-10">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const isLowStock = product.stockQuantity <= product.lowStockThreshold;
                const profit = product.salePrice - product.purchasePrice;
                const margin = ((profit / product.salePrice) * 100).toFixed(1);

                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-8 pl-10">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border-2 ${isLowStock ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-blue-50 border-blue-100 text-blue-500'}`}>
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">{product.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-center">
                      <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border ${isLowStock ? 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                        {product.stockQuantity} UNITS
                      </span>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <p className="text-base font-black text-slate-900 tracking-tight">Rs. {product.salePrice.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Cost: Rs. {product.purchasePrice}</p>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <p className="text-base font-black text-emerald-600 tracking-tight">+Rs. {profit}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{margin}% Performance</p>
                    </td>
                    <td className="px-8 py-8 text-right pr-10">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleOpenHistory(product)} title="Stock History" className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all">
                          <History className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleOpenModal(product)} title="Edit Details" className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => deleteProduct(product.id)} title="Delete Product" className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
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
          <div className="py-24 text-center">
             <Package className="w-16 h-16 text-slate-100 mx-auto mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No assets discovered.</p>
          </div>
        )}
      </div>

      {/* History Modal */}
      {isHistoryModalOpen && viewingHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-10 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-amber-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-amber-100">
                  <History className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Stock Ledger History</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{viewingHistory.name} ({viewingHistory.sku})</p>
                </div>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-4 text-slate-400 hover:bg-white hover:text-rose-500 rounded-[1.5rem] transition-all">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-6">
              {[...viewingHistory.movements].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((m, idx) => (
                <div key={m.id} className="flex items-start gap-6 group">
                   <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${m.type === 'in' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                         {m.type === 'in' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                      </div>
                      {idx !== viewingHistory.movements.length - 1 && <div className="w-0.5 h-16 bg-slate-100 my-1 group-hover:bg-blue-100 transition-colors"></div>}
                   </div>
                   <div className="flex-1 p-6 rounded-3xl border bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                         <span className={`text-xs font-black uppercase tracking-widest ${m.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            Stock {m.type === 'in' ? 'Added (+)' : 'Removed (-)'}
                         </span>
                         <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {new Date(m.date).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="font-black text-slate-800 text-lg tracking-tight">{m.reason}</p>
                            {m.referenceId && <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">REF: {m.referenceId}</p>}
                         </div>
                         <p className="text-3xl font-black text-slate-900 tracking-tighter">{m.quantity}</p>
                      </div>
                   </div>
                </div>
              ))}
              {viewingHistory.movements.length === 0 && (
                <div className="text-center py-20 text-slate-300">
                   <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                   <p className="font-black uppercase tracking-widest text-xs">No Movement Data Recorded</p>
                </div>
              )}
            </div>

            <div className="p-8 border-t bg-slate-50/50 text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">End of Audit Trail</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="bg-white rounded-[3.5rem] shadow-3xl w-full max-w-xl overflow-hidden">
            <div className="p-10 border-b bg-blue-50 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-100">
                   {editingProduct ? <Edit2 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{editingProduct ? 'Update Asset' : 'Register New SKU'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Product Designation</label>
                  <input required name="name" defaultValue={editingProduct?.name} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all" placeholder="e.g., Ultra-Slim Laptop X2" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">SKU Reference</label>
                  <input required name="sku" defaultValue={editingProduct?.sku} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all uppercase" placeholder="SKU-XXXX" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Safety Threshold</label>
                  <input required type="number" name="lowStockThreshold" defaultValue={editingProduct?.lowStockThreshold || 5} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Acquisition Price (Rs.)</label>
                  <input required type="number" step="0.01" name="purchasePrice" defaultValue={editingProduct?.purchasePrice} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all text-rose-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Market Price (Rs.)</label>
                  <input required type="number" step="0.01" name="salePrice" defaultValue={editingProduct?.salePrice} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all text-emerald-600" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Stock Inventory Units</label>
                  <input required type="number" name="stockQuantity" defaultValue={editingProduct?.stockQuantity} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all text-xl" />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
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
