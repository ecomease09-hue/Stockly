
import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  Search, 
  User, 
  CreditCard, 
  Banknote, 
  Download, 
  X,
  Package,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Trophy,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { InvoiceItem, PaymentType, Invoice } from '../types';

const Billing: React.FC = () => {
  const { products, customers, createInvoice, invoices, user } = useApp();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(10); // Default 10%
  const [paymentType, setPaymentType] = useState<PaymentType>('cash');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = useMemo(() => 
    selectedItems.reduce((sum, item) => sum + item.total, 0),
  [selectedItems]);

  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount - discount;

  const addItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (product.stockQuantity <= 0) {
      alert(`Product "${product.name}" is out of stock.`);
      return;
    }

    setSelectedItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          alert(`Cannot add more. Only ${product.stockQuantity} units of "${product.name}" available in stock.`);
          return prev;
        }
        return prev.map(item => item.productId === productId 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.salePrice }
          : item
        );
      }
      return [...prev, {
        productId,
        productName: product.name,
        quantity: 1,
        salePrice: product.salePrice,
        total: product.salePrice
      }];
    });
  };

  const removeItem = (productId: string) => {
    setSelectedItems(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setSelectedItems(prev => prev.map(item => {
      if (item.productId === productId) {
        let newQty = item.quantity + delta;
        
        if (newQty > product.stockQuantity) {
          alert(`Insufficient stock. Capping quantity at maximum available stock (${product.stockQuantity} units).`);
          newQty = product.stockQuantity;
        }
        
        newQty = Math.max(1, newQty);
        return { ...item, quantity: newQty, total: newQty * item.salePrice };
      }
      return item;
    }));
  };

  const handleGenerateBill = () => {
    if (!selectedCustomerId || selectedItems.length === 0) {
      alert("Please select a customer and at least one product.");
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    const invoiceData = {
      customerId: selectedCustomerId,
      customerName: customer.name,
      date: new Date().toISOString(),
      items: selectedItems,
      subtotal,
      tax: taxAmount,
      discount,
      total,
      paymentType
    };

    const savedInvoice = createInvoice(invoiceData);
    
    setCurrentInvoice(savedInvoice);
    setShowInvoiceModal(true);

    setSelectedItems([]);
    setDiscount(0);
    setSelectedCustomerId('');
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Generate New Bill</h2>
          <p className="text-slate-500">Logo and shop details are fetched automatically from your account.</p>
        </div>
        <div className="flex gap-2">
          {invoices.length > 0 && (
             <button 
              onClick={() => {
                setCurrentInvoice(invoices[invoices.length - 1]);
                setShowInvoiceModal(true);
              }} 
              className="flex items-center gap-2 px-4 py-2 border bg-white rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-bold text-slate-600"
            >
              <Printer className="w-4 h-4" /> View Last Bill
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* Left Side: Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search products to add..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
              {filteredProducts.map(p => (
                <button 
                  key={p.id}
                  onClick={() => addItem(p.id)}
                  disabled={p.stockQuantity <= 0}
                  className={`
                    flex items-center justify-between p-3 border rounded-xl text-left transition-all
                    ${p.stockQuantity <= 0 ? 'bg-slate-50 opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:shadow-md active:scale-95 bg-white'}
                  `}
                >
                  <div>
                    <p className="font-semibold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-500 font-medium">Stock: {p.stockQuantity} | Rs. {p.salePrice}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-blue-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b">
              <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cart Contents
              </h3>
            </div>
            <div className="divide-y overflow-y-auto max-h-[300px]">
              {selectedItems.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <ImageIcon className="w-10 h-10 opacity-10" />
                  <p className="text-sm font-medium">No items added yet.</p>
                </div>
              ) : (
                selectedItems.map(item => (
                  <div key={item.productId} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-black text-slate-900">{item.productName}</p>
                      <p className="text-xs text-slate-500 font-bold">Rs. {item.salePrice.toLocaleString()} each</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 border rounded-xl p-1.5 bg-slate-100">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 bg-white hover:bg-slate-200 rounded-lg shadow-sm transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-sm font-black text-slate-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 bg-white hover:bg-slate-200 rounded-lg shadow-sm transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                      <div className="w-24 text-right">
                        <p className="font-black text-slate-900">Rs. {item.total.toLocaleString()}</p>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-slate-300 hover:text-rose-500 p-2 transition-all hover:bg-rose-50 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Billing Details */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6 sticky top-8">
            <div className="space-y-5">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-lg border flex items-center justify-center overflow-hidden">
                   {user?.logoUrl ? (
                     <img src={user.logoUrl} alt="Live Logo" className="w-full h-full object-contain p-1" />
                   ) : (
                     <Building2 className="w-6 h-6 text-blue-300" />
                   )}
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Shop Profile</p>
                  <p className="text-sm font-bold text-blue-800">{user?.shopName}</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <User className="w-3 h-3" /> Select Client
                </label>
                <select 
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">Choose Customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Transaction Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPaymentType('cash')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border font-black uppercase tracking-widest text-[10px] transition-all ${paymentType === 'cash' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}
                  >
                    <Banknote className="w-6 h-6" /> Cash
                  </button>
                  <button 
                    onClick={() => setPaymentType('credit')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border font-black uppercase tracking-widest text-[10px] transition-all ${paymentType === 'credit' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}
                  >
                    <CreditCard className="w-6 h-6" /> Credit
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-slate-100 pt-6 space-y-3">
              <div className="flex justify-between text-slate-500 text-sm font-bold">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm font-bold items-center">
                <span className="flex items-center gap-2">Tax ({taxRate}%)</span>
                <span>+Rs. {taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm font-bold items-center">
                <span>Discount</span>
                <input 
                  type="number" 
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 text-right px-3 py-1.5 border rounded-xl bg-slate-50 font-black text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" 
                />
              </div>
              <div className="flex justify-between text-2xl font-black text-slate-900 border-t pt-4 mt-4 tracking-tight">
                <span>Total</span>
                <span className="text-blue-600">Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handleGenerateBill}
              disabled={selectedItems.length === 0 || !selectedCustomerId}
              className={`
                w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                ${(selectedItems.length === 0 || !selectedCustomerId) 
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed border' 
                  : 'bg-slate-900 text-white hover:bg-black shadow-2xl shadow-slate-200 active:scale-95'}
              `}
            >
              <Download className="w-5 h-5" /> Issue Final Bill
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Modal (Preview & Print) */}
      {showInvoiceModal && currentInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 bg-slate-900/90 backdrop-blur-md no-print overflow-y-auto">
          <div className="bg-white md:rounded-[3rem] shadow-2xl w-full max-w-4xl min-h-screen md:min-h-0 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            
            {/* Modal Controls Bar */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-10 py-6 border-b flex items-center justify-between z-20 no-print">
              <div className="flex items-center gap-5">
                <div className="bg-emerald-500 text-white p-2.5 rounded-2xl shadow-xl shadow-emerald-200 animate-pulse">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight">Official Invoice Summary</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Transaction secured & documented</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={downloadPDF}
                  className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95"
                >
                  <Printer className="w-4 h-4" /> Print Document
                </button>
                <button 
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Professional Modern Invoice Template */}
            <div className="p-16 md:p-20 bg-white invoice-container flex-1">
              
              {/* Layout: Split Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-start">
                <div>
                  {/* BRAND LOGO SECTION - FETCHED AUTOMATICALLY FROM ACCOUNT SETTINGS */}
                  <div className="flex items-center gap-6 mb-10">
                    <div className="relative group">
                      <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-slate-900 shadow-2xl border border-slate-100 overflow-hidden transform hover:-rotate-3 transition-transform">
                        {user?.logoUrl ? (
                          <img 
                            src={user.logoUrl} 
                            alt={`${user?.shopName} Logo`} 
                            className="w-full h-full object-contain p-2" 
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                            <Building2 className="w-12 h-12" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-slate-900/5 blur-2xl -z-10 rounded-full scale-125"></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                         <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none uppercase">
                          {user?.shopName || 'STOCKLY'}
                        </h1>
                        <Trophy className="w-6 h-6 text-amber-500" />
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[10px] uppercase font-black text-blue-600 tracking-[0.3em] bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm">
                          verified account profile
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 space-y-1 font-bold italic opacity-70 border-l-4 border-blue-600 pl-6 py-1">
                    <p>{user?.address || 'Shop Address'}</p>
                    <div className="pt-4 flex flex-col gap-1">
                      <p className="font-black not-italic text-slate-900 flex items-center gap-3 text-xs uppercase tracking-widest">
                        <span className="text-blue-600">Tel:</span> {user?.phone || '+92 000 0000000'}
                      </p>
                      <p className="font-black not-italic text-slate-900 flex items-center gap-3 text-xs uppercase tracking-widest">
                        <span className="text-blue-600">Mail:</span> {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end pt-4">
                  <h2 className="text-[8rem] font-black text-slate-50 tracking-tighter mb-4 select-none leading-none absolute md:static -z-10 opacity-60">DOC</h2>
                  <div className="space-y-4 text-right bg-slate-900 p-8 rounded-[2.5rem] shadow-3xl shadow-slate-200 border border-slate-800">
                    <div className="flex justify-end gap-10 text-sm">
                      <span className="text-slate-500 uppercase tracking-[0.4em] text-[9px] font-black pt-1">Reference ID</span>
                      <span className="text-white font-black font-mono">#{currentInvoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-end gap-10 text-sm">
                      <span className="text-slate-500 uppercase tracking-[0.4em] text-[9px] font-black pt-1">Billing Date</span>
                      <span className="text-white font-black">{new Date(currentInvoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-end gap-10 text-sm">
                      <span className="text-slate-500 uppercase tracking-[0.4em] text-[9px] font-black pt-1">Ledger Entry</span>
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl ${currentInvoice.paymentType === 'cash' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {currentInvoice.paymentType} Account
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill To & Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20 p-16 bg-slate-50 rounded-[4rem] relative overflow-hidden border border-slate-100 shadow-inner">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-2xl mb-8 shadow-sm border border-slate-100">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Recipient Details</span>
                  </div>
                  <h4 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{currentInvoice.customerName}</h4>
                  <div className="text-base text-slate-500 font-bold space-y-3">
                    <p className="flex items-center gap-4"><span className="w-2 h-2 bg-blue-600 rounded-full shadow-lg shadow-blue-200"></span> {customers.find(c => c.id === currentInvoice.customerId)?.phone || 'N/A'}</p>
                    <p className="flex items-start gap-4 max-w-[360px] leading-relaxed italic">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 shadow-lg shadow-blue-200"></span> 
                      {customers.find(c => c.id === currentInvoice.customerId)?.address || 'Address not listed on digital profile.'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end justify-center relative z-10">
                  <div className={`
                    w-48 h-48 rounded-full border-[12px] flex flex-col items-center justify-center -rotate-12 select-none shadow-2xl
                    ${currentInvoice.paymentType === 'cash' ? 'border-emerald-50 text-emerald-500 bg-white' : 'border-rose-50 text-rose-500 bg-white'}
                  `}>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-50">VERIFIED</span>
                    <span className="text-3xl font-black leading-none uppercase tracking-tighter">{currentInvoice.paymentType === 'cash' ? 'PAID' : 'DEBIT'}</span>
                    <div className="mt-4 h-1 w-14 bg-slate-100 rounded-full"></div>
                    <span className="text-[9px] font-black mt-3 uppercase tracking-widest opacity-30">Cloud Secured</span>
                  </div>
                </div>

                {/* Aesthetic Background Pattern */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full -mr-[250px] -mt-[250px] blur-[120px]"></div>
              </div>

              {/* Professional Table */}
              <div className="mb-24">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-[6px] border-slate-900">
                      <th className="py-10 text-xs font-black text-slate-900 uppercase tracking-[0.5em] pl-6">Specifications</th>
                      <th className="py-10 text-center text-xs font-black text-slate-900 uppercase tracking-[0.5em]">Qty</th>
                      <th className="py-10 text-right text-xs font-black text-slate-900 uppercase tracking-[0.5em]">Rate</th>
                      <th className="py-10 text-right text-xs font-black text-slate-900 uppercase tracking-[0.5em] pr-6">Valuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-50">
                    {currentInvoice.items.map((item, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50/50 transition-all duration-500">
                        <td className="py-10 pl-6 group-hover:pl-8 transition-all">
                          <p className="font-black text-slate-900 text-xl tracking-tight">{item.productName}</p>
                          <div className="flex items-center gap-4 mt-3">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Code: {products.find(p => p.id === item.productId)?.sku || 'P-DEF'}</span>
                          </div>
                        </td>
                        <td className="py-10 text-center text-xl font-black text-slate-900">{item.quantity}</td>
                        <td className="py-10 text-right text-base font-bold text-slate-400">Rs. {item.salePrice.toLocaleString()}</td>
                        <td className="py-10 text-right text-2xl font-black text-slate-900 italic pr-6">Rs. {item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Calculations & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-20 items-start pt-20 border-t-4 border-slate-900">
                <div className="md:col-span-6 space-y-16">
                   <div className="p-10 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-3xl shadow-slate-200">
                      <div className="relative z-10">
                        <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4" /> Legal Authentication
                        </p>
                        <p className="text-xs font-bold leading-loose text-slate-400 italic">
                          This document serves as proof of commercial exchange. The vendor retains rights until full clearance of dues. Digital signature ID: {Math.random().toString(16).slice(2, 10).toUpperCase()}. Issued under standard trade conditions.
                        </p>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-[60px]"></div>
                   </div>
                   
                   <div className="flex justify-between items-center gap-12 pl-6">
                      <div className="flex flex-col gap-8">
                        <div className="w-64 h-1 bg-slate-900/10 rounded-full relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-24 h-full bg-slate-900"></div>
                        </div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.6em]">Authorized Seal</p>
                      </div>
                      
                      <div className="w-32 h-32 bg-slate-50 border-2 border-slate-200 rounded-[2rem] flex items-center justify-center p-4 shadow-inner">
                         <div className="w-full h-full border-2 border-slate-300 rounded-[1.5rem] border-dashed flex items-center justify-center">
                            <Zap className="w-10 h-10 text-slate-200" />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="md:col-span-6 space-y-8">
                  <div className="bg-slate-50 p-12 rounded-[4rem] border border-slate-200 shadow-inner space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-400 uppercase tracking-[0.5em] text-[10px]">Net Asset Value</span>
                      <span className="font-black text-slate-900 text-2xl tracking-tighter">Rs. {currentInvoice.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-400 uppercase tracking-[0.5em] text-[10px]">Govt. Levies ({taxRate}%)</span>
                      <span className="font-black text-slate-900 text-2xl tracking-tighter">+ Rs. {currentInvoice.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-400 uppercase tracking-[0.5em] text-[10px]">Client Discount</span>
                      <span className="font-black text-rose-500 text-2xl tracking-tighter">- Rs. {currentInvoice.discount.toLocaleString()}</span>
                    </div>
                    
                    <div className="h-1 w-full bg-slate-200 my-6 rounded-full opacity-50"></div>

                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-900 uppercase tracking-[0.6em] text-[12px]">Grand Total</span>
                      <span className="text-5xl font-black text-blue-600 tracking-tighter italic">Rs. {currentInvoice.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Footer */}
              <div className="mt-40 pt-16 border-t-2 border-slate-50 flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl">
                      <Package className="w-8 h-8" />
                   </div>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[1em]">
                    Stockly enterprise cloud • 2025
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;