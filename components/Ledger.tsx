
import React, { useState } from 'react';
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
  Smartphone
} from 'lucide-react';
import { PaymentReminder } from '../types';

const Ledger: React.FC = () => {
  const { customers, ledger, reminders, addPayment, addReminder, markReminderAsSent, deleteReminder } = useApp();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'reminders'>('transactions');
  const [sendingId, setSendingId] = useState<string | null>(null);

  const activeCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerLedger = ledger
    .filter(entry => entry.customerId === selectedCustomerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const customerReminders = reminders
    .filter(r => r.customerId === selectedCustomerId)
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

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
    // Simulate API call delay
    setTimeout(() => {
      markReminderAsSent(reminder.id);
      setSendingId(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Customer Ledger</h2>
          <p className="text-slate-500">Manage account balances and schedule debt reminders.</p>
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
        {/* Customer Select Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" /> Find Account
            </label>
            <select 
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setActiveTab('transactions');
              }}
              className="w-full px-4 py-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Account</option>
              {customers.filter(c => c.totalOutstanding !== 0 || ledger.some(l => l.customerId === c.id)).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {activeCustomer && (
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xl space-y-4">
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Account Balance</p>
              <h4 className={`text-3xl font-bold ${activeCustomer.totalOutstanding > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                Rs. {activeCustomer.totalOutstanding.toLocaleString()}
              </h4>
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  {/* Fixed typo: changed स्मार्टफोन to Smartphone */}
                  <Smartphone className="w-4 h-4" /> {activeCustomer.phone}
                </p>
                <p className="text-sm text-slate-400 flex items-center gap-2 leading-tight">
                  <Calendar className="w-4 h-4" /> Member since {new Date().getFullYear()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 bg-white rounded-xl border shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          {!selectedCustomerId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
              <BookOpenText className="w-16 h-16 mb-4 opacity-10" />
              <h3 className="text-lg font-medium">No Account Selected</h3>
              <p className="max-w-xs mx-auto">Select a customer from the left to view their detailed transaction history and running balance.</p>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="flex border-b bg-slate-50 px-4">
                <button 
                  onClick={() => setActiveTab('transactions')}
                  className={`px-6 py-4 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'transactions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Transactions
                </button>
                <button 
                  onClick={() => setActiveTab('reminders')}
                  className={`px-6 py-4 text-sm font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'reminders' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Reminders 
                  {customerReminders.filter(r => r.status === 'pending').length > 0 && (
                    <span className="bg-amber-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{customerReminders.filter(r => r.status === 'pending').length}</span>
                  )}
                </button>
              </div>

              <div className="flex-1">
                {activeTab === 'transactions' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Details</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right text-rose-600">Debit (+)</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right text-emerald-600">Credit (-)</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Running Bal.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {customerLedger.map(entry => (
                          <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-600">{new Date(entry.date).toLocaleDateString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {entry.type === 'invoice' ? <ArrowUpCircle className="w-4 h-4 text-rose-500" /> : <ArrowDownCircle className="w-4 h-4 text-emerald-500" />}
                                <p className="font-medium text-slate-800">{entry.description}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-semibold text-slate-900">{entry.debit > 0 ? `Rs. ${entry.debit.toLocaleString()}` : '-'}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-semibold text-slate-900">{entry.credit > 0 ? `Rs. ${entry.credit.toLocaleString()}` : '-'}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`text-sm font-bold ${entry.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                Rs. {entry.balance.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {customerLedger.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-slate-400">No transactions recorded for this customer.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Payment Reminders</h4>
                      {activeCustomer && activeCustomer.totalOutstanding > 0 && (
                        <button 
                          onClick={() => setIsReminderModalOpen(true)}
                          className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Schedule New
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {customerReminders.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed">
                          <Clock className="w-10 h-10 mx-auto mb-2 opacity-10" />
                          <p className="text-sm">No reminders scheduled yet.</p>
                        </div>
                      ) : (
                        customerReminders.map(reminder => (
                          <div key={reminder.id} className="p-4 bg-white border rounded-2xl flex items-center justify-between hover:border-slate-300 transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${reminder.status === 'sent' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                                {reminder.status === 'sent' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{reminder.message}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  {reminder.status === 'sent' ? 'SENT ON ' : 'SCHEDULED FOR '}
                                  {new Date(reminder.scheduledDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {reminder.status === 'pending' && (
                                <button 
                                  disabled={sendingId === reminder.id}
                                  onClick={() => handleSendNow(reminder)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${sendingId === reminder.id ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}
                                >
                                  {sendingId === reminder.id ? (
                                    <>Sending...</>
                                  ) : (
                                    <><Send className="w-3 h-3" /> Send Now</>
                                  )}
                                </button>
                              )}
                              <button 
                                onClick={() => deleteReminder(reminder.id)}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
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

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b bg-emerald-50">
              <h3 className="text-xl font-bold text-emerald-800">Record Payment</h3>
              <p className="text-sm text-emerald-600">Receiving payment for {activeCustomer?.name}</p>
            </div>
            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount (Rs.)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  name="amount" 
                  max={activeCustomer?.totalOutstanding}
                  defaultValue={activeCustomer?.totalOutstanding} 
                  className="w-full px-4 py-3 text-2xl font-bold border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-600" 
                />
                <p className="text-xs text-slate-500 mt-1">Current Balance: Rs. {activeCustomer?.totalOutstanding.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                <select name="method" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea name="note" rows={2} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="p-8 border-b bg-amber-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-amber-900 tracking-tight">Schedule Reminder</h3>
                <button onClick={() => setIsReminderModalOpen(false)} className="p-2 hover:bg-amber-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-amber-900" />
                </button>
              </div>
              <p className="text-amber-700 font-medium">Automatic debt alert for {activeCustomer?.name}</p>
            </div>
            <form onSubmit={handleScheduleReminder} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Target Date
                </label>
                <input 
                  required 
                  type="date" 
                  name="date" 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-slate-800" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Communication Channel</label>
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-4 rounded-2xl border-2 border-blue-500 bg-blue-50 flex flex-col items-center gap-2">
                      <Smartphone className="w-6 h-6 text-blue-600" />
                      <span className="text-[10px] font-black uppercase text-blue-600">SMS / WhatsApp</span>
                   </div>
                   <div className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 flex flex-col items-center gap-2 opacity-40">
                      <Mail className="w-6 h-6 text-slate-400" />
                      <span className="text-[10px] font-black uppercase text-slate-400">Email</span>
                   </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alert Message</label>
                <textarea 
                  required 
                  name="message" 
                  rows={3} 
                  defaultValue={`Friendly reminder: Your outstanding balance with ${useApp().user?.shopName} is Rs. ${activeCustomer?.totalOutstanding.toLocaleString()}. Please clear it at your earliest convenience.`}
                  className="w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm font-medium leading-relaxed"
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Bell className="w-4 h-4" /> Finalize Reminder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;
