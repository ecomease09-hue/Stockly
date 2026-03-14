
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Plus, Search, User, Phone, MapPin, History, ChevronRight, CreditCard, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Customer } from '../types';

const Customers: React.FC = () => {
  const { customers, invoices, addCustomer, ledger, addPayment, payments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [viewingHistory, setViewingHistory] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleAddCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addCustomer({
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
    });
    setIsModalOpen(false);
  };

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!viewingHistory) return;
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    if (isNaN(amount) || amount <= 0) return;

    const currentBalance = getCustomerBalance(viewingHistory.id);
    if (amount > currentBalance) {
      alert("Payment cannot exceed outstanding balance.");
      return;
    }

    addPayment({
      customerId: viewingHistory.id,
      amount,
      method: formData.get('method') as string,
      date: new Date().toISOString(),
    });
    
    // Update the viewing history to reflect the new balance
    const updatedCustomer = customers.find(c => c.id === viewingHistory.id);
    if (updatedCustomer) {
      setViewingHistory({ ...updatedCustomer, totalOutstanding: currentBalance - amount });
    }
    
    setIsPaymentModalOpen(false);
  };

  const getCustomerLedger = (customerId: string) => {
    return ledger.filter(entry => entry.customerId === customerId).reverse().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getCustomerBalance = (customerId: string) => {
    const customerLedger = getCustomerLedger(customerId);
    if (customerLedger.length > 0) {
      return customerLedger[0].balance;
    }
    const customer = customers.find(c => c.id === customerId);
    return customer?.totalOutstanding || 0;
  };

  const getCustomerStats = (customerId: string) => {
    const customerInvoices = invoices.filter(inv => inv.customerId === customerId);
    const totalCreditSales = customerInvoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);
    
    const customerPayments = payments.filter(pay => pay.customerId === customerId);
    const totalPaymentsReceived = customerPayments.reduce((sum, pay) => sum + pay.amount, 0);
    
    const netOutstanding = totalCreditSales - totalPaymentsReceived;
    
    return { totalPurchases: totalCreditSales, totalPayments: totalPaymentsReceived, netOutstanding };
  };

  const getCombinedLedger = (customerId: string) => {
    const customerLedger = getCustomerLedger(customerId);
    const combined: any[] = [];
    
    for (let i = 0; i < customerLedger.length; i++) {
      const entry = customerLedger[i];
      
      if (entry.type === 'payment') {
        if (i + 1 < customerLedger.length && customerLedger[i+1].type === 'invoice' && customerLedger[i+1].refId === entry.refId) {
          const invoiceEntry = customerLedger[i+1];
          combined.push({
            id: invoiceEntry.id,
            date: invoiceEntry.date,
            description: invoiceEntry.description,
            billAmount: invoiceEntry.debit,
            cashPaid: entry.credit,
            creditAmount: invoiceEntry.debit - entry.credit,
            paymentReceived: 0,
            balance: entry.balance,
            isInvoice: true
          });
          i++;
        } else {
          combined.push({
            id: entry.id,
            date: entry.date,
            description: entry.description,
            billAmount: 0,
            cashPaid: 0,
            creditAmount: 0,
            paymentReceived: entry.credit,
            balance: entry.balance,
            isInvoice: false
          });
        }
      } else if (entry.type === 'invoice') {
        combined.push({
          id: entry.id,
          date: entry.date,
          description: entry.description,
          billAmount: entry.debit,
          cashPaid: 0,
          creditAmount: entry.debit,
          paymentReceived: 0,
          balance: entry.balance,
          isInvoice: true
        });
      }
    }
    
    return combined;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Customer Management</h2>
          <p className="text-slate-500">Track purchase history and outstanding balances.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5" /> New Customer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              className="w-full pl-10 pr-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCustomers.map(customer => (
              <div 
                key={customer.id} 
                className="bg-white p-4 rounded-xl border shadow-sm hover:border-blue-500 transition-colors cursor-pointer group"
                onClick={() => setViewingHistory(customer)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{customer.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {customer.phone}
                    </p>
                  </div>
                  <ChevronRight className="ml-auto w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs font-medium text-slate-400 uppercase">Outstanding</span>
                  <span className={`text-sm font-bold ${getCustomerBalance(customer.id) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    Rs. {getCustomerBalance(customer.id).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History View */}
        <div className="bg-white rounded-xl border shadow-sm flex flex-col h-[calc(100vh-16rem)] min-h-[500px]">
          {viewingHistory ? (
            <>
              <div className="p-6 border-b bg-slate-50">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                      <User className="w-6 h-6 text-blue-500" /> {viewingHistory.name}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4" /> {viewingHistory.phone}
                    </p>
                  </div>
                  {getCustomerBalance(viewingHistory.id) > 0 && (
                    <button 
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                    >
                      <CreditCard className="w-5 h-5" /> Receive Payment
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Credit</p>
                    <p className="text-xl font-black text-slate-800">Rs. {getCustomerStats(viewingHistory.id).totalPurchases.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Paid</p>
                    <p className="text-xl font-black text-emerald-600">Rs. {getCustomerStats(viewingHistory.id).totalPayments.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Outstanding Balance</p>
                    <p className={`text-xl font-black ${getCustomerBalance(viewingHistory.id) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      Rs. {getCustomerBalance(viewingHistory.id).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {getCustomerLedger(viewingHistory.id).length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    No transactions recorded yet.
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 sticky top-0 border-b z-10">
                        <tr>
                          <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                          <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Bill Amount</th>
                          <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Cash Paid</th>
                          <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Credit Amount</th>
                          <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Payment Received</th>
                          <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {getCombinedLedger(viewingHistory.id).map(entry => (
                          <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 text-sm text-slate-600 whitespace-nowrap">
                              {new Date(entry.date).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-sm font-medium text-slate-900">
                              <div className="flex items-center gap-2">
                                {entry.isInvoice ? <ArrowUpRight className="w-4 h-4 text-rose-500" /> : <ArrowDownRight className="w-4 h-4 text-emerald-500" />}
                                {entry.description}
                              </div>
                            </td>
                            <td className="p-3 text-sm text-slate-700 text-right font-medium">
                              {entry.billAmount > 0 ? entry.billAmount.toLocaleString() : '-'}
                            </td>
                            <td className="p-3 text-sm text-emerald-600 text-right font-medium">
                              {entry.cashPaid > 0 ? entry.cashPaid.toLocaleString() : '-'}
                            </td>
                            <td className="p-3 text-sm text-rose-600 text-right font-medium">
                              {entry.creditAmount > 0 ? entry.creditAmount.toLocaleString() : '-'}
                            </td>
                            <td className="p-3 text-sm text-emerald-600 text-right font-medium">
                              {entry.paymentReceived > 0 ? entry.paymentReceived.toLocaleString() : '-'}
                            </td>
                            <td className="p-3 text-sm font-bold text-slate-700 text-right">
                              {entry.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <User className="w-12 h-12 mb-4 opacity-10" />
              <p>Select a customer to view their ledger account and credit history.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Add New Customer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required name="name" placeholder="Enter customer name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input required name="phone" placeholder="+92 300 0000000" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Home Address</label>
                <textarea name="address" rows={3} placeholder="Enter full address" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Add Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && viewingHistory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Receive Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg mb-4 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Current Outstanding:</span>
                <span className="text-lg font-bold text-rose-600">Rs. {getCustomerBalance(viewingHistory.id).toLocaleString()}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount (Rs.)</label>
                <input 
                  required 
                  name="amount" 
                  type="number" 
                  max={getCustomerBalance(viewingHistory.id)}
                  step="0.01"
                  placeholder="Enter amount" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                <select name="method" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default Customers;
