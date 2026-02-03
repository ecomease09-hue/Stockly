
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { 
  Truck, 
  Search, 
  Banknote, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  X, 
  Clock, 
  Wallet2,
  Building2,
  MapPin,
  Smartphone,
  Printer,
  History,
  Coins,
  ReceiptText,
  Calendar,
  CheckCircle2,
  Loader2,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { VendorLedgerEntry } from '../types';

const INITIAL_PAGE_SIZE = 15;

const VendorLedger: React.FC = () => {
  const { vendors, vendorLedger, addVendorPayment, user } = useApp();
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const activeVendor = useMemo(() => 
    vendors.find(v => v.id === selectedVendorId),
  [vendors, selectedVendorId]);

  const filteredLedger = useMemo(() => {
    if (!selectedVendorId) return [];
    
    let entries = vendorLedger.filter(entry => entry.vendorId === selectedVendorId);
    
    if (ledgerSearch.trim()) {
      const query = ledgerSearch.toLowerCase();
      entries = entries.filter(e => 
        e.description.toLowerCase().includes(query) || 
        e.refId.toLowerCase().includes(query) ||
        e.debit.toString().includes(query) ||
        e.credit.toString().includes(query)
      );
    }

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [vendorLedger, selectedVendorId, ledgerSearch]);

  const pagedLedger = useMemo(() => 
    filteredLedger.slice(0, visibleCount),
  [filteredLedger, visibleCount]);

  const handleVendorPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const paymentDate = formData.get('date') as string;
    
    // Simulate slight processing for UX feel
    setTimeout(() => {
      addVendorPayment({
        vendorId: selectedVendorId,
        date: new Date(paymentDate).toISOString(),
        amount,
        method: formData.get('method') as string,
        note: formData.get('note') as string,
      });
      
      setIsSubmitting(false);
      setIsPaymentModalOpen(false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
    }, 600);
  };

  const downloadStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6 relative">
      {/* Local Feedback Toast */}
      {successToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-emerald-900/90 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-toast backdrop-blur-md border border-emerald-500">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-black text-sm uppercase tracking-widest">Settlement Logged Successfully</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
             <Wallet2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Supplier Ledger</h2>
            <p className="text-slate-500 text-sm">Accounts payable and settlement history.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedVendorId && activeVendor && (
            <>
              <button 
                onClick={downloadStatement}
                className="bg-white border-2 border-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                <Printer className="w-4 h-4" /> Print Statement
              </button>
              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
              >
                <Banknote className="w-5 h-5" /> Log Payment
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4 no-print">
          <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Search className="w-3 h-3" /> Source Selection
            </label>
            <select 
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full px-5 py-4 border-2 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 appearance-none cursor-pointer border-slate-100 transition-all"
            >
              <option value="">Choose Supplier...</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {activeVendor && (
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-24 -mt-24 transition-transform group-hover:scale-110"></div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mb-2 flex items-center gap-2">
                  <Coins className="w-3 h-3 text-amber-500" /> Current Payables
                </p>
                <h4 className={`text-4xl font-black tracking-tight italic ${activeVendor.totalBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  Rs. {activeVendor.totalBalance.toLocaleString()}
                </h4>
              </div>
              <div className="pt-6 border-t border-slate-800 space-y-4 relative z-10">
                <div className="flex items-center gap-4 group/item">
                   <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all"><Smartphone className="w-5 h-5" /></div>
                   <p className="text-sm font-bold text-slate-300">{activeVendor.phone}</p>
                </div>
                <div className="flex items-center gap-4 group/item">
                   <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all"><MapPin className="w-5 h-5" /></div>
                   <p className="text-sm font-bold text-slate-300 truncate">{activeVendor.address}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 bg-white rounded-[2.5rem] border shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          {!selectedVendorId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center no-print">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border-2 border-dashed border-slate-200">
                <Wallet2 className="w-12 h-12 opacity-20" />
              </div>
              <h3 className="text-xl font-black text-slate-700 uppercase tracking-widest">Select Supplier</h3>
              <p className="max-w-xs mx-auto text-sm mt-3 font-medium text-slate-400 leading-relaxed italic">Choose a vendor from the catalog to inspect their procurement lifecycle and balance sheet.</p>
            </div>
          ) : (
            <>
              {/* Print Statement Header */}
              <div className="print-only p-12 mb-8 border-b-4 border-slate-900">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">{user?.shopName}</h1>
                       <p className="text-sm font-bold text-slate-500 mt-4">{user?.address}</p>
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">TEL: {user?.phone}</p>
                    </div>
                    <div className="text-right">
                       <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-slate-300">Procurement Statement</h2>
                       <p className="text-sm font-bold text-slate-900 mt-2">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                 </div>
                 <div className="p-10 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 flex justify-between items-center">
                    <div>
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Vendor Identity</span>
                       <h3 className="text-3xl font-black text-slate-900 tracking-tight">{activeVendor?.name}</h3>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Closing Balance (Payable)</span>
                       <p className="text-4xl font-black text-amber-600 italic">Rs. {activeVendor?.totalBalance.toLocaleString()}</p>
                    </div>
                 </div>
              </div>

              <div className="flex border-b bg-slate-50 px-8 no-print items-center justify-between">
                <div className="flex">
                  <button className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-4 border-blue-600 text-blue-600">
                    Double-Entry Ledger
                  </button>
                </div>
                <div className="flex-1 max-w-md ml-8 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by ID, Desc, or Amt..."
                    className="w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-[11px] font-black transition-all"
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left table-fixed">
                  <thead className="bg-slate-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest w-40">Txn Date</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry Particulars</th>
                      <th className="px-8 py-6 text-[10px] font-black text-rose-600 uppercase tracking-widest text-right w-36">Stock (+)</th>
                      <th className="px-8 py-6 text-[10px] font-black text-emerald-600 uppercase tracking-widest text-right w-36">Payment (-)</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right w-44">Bal. Owed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedLedger.map(entry => (
                      <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors animate-in fade-in duration-300 group">
                        <td className="px-8 py-8 whitespace-nowrap">
                          <span className="text-sm font-bold text-slate-600">{new Date(entry.date).toLocaleDateString()}</span>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-4">
                            {entry.type === 'purchase' ? (
                              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0"><ArrowUpCircle className="w-5 h-5" /></div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><ArrowDownCircle className="w-5 h-5" /></div>
                            )}
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 truncate tracking-tight group-hover:text-blue-600 transition-colors">{entry.description}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ref: {entry.refId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <span className="text-base font-black text-slate-900 tracking-tighter">{entry.credit > 0 ? `Rs. ${entry.credit.toLocaleString()}` : '-'}</span>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <span className="text-base font-black text-slate-900 tracking-tighter">{entry.debit > 0 ? `Rs. ${entry.debit.toLocaleString()}` : '-'}</span>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <span className={`text-lg font-black tracking-tighter ${entry.balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            Rs. {entry.balance.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {pagedLedger.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200">
                            <History className="w-8 h-8 opacity-10 text-slate-400" />
                          </div>
                          <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Zero Ledger Activity</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SETTLE DUES MODAL (Vendor Payment) */}
      {isPaymentModalOpen && activeVendor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md no-print">
          <div className="bg-white rounded-[3.5rem] shadow-3xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="p-12 border-b bg-blue-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
              <div className="flex items-center gap-6 relative z-10">
                 <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-100">
                    <Banknote className="w-8 h-8" />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-blue-900 tracking-tighter">Record Settlement</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1 opacity-60">Source: {activeVendor.name}</p>
                 </div>
              </div>
            </div>
            <form onSubmit={handleVendorPayment} className="p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-2 space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-2">
                    <Coins className="w-3 h-3" /> Amount Transmitted (Rs.)
                  </label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    name="amount" 
                    max={activeVendor.totalBalance} 
                    defaultValue={activeVendor.totalBalance} 
                    className="w-full px-6 py-6 text-4xl font-black border-4 border-slate-100 rounded-3xl focus:ring-4 focus:ring-blue-100 outline-none text-blue-600 bg-slate-50/50 shadow-inner transition-all" 
                  />
                  <div className="flex justify-between items-center px-2">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Dues: Rs. {activeVendor.totalBalance.toLocaleString()}</p>
                     <p className="text-[10px] font-black text-blue-400 uppercase italic">Full Clearance Possible</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-2">
                    <Calendar className="w-3 h-3" /> Payment Date
                  </label>
                  <input 
                    required 
                    type="date" 
                    name="date" 
                    defaultValue={new Date().toISOString().split('T')[0]} 
                    className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50 font-black text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-2">
                    <CreditCard className="w-3 h-3" /> Channel
                  </label>
                  <select name="method" className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50 font-black text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-all">
                    <option value="Cash">Physical Cash</option>
                    <option value="Bank Transfer">Digital Wire</option>
                    <option value="Cheque">Business Cheque</option>
                    <option value="Other">External Debit</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-2">
                  Particulars / Remarks
                </label>
                <input name="note" placeholder="Optional reference or receipt ID..." className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-5 border-2 border-slate-100 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Discard</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-[2] py-5 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Commit Settlement</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorLedger;
