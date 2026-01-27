
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
  ShieldCheck
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

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Customer Ledger</h2>
          <p className="text-slate-500">Fast, searchable access to account histories.</p>
        </div>
        <div className="flex gap-2">
          {selectedCustomerId && activeCustomer && activeCustomer.totalOutstanding > 0 && (
            <>
              <button 
                onClick={() => setIsReminderModalOpen(true)}
                className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-200 transition-colors"
              >
                <Bell className="w-4 h-4" /> Reminder
              </button>
              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
              >
                <Banknote className="w-5 h-5" /> Receive Payment
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm no-print">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Search className="w-3 h-3" /> Select Account
            </label>
            <select 
              value={selectedCustomerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 appearance-none cursor-pointer"
            >
              <option value="">Choose a customer...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {activeCustomer && (
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl space-y-4 relative overflow-hidden group no-print">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest relative z-10">Current Balance</p>
              <h4 className={`text-3xl font-black relative z-10 tracking-tight ${activeCustomer.totalOutstanding > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                Rs. {activeCustomer.totalOutstanding.toLocaleString()}
              </h4>
              <div className="pt-4 border-t border-slate-800 space-y-3 relative z-10">
                <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" /> {activeCustomer.phone}
                </p>
                <p className="text-sm font-bold text-slate-300 flex items-center gap-2 leading-tight">
                  <Calendar className="w-4 h-4 text-blue-400" /> Since {new Date().getFullYear()}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 bg-white rounded-[2rem] border shadow-sm overflow-hidden min-h-[500px] flex flex-col no-print">
          {!selectedCustomerId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
                <BookOpenText className="w-10 h-10 opacity-20" />
              </div>
              <h3 className="text-lg font-black text-slate-700">No Account Selected</h3>
              <p className="max-w-xs mx-auto text-sm mt-2">Select a customer to view their optimized transaction history and running balance.</p>
            </div>
          ) : (
            <>
              <div className="flex border-b bg-slate-50 px-6">
                <button 
                  onClick={() => setActiveTab('transactions')}
                  className={`px-6 py-5 text-xs font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === 'transactions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Transactions
                </button>
                <button 
                  onClick={() => setActiveTab('reminders')}
                  className={`px-6 py-5 text-xs font-black uppercase tracking-widest transition-all border-b-4 flex items-center gap-2 ${activeTab === 'reminders' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Reminders 
                  {customerReminders.filter(r => r.status === 'pending').length > 0 && (
                    <span className="bg-amber-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black">{customerReminders.filter(r => r.status === 'pending').length}</span>
                  )}
                </button>
              </div>

              <div className="flex-1 flex flex-col">
                {activeTab === 'transactions' ? (
                  <>
                    <div className="p-4 border-b bg-white flex items-center gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search in ledger..."
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                          value={ledgerSearch}
                          onChange={(e) => {
                            setLedgerSearch(e.target.value);
                            setVisibleCount(INITIAL_PAGE_SIZE);
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border">
                        <Filter className="w-3 h-3" /> {filteredLedger.length} Records
                      </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left table-fixed">
                        <thead className="bg-slate-50 border-b sticky top-0 z-10">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32">Date</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Details</th>
                            <th className="px-6 py-4 text-[10px] font-black text-rose-600 uppercase tracking-widest text-right w-32">Debit (+)</th>
                            <th className="px-6 py-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest text-right w-32">Credit (-)</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right w-40">Running Bal.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {pagedLedger.map(entry => (
                            <tr key={entry.id} className="hover:bg-blue-50/30 transition-colors animate-in fade-in duration-300">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-bold text-slate-600">{new Date(entry.date).toLocaleDateString()}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {entry.type === 'invoice' ? <ArrowUpCircle className="w-4 h-4 text-rose-500" /> : <ArrowDownCircle className="w-4 h-4 text-emerald-500" />}
                                  <div className="min-w-0">
                                    {entry.type === 'invoice' ? (
                                      <button 
                                        onClick={() => handleOpenInvoice(entry.refId)}
                                        className="font-bold text-slate-900 truncate hover:text-blue-600 hover:underline transition-all text-left block w-full"
                                      >
                                        {entry.description}
                                      </button>
                                    ) : (
                                      <p className="font-bold text-slate-900 truncate">{entry.description}</p>
                                    )}
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Ref: {entry.refId}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-sm font-black text-slate-900">{entry.debit > 0 ? `Rs. ${entry.debit.toLocaleString()}` : '-'}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-sm font-black text-slate-900">{entry.credit > 0 ? `Rs. ${entry.credit.toLocaleString()}` : '-'}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className={`text-sm font-black ${entry.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
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
                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      {customerReminders.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                          <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p className="font-bold">No reminders scheduled for this profile.</p>
                        </div>
                      ) : (
                        customerReminders.map(reminder => (
                          <div key={reminder.id} className="p-5 bg-white border rounded-[1.5rem] flex items-center justify-between hover:border-blue-300 transition-all shadow-sm hover:shadow-md group">
                            <div className="flex items-center gap-5">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${reminder.status === 'sent' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
                                {reminder.status === 'sent' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{reminder.message}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                  {reminder.status === 'sent' ? 'DOCUMENT SENT ' : 'PENDING UNTIL '}
                                  {new Date(reminder.scheduledDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {reminder.status === 'pending' && (
                                <button 
                                  disabled={sendingId === reminder.id}
                                  onClick={() => handleSendNow(reminder)}
                                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${sendingId === reminder.id ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'}`}
                                >
                                  {sendingId === reminder.id ? 'Processing...' : <><Send className="w-3 h-3" /> Transmit</>}
                                </button>
                              )}
                              <button 
                                onClick={() => deleteReminder(reminder.id)}
                                className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
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

      {/* VIEW INVOICE MODAL (REUSED FROM BILLING) */}
      {viewInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 bg-slate-900/95 backdrop-blur-md no-print overflow-y-auto">
          <div className="bg-white md:rounded-[4rem] shadow-2xl w-full max-w-4xl min-h-screen md:min-h-0 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-12 duration-700 ease-out">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-10 py-8 border-b flex items-center justify-between z-20 no-print">
              <div className="flex items-center gap-6">
                <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-xl shadow-emerald-100"><ShieldCheck className="w-7 h-7" /></div>
                <div><h3 className="font-black text-slate-900 text-lg tracking-tight">Invoice Authentication</h3><p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Historical Transaction Record</p></div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={downloadPDF} className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 shadow-2xl shadow-blue-200 active:scale-95 transition-all"><FileDown className="w-4 h-4" /> Save / Print PDF</button>
                <button onClick={() => setViewInvoice(null)} className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><X className="w-7 h-7" /></button>
              </div>
            </div>

            <div className="p-16 md:p-24 bg-white invoice-container flex-1">
              {/* Simplified professional invoice view */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20 items-start">
                <div>
                  <div className="flex items-center gap-8 mb-12">
                    <div className="w-28 h-28 bg-white rounded-[2rem] flex items-center justify-center text-slate-900 shadow-3xl border border-slate-50 overflow-hidden">
                      {user?.logoUrl ? (
                        <img src={user.logoUrl} alt="Shop Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white"><Building2 className="w-14 h-14" /></div>
                      )}
                    </div>
                    <div>
                      <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{user?.shopName || 'STOCKLY'}</h1>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 border-l-8 border-blue-600 pl-8 py-2 font-bold italic opacity-80">
                    <p className="max-w-xs">{user?.address || 'Address N/A'}</p>
                    <p className="font-black not-italic text-slate-900 text-[11px] uppercase tracking-[0.3em] mt-4">TEL: {user?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex flex-col md:items-end pt-4">
                  <div className="space-y-4 text-right bg-slate-900 p-10 rounded-[3rem] text-white">
                    <div className="flex justify-end gap-12 text-sm"><span className="text-slate-500 uppercase tracking-[0.5em] text-[10px] font-black pt-1">Ref</span><span className="font-black font-mono text-xl">#{viewInvoice.invoiceNumber}</span></div>
                    <div className="flex justify-end gap-12 text-sm"><span className="text-slate-500 uppercase tracking-[0.5em] text-[10px] font-black pt-1">Date</span><span className="font-black text-lg">{new Date(viewInvoice.date).toLocaleDateString()}</span></div>
                  </div>
                </div>
              </div>

              <div className="p-14 bg-slate-50 rounded-[4rem] mb-20 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-xl border border-slate-100"><User className="w-10 h-10" /></div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 block">Recipient</span>
                    <h4 className="text-4xl font-black text-slate-900 tracking-tight">{viewInvoice.customerName}</h4>
                  </div>
                </div>
                <div className={`px-10 py-4 rounded-[2rem] border-4 flex flex-col items-center justify-center rotate-[-4deg] ${viewInvoice.total === viewInvoice.paidAmount ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-rose-50 border-rose-500 text-rose-600'}`}>
                  <span className="text-2xl font-black uppercase tracking-tighter">{viewInvoice.total === viewInvoice.paidAmount ? 'FULLY PAID' : 'PARTIAL DUE'}</span>
                </div>
              </div>

              <table className="w-full text-left mb-24">
                <thead><tr className="border-b-[8px] border-slate-900">
                  <th className="py-8 text-xs font-black uppercase tracking-[0.6em] pl-8">Specifications</th>
                  <th className="py-8 text-center text-xs font-black uppercase tracking-[0.6em]">Qty</th>
                  <th className="py-8 text-right text-xs font-black uppercase tracking-[0.6em] pr-8">Valuation</th>
                </tr></thead>
                <tbody className="divide-y-4 divide-slate-50">
                  {viewInvoice.items.map((item, idx) => (
                    <tr key={idx}><td className="py-8 pl-8 font-black text-slate-900 text-2xl">{item.productName}</td><td className="py-8 text-center text-2xl font-black">{item.quantity}</td><td className="py-8 text-right text-2xl font-black pr-8">Rs. {item.total.toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start pt-16 border-t-[8px] border-slate-900">
                <div className="md:col-span-6 space-y-6">
                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] flex items-center gap-3"><StickyNote className="w-4 h-4" /> Notes</h5>
                  <div className="text-sm font-bold text-slate-600 italic bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed">{viewInvoice.notes || 'N/A'}</div>
                </div>
                <div className="md:col-span-6">
                  <div className="bg-slate-900 p-12 rounded-[4rem] text-white space-y-8">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.4em] opacity-60"><span>Gross</span><span>Rs. {viewInvoice.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between items-end group"><div className="space-y-1"><span className="font-black text-blue-400 text-[10px] uppercase tracking-[0.6em] block">Grand Total</span><span className="text-6xl font-black">Rs. {viewInvoice.total.toLocaleString()}</span></div></div>
                    <div className="grid grid-cols-2 gap-6 pt-8 mt-4 border-t border-slate-800">
                      <div className="p-6 rounded-[2rem] bg-emerald-500 border-2 border-emerald-400">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] block text-white/70">Paid</span>
                        <p className="text-2xl font-black text-white">Rs. {viewInvoice.paidAmount.toLocaleString()}</p>
                      </div>
                      <div className={`p-6 rounded-[2rem] border-2 ${viewInvoice.total - viewInvoice.paidAmount > 0 ? 'bg-rose-600 border-rose-400' : 'bg-slate-800 border-slate-700'}`}>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] block text-white/70">Balance</span>
                        <p className="text-2xl font-black text-white">Rs. {(viewInvoice.total - viewInvoice.paidAmount).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment and Reminder Modals (unchanged logic) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-3xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b bg-emerald-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <h3 className="text-2xl font-black text-emerald-900 tracking-tight relative z-10">Capture Payment</h3>
              <p className="text-sm font-bold text-emerald-700 mt-1 relative z-10">Receiving funds for {activeCustomer?.name}</p>
            </div>
            <form onSubmit={handlePayment} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Settlement Amount (Rs.)</label>
                <input required type="number" step="0.01" name="amount" max={activeCustomer?.totalOutstanding} defaultValue={activeCustomer?.totalOutstanding} className="w-full px-5 py-4 text-3xl font-black border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-600 bg-slate-50/50 shadow-inner" />
                <p className="text-xs font-bold text-slate-400 mt-3">Full Clearing: Rs. {activeCustomer?.totalOutstanding.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Mechanism</label>
                <select name="method" className="w-full px-5 py-4 border rounded-2xl bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer">
                  <option value="Cash">Physical Cash</option>
                  <option value="Bank Transfer">Digital Wire Transfer</option>
                  <option value="Check">Business Check</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-4 border rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Abort</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-2xl shadow-emerald-200 transition-all active:scale-95">Finalize Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isReminderModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-3xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
            <div className="p-8 border-b bg-amber-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-amber-900 tracking-tight">Debt Notification</h3>
                <button onClick={() => setIsReminderModalOpen(false)} className="p-2 hover:bg-amber-100 rounded-xl transition-colors"><X className="w-6 h-6 text-amber-900" /></button>
              </div>
              <p className="text-amber-700 font-bold text-sm">Automated alert configuration for {activeCustomer?.name}</p>
            </div>
            <form onSubmit={handleScheduleReminder} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar className="w-3 h-3" /> Activation Date</label>
                <input required type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-slate-800" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Custom Alert Text</label>
                <textarea required name="message" rows={4} defaultValue={`Friendly payment notice: Your outstanding account with ${useApp().user?.shopName} stands at Rs. ${activeCustomer?.totalOutstanding.toLocaleString()}. Please process this settlement at your convenience.`} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm font-bold leading-relaxed shadow-inner"></textarea>
              </div>
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black shadow-2xl shadow-slate-300 transition-all active:scale-95 flex items-center justify-center gap-3"><Bell className="w-4 h-4" /> Arm Reminder System</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;
