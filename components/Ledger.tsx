
import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { 
  BookOpenText, 
  Search, 
  CreditCard, 
  Banknote, 
  Calendar, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Bell, 
  Plus, 
  Send, 
  Trash2, 
  X, 
  Clock, 
  CheckCircle2,
  Mail,
  Smartphone,
  ChevronDown,
  Filter,
  Eye,
  FileDown,
  Building2,
  User,
  StickyNote,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  FileText,
  Printer,
  /* Added missing MapPin and Loader2 icons */
  MapPin,
  Loader2
} from 'lucide-react';
import { PaymentReminder, Invoice } from '../types';

const INITIAL_PAGE_SIZE = 15;

const Ledger: React.FC = () => {
  const { customers, ledger, reminders, invoices, addPayment, addReminder, markReminderAsSent, deleteReminder, user } = useApp();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'reminders'>('transactions');
  const [sendingId, setSendingId] = useState<string | null>(null);
  
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  // Modal state for viewing past invoices
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const activeCustomer = useMemo(() => 
    customers.find(c => c.id === selectedCustomerId),
  [customers, selectedCustomerId]);

  const filteredLedger = useMemo(() => {
    if (!selectedCustomerId) return [];
    
    let entries = ledger.filter(entry => entry.customerId === selectedCustomerId);
    
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
  }, [ledger, selectedCustomerId, ledgerSearch]);

  const pagedLedger = useMemo(() => 
    filteredLedger.slice(0, visibleCount),
  [filteredLedger, visibleCount]);

  const customerReminders = useMemo(() => 
    reminders
      .filter(r => r.customerId === selectedCustomerId)
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()),
  [reminders, selectedCustomerId]);

  const handlePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addPayment({
      customerId: selectedCustomerId,
      date: new Date().toISOString(),
      amount: parseFloat(formData.get('amount') as string),
      method: formData.get('method') as string,
      note: formData.get('note') as string,
    });
    setIsPaymentModalOpen(false);
  };

  const handleScheduleReminder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addReminder({
      customerId: selectedCustomerId,
      scheduledDate: formData.get('date') as string,
      message: formData.get('message') as string,
    });
    setIsReminderModalOpen(false);
  };

  const handleSendNow = (reminder: PaymentReminder) => {
    setSendingId(reminder.id);
    setTimeout(() => {
      markReminderAsSent(reminder.id);
      setSendingId(null);
    }, 1500);
  };

  const handleCustomerChange = (id: string) => {
    setSelectedCustomerId(id);
    setActiveTab('transactions');
    setVisibleCount(INITIAL_PAGE_SIZE);
    setLedgerSearch('');
  };

  const handleOpenInvoice = (refId: string) => {
    const inv = invoices.find(i => i.id === refId);
    if (inv) setViewInvoice(inv);
  };

  const downloadStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Customer Ledger</h2>
          <p className="text-slate-500">Fast, searchable access to account histories.</p>
        </div>
        <div className="flex gap-2">
          {selectedCustomerId && activeCustomer && (
            <>
              <button 
                onClick={downloadStatement}
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print Statement
              </button>
              {activeCustomer.totalOutstanding > 0 && (
                <>
                  <button 
                    onClick={() => setIsReminderModalOpen(true)}
                    className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-200 transition-colors shadow-sm"
                  >
                    <Bell className="w-4 h-4" /> Reminder
                  </button>
                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 active:scale-95"
                  >
                    <Banknote className="w-5 h-5" /> Receive Payment
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4 no-print">
          <div className="bg-white p-4 rounded-[2rem] border shadow-sm">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Search className="w-3 h-3" /> Select Account
            </label>
            <select 
              value={selectedCustomerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-5 py-4 border-2 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 appearance-none cursor-pointer border-slate-100 transition-all"
            >
              <option value="">Choose a customer...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {activeCustomer && (
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-24 -mt-24 transition-transform group-hover:scale-110"></div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mb-2">Net Outstanding</p>
                <h4 className={`text-4xl font-black tracking-tight ${activeCustomer.totalOutstanding > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  Rs. {activeCustomer.totalOutstanding.toLocaleString()}
                </h4>
              </div>
              <div className="pt-6 border-t border-slate-800 space-y-4 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400"><Smartphone className="w-5 h-5" /></div>
                   <p className="text-sm font-bold text-slate-300">{activeCustomer.phone}</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400"><MapPin className="w-5 h-5" /></div>
                   <p className="text-sm font-bold text-slate-300 truncate">{activeCustomer.address}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 bg-white rounded-[2.5rem] border shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          {!selectedCustomerId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center no-print">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border-2 border-dashed border-slate-200">
                <BookOpenText className="w-12 h-12 opacity-20" />
              </div>
              <h3 className="text-xl font-black text-slate-700 uppercase tracking-widest">Account Required</h3>
              <p className="max-w-xs mx-auto text-sm mt-3 font-medium text-slate-400 leading-relaxed">Please choose a client from the left panel to display their double-entry transaction history.</p>
            </div>
          ) : (
            <>
              {/* Header for print */}
              <div className="print-only p-12 mb-8 border-b-4 border-slate-900">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <h1 className="text-4xl font-black uppercase tracking-tighter">{user?.shopName}</h1>
                       <p className="text-sm font-bold text-slate-500 mt-2">{user?.address}</p>
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">TEL: {user?.phone}</p>
                    </div>
                    <div className="text-right">
                       <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-slate-300">Statement</h2>
                       <p className="text-sm font-bold text-slate-900 mt-1">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                 </div>
                 <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 flex justify-between items-center">
                    <div>
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Account Holder</span>
                       <h3 className="text-2xl font-black text-slate-900">{activeCustomer?.name}</h3>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Closing Balance</span>
                       <p className="text-3xl font-black text-rose-600">Rs. {activeCustomer?.totalOutstanding.toLocaleString()}</p>
                    </div>
                 </div>
              </div>

              <div className="flex border-b bg-slate-50 px-8 no-print">
                <button 
                  onClick={() => setActiveTab('transactions')}
                  className={`px-8 py-6 text-xs font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === 'transactions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Transactions
                </button>
                <button 
                  onClick={() => setActiveTab('reminders')}
                  className={`px-8 py-6 text-xs font-black uppercase tracking-widest transition-all border-b-4 flex items-center gap-3 ${activeTab === 'reminders' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Reminders 
                  {customerReminders.filter(r => r.status === 'pending').length > 0 && (
                    <span className="bg-amber-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black animate-pulse">{customerReminders.filter(r => r.status === 'pending').length}</span>
                  )}
                </button>
              </div>

              <div className="flex-1 flex flex-col">
                {activeTab === 'transactions' ? (
                  <>
                    <div className="p-6 border-b bg-white flex items-center gap-6 no-print">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search receipts, items, or amounts..."
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold transition-all"
                          value={ledgerSearch}
                          onChange={(e) => {
                            setLedgerSearch(e.target.value);
                            setVisibleCount(INITIAL_PAGE_SIZE);
                          }}
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left table-fixed">
                        <thead className="bg-slate-50 border-b sticky top-0 z-10">
                          <tr>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-500 uppercase tracking-widest w-40">Timestamp</th>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                            <th className="px-8 py-6 text-[11px] font-black text-rose-600 uppercase tracking-widest text-right w-36">Debit (+)</th>
                            <th className="px-8 py-6 text-[11px] font-black text-emerald-600 uppercase tracking-widest text-right w-36">Credit (-)</th>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right w-44">Bal. Sheet</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pagedLedger.map(entry => (
                            <tr key={entry.id} className={`hover:bg-slate-50/50 transition-colors animate-in fade-in duration-300 ${entry.description === 'Opening Balance' ? 'bg-amber-50/30' : ''}`}>
                              <td className="px-8 py-8 whitespace-nowrap">
                                <span className="text-sm font-bold text-slate-600">{new Date(entry.date).toLocaleDateString()}</span>
                              </td>
                              <td className="px-8 py-8">
                                <div className="flex items-center gap-4">
                                  {entry.type === 'invoice' ? <ArrowUpCircle className="w-5 h-5 text-rose-500" /> : <ArrowDownCircle className="w-5 h-5 text-emerald-500" />}
                                  <div className="min-w-0">
                                    {entry.type === 'invoice' && entry.description !== 'Opening Balance' ? (
                                      <button 
                                        onClick={() => handleOpenInvoice(entry.refId)}
                                        className="font-black text-slate-900 truncate hover:text-blue-600 hover:underline transition-all text-left block w-full tracking-tight"
                                      >
                                        {entry.description}
                                      </button>
                                    ) : (
                                      <p className="font-black text-slate-900 truncate tracking-tight">{entry.description}</p>
                                    )}
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ref ID: {entry.refId}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-8 text-right">
                                <span className="text-base font-black text-slate-900 tracking-tight">{entry.debit > 0 ? `Rs. ${entry.debit.toLocaleString()}` : '-'}</span>
                              </td>
                              <td className="px-8 py-8 text-right">
                                <span className="text-base font-black text-slate-900 tracking-tight">{entry.credit > 0 ? `Rs. ${entry.credit.toLocaleString()}` : '-'}</span>
                              </td>
                              <td className="px-8 py-8 text-right">
                                <span className={`text-lg font-black tracking-tight ${entry.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  Rs. {entry.balance.toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="p-10 space-y-8 no-print">
                    <div className="space-y-6">
                      {customerReminders.length === 0 ? (
                        <div className="py-24 text-center text-slate-400 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                          <Clock className="w-16 h-16 mx-auto mb-6 opacity-20" />
                          <p className="font-black uppercase tracking-widest text-sm">No Active Alarms</p>
                          <p className="text-xs font-bold text-slate-400 mt-2">Scheduled payment reminders will appear here.</p>
                        </div>
                      ) : (
                        customerReminders.map(reminder => (
                          <div key={reminder.id} className="p-8 bg-white border-2 border-slate-50 rounded-[2.5rem] flex items-center justify-between hover:border-blue-100 transition-all shadow-sm hover:shadow-xl group">
                            <div className="flex items-center gap-6">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner ${reminder.status === 'sent' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
                                {reminder.status === 'sent' ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                              </div>
                              <div>
                                <p className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{reminder.message}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                                  {reminder.status === 'sent' ? 'ARCHIVED ' : 'SCHEDULED FOR '}
                                  {new Date(reminder.scheduledDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {reminder.status === 'pending' && (
                                <button 
                                  disabled={sendingId === reminder.id}
                                  onClick={() => handleSendNow(reminder)}
                                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${sendingId === reminder.id ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100 active:scale-95'}`}
                                >
                                  {sendingId === reminder.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Transmit</>}
                                </button>
                              )}
                              <button 
                                onClick={() => deleteReminder(reminder.id)}
                                className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* VIEW INVOICE MODAL */}
      {viewInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 bg-slate-900/95 backdrop-blur-md no-print overflow-y-auto">
          <div className="bg-white md:rounded-[4rem] shadow-2xl w-full max-w-4xl min-h-screen md:min-h-0 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-12 duration-700 ease-out">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-12 py-10 border-b flex items-center justify-between z-20">
              <div className="flex items-center gap-8">
                <div className="bg-emerald-500 text-white p-4 rounded-[1.5rem] shadow-2xl shadow-emerald-100"><ShieldCheck className="w-8 h-8" /></div>
                <div>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tighter">Document Authenticated</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Transaction Proof Archive</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => window.print()} className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 shadow-2xl active:scale-95 transition-all"><Printer className="w-5 h-5" /> Print Hardcopy</button>
                <button onClick={() => setViewInvoice(null)} className="p-5 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-[1.5rem] transition-all"><X className="w-8 h-8" /></button>
              </div>
            </div>

            <div className="p-16 md:p-24 bg-white invoice-container flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24 items-start">
                <div>
                  <div className="flex items-center gap-10 mb-12">
                    <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-3xl overflow-hidden">
                      {user?.logoUrl ? <img src={user.logoUrl} className="w-full h-full object-contain p-2" /> : <Building2 className="w-12 h-12" />}
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{user?.shopName}</h1>
                  </div>
                  <div className="text-sm text-slate-400 border-l-4 border-blue-600 pl-8 font-bold italic opacity-80 leading-relaxed">
                    <p>{user?.address}</p>
                    <p className="mt-4 text-[10px] font-black not-italic text-slate-900 uppercase tracking-widest">Phone: {user?.phone}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end pt-4">
                   <div className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-3xl">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 mb-3 text-center">Receipt Index</p>
                      <p className="text-4xl font-black font-mono tracking-tight">#{viewInvoice.invoiceNumber}</p>
                   </div>
                   <p className="text-sm font-black text-slate-300 mt-8 uppercase tracking-[0.3em]">{new Date(viewInvoice.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-12 rounded-[3.5rem] bg-slate-50 border-4 border-white shadow-inner mb-24 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center gap-10">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-xl border-4 border-slate-50"><User className="w-10 h-10" /></div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-2 block">Client Account</span>
                    <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{viewInvoice.customerName}</h4>
                  </div>
                </div>
                <div className={`px-12 py-5 rounded-[2rem] border-8 rotate-[-3deg] shadow-2xl ${viewInvoice.total === viewInvoice.paidAmount ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-rose-50 border-rose-500 text-rose-600'}`}>
                  <span className="text-3xl font-black uppercase tracking-tighter italic">{viewInvoice.total === viewInvoice.paidAmount ? 'SETTLED' : 'DUE'}</span>
                </div>
              </div>

              <table className="w-full text-left mb-24">
                <thead><tr className="border-b-[8px] border-slate-900"><th className="py-8 text-[11px] font-black uppercase tracking-[0.6em] pl-10">Line Item</th><th className="py-8 text-center text-[11px] font-black uppercase tracking-[0.6em] w-32">Qty</th><th className="py-8 text-right text-[11px] font-black uppercase tracking-[0.6em] pr-10 w-48">Subtotal</th></tr></thead>
                <tbody className="divide-y-2 divide-slate-100">
                  {viewInvoice.items.map((item, idx) => (
                    <tr key={idx}><td className="py-10 pl-10 font-black text-slate-900 text-3xl tracking-tight">{item.productName}</td><td className="py-10 text-center text-3xl font-black">{item.quantity}</td><td className="py-10 text-right text-3xl font-black pr-10 tracking-tight">Rs. {item.total.toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start pt-20 border-t-[8px] border-slate-900">
                <div className="space-y-10">
                  <div className="space-y-4">
                    <h5 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.6em] flex items-center gap-3"><StickyNote className="w-4 h-4" /> Observations</h5>
                    <div className="text-sm font-bold text-slate-500 italic bg-slate-50 p-12 rounded-[3.5rem] border-4 border-dashed border-slate-100 leading-relaxed shadow-inner">{viewInvoice.notes || 'No specific terms recorded.'}</div>
                  </div>
                  <div className="flex items-center gap-10 opacity-40">
                     <div className="w-32 h-32 bg-white border-[8px] rounded-[3rem] flex items-center justify-center p-4 shadow-xl border-slate-50"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=HIST:${viewInvoice.id}`} className="w-full h-full" /></div>
                     <div className="space-y-2"><p className="text-xs font-black uppercase tracking-widest text-slate-900">Archived Record</p><p className="text-[10px] font-bold text-slate-400 max-w-[150px]">Transaction authenticated and ledger synchronized. Ref: {viewInvoice.id.slice(0,8)}</p></div>
                  </div>
                </div>
                <div className="bg-slate-900 p-14 rounded-[4.5rem] text-white shadow-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.6em] opacity-30 mb-8"><span>Market Value</span><span>Rs. {viewInvoice.subtotal.toLocaleString()}</span></div>
                  <div className="h-[2px] bg-white/5 my-10"></div>
                  <div className="space-y-3 mb-14"><span className="text-[10px] font-black uppercase tracking-[0.8em] text-blue-400 block">Total Due</span><span className="text-7xl font-black italic tracking-tighter">Rs. {viewInvoice.total.toLocaleString()}</span></div>
                  <div className="grid grid-cols-2 gap-8 pt-12 border-t border-white/5 relative z-10">
                    <div className="p-8 rounded-[3rem] bg-white/5 border-2 border-white/10 shadow-sm"><span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 block mb-3">Recovered</span><p className="text-3xl font-black tracking-tighter">Rs. {viewInvoice.paidAmount.toLocaleString()}</p></div>
                    <div className={`p-8 rounded-[3rem] border-2 shadow-sm ${viewInvoice.total - viewInvoice.paidAmount > 0 ? 'bg-rose-500/20 border-rose-500/30' : 'bg-slate-800 border-slate-700'}`}><span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 block mb-3">Remaining</span><p className={`text-3xl font-black tracking-tighter ${viewInvoice.total - viewInvoice.paidAmount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>Rs. {(viewInvoice.total - viewInvoice.paidAmount).toLocaleString()}</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standard Payment & Reminder Modals */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md no-print overflow-y-auto">
          <div className="bg-white rounded-[3rem] shadow-3xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b bg-emerald-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <h3 className="text-3xl font-black text-emerald-900 tracking-tighter relative z-10">Capture Settlement</h3>
              <p className="text-sm font-bold text-emerald-700 mt-2 relative z-10 opacity-70">Updating ledger for {activeCustomer?.name}</p>
            </div>
            <form onSubmit={handlePayment} className="p-10 space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Settlement Amount (Rs.)</label>
                <input required type="number" step="0.01" name="amount" max={activeCustomer?.totalOutstanding} defaultValue={activeCustomer?.totalOutstanding} className="w-full px-6 py-5 text-4xl font-black border-4 border-slate-100 rounded-3xl focus:ring-4 focus:ring-emerald-100 outline-none text-emerald-600 bg-slate-50/50 shadow-inner transition-all" />
                <p className="text-xs font-black text-slate-300 mt-4 uppercase tracking-widest">Full Clearing: Rs. {activeCustomer?.totalOutstanding.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Payment Channel</label>
                <select name="method" className="w-full px-6 py-5 border-2 border-slate-100 rounded-2xl bg-white font-black text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer transition-all">
                  <option value="Cash">Physical Cash</option>
                  <option value="Bank Transfer">Digital Wire</option>
                  <option value="Check">Business Check</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-5 border-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-2xl active:scale-95 transition-all">Finalize Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isReminderModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md no-print overflow-y-auto">
          <div className="bg-white rounded-[3rem] shadow-3xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
            <div className="p-10 border-b bg-amber-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-3xl font-black text-amber-900 tracking-tighter">Debt Notification</h3>
                <button onClick={() => setIsReminderModalOpen(false)} className="p-3 hover:bg-amber-100 rounded-2xl transition-all"><X className="w-8 h-8 text-amber-900" /></button>
              </div>
              <p className="text-amber-700 font-bold text-sm opacity-70">Automated alarm configuration for {activeCustomer?.name}</p>
            </div>
            <form onSubmit={handleScheduleReminder} className="p-10 space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><Calendar className="w-3 h-3" /> Activation Target</label>
                <input required type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-black text-slate-800 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Custom Alert Logic</label>
                <textarea required name="message" rows={4} defaultValue={`Friendly payment notice: Your outstanding account with ${user?.shopName} stands at Rs. ${activeCustomer?.totalOutstanding.toLocaleString()}. Please process this settlement at your convenience.`} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm font-bold leading-relaxed shadow-inner transition-all"></textarea>
              </div>
              <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-black shadow-2xl active:scale-95 flex items-center justify-center gap-4 transition-all"><Bell className="w-5 h-5" /> Arm Reminder System</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;
