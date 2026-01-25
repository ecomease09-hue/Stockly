
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Plus, Search, User, Phone, MapPin, History, ChevronRight } from 'lucide-react';
import { Customer } from '../types';

const Customers: React.FC = () => {
  const { customers, invoices, addCustomer } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const getCustomerInvoices = (customerId: string) => {
    return invoices.filter(inv => inv.customerId === customerId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
                  <span className={`text-sm font-bold ${customer.totalOutstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    Rs. {customer.totalOutstanding.toLocaleString()}
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
              <div className="p-4 border-b bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-500" /> Purchase History
                </h3>
                <p className="text-sm text-slate-500">{viewingHistory.name}</p>
              </div>
              <div className="flex-1 overflow-y-auto divide-y">
                {getCustomerInvoices(viewingHistory.id).length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    No purchases recorded yet.
                  </div>
                ) : (
                  getCustomerInvoices(viewingHistory.id).map(inv => (
                    <div key={inv.id} className="p-4 hover:bg-slate-50">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-slate-900">{inv.invoiceNumber}</span>
                        <span className="text-sm font-bold text-blue-600">Rs. {inv.total}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{new Date(inv.date).toLocaleDateString()}</span>
                        <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100">{inv.paymentType}</span>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-400 italic">
                        {inv.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <User className="w-12 h-12 mb-4 opacity-10" />
              <p>Select a customer to view their purchase details and credit history.</p>
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
    </div>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default Customers;
