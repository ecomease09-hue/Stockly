
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  X,
  Package,
  Building2,
  QrCode,
  Loader2,
  Check,
  Smartphone,
  MapPin,
  StickyNote,
  Wallet,
  Eye,
  Hash,
  Download,
  CreditCard,
  Banknote,
  FileText,
  ShieldCheck,
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { InvoiceItem, PaymentType, Invoice } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Billing: React.FC = () => {
  const { products, customers, createInvoice, invoices, user, formatInvoiceNumber } = useApp();
  
  // UI State
  const [viewMode, setViewMode] = useState<'terminal' | 'invoice'>('terminal');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Cart State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [paymentType, setPaymentType] = useState<PaymentType>('cash');
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('Terms: Goods once sold are not returnable. Please clear dues within 15 days.');
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  // Sequence Override State
  const [isManualId, setIsManualId] = useState(false);
  const [customInvoiceId, setCustomInvoiceId] = useState('');

  // Calculations
  const subtotal = useMemo(() => selectedItems.reduce((sum, item) => sum + item.total, 0), [selectedItems]);
  const total = subtotal; 

  // Predictive Next ID calculation
  const nextProjectedId = useMemo(() => {
    let currentSeq = user?.nextInvoiceNumber || 1;
    let invoiceNumber = formatInvoiceNumber(currentSeq);
    while (invoices.some(i => i.invoiceNumber === invoiceNumber)) {
        currentSeq++;
        invoiceNumber = formatInvoiceNumber(currentSeq);
    }
    return invoiceNumber;
  }, [user?.nextInvoiceNumber, user?.invoicePrefix, user?.invoicePadding, invoices, formatInvoiceNumber]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sync paid amount for cash payments
  useEffect(() => {
    if (paymentType === 'cash') setPaidAmount(total);
  }, [paymentType, total]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const inBasket = selectedItems.find(i => i.productId === productId)?.quantity || 0;
    if (product.stockQuantity <= inBasket) {
      setToast({ message: `Insufficient Stock: Only ${product.stockQuantity} left.`, type: 'error' });
      return;
    }

    setSelectedItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.salePrice }
          : item
        );
      }
      return [...prev, {
        productId,
        productName: product.name,
        quantity: 1,
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        total: product.salePrice
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setSelectedItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty > product.stockQuantity) {
          setToast({ message: "Max available stock reached.", type: 'error' });
          return item;
        }
        return { ...item, quantity: newQty, total: newQty * item.salePrice };
      }
      return item;
    }).filter(i => i.quantity > 0));
  };

  const handleEnterInvoiceView = () => {
    if (!selectedCustomerId || selectedItems.length === 0) {
      setToast({ message: "Please select a customer and add items.", type: 'error' });
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    
    const invoiceNumber = isManualId && customInvoiceId 
        ? customInvoiceId 
        : nextProjectedId;

    // Verification if manual ID exists
    if (isManualId && invoices.some(i => i.invoiceNumber === customInvoiceId)) {
        setToast({ message: "Manual Invoice Number already exists in records.", type: 'error' });
        return;
    }

    const tempInvoice: Invoice = {
      id: 'preview',
      invoiceNumber,
      customerId: selectedCustomerId,
      customerName: customer?.name || 'Walk-in Customer',
      date: new Date().toISOString(),
      items: selectedItems,
      subtotal,
      tax: 0,
      discount: 0,
      total,
      paidAmount,
      paymentType,
      notes
    };

    setCurrentInvoice(tempInvoice);
    setViewMode('invoice');
  };

  const handleGenerateInvoice = async () => {
    if (isGenerating || !currentInvoice) return;
    setIsGenerating(true);

    try {
      const result = createInvoice({
        customerId: currentInvoice.customerId,
        customerName: currentInvoice.customerName,
        date: currentInvoice.date,
        items: currentInvoice.items,
        subtotal: currentInvoice.subtotal,
        tax: 0,
        discount: 0,
        total: currentInvoice.total,
        paidAmount: currentInvoice.paidAmount,
        paymentType: currentInvoice.paymentType,
        notes: currentInvoice.notes
      });

      setCurrentInvoice(result);
      setToast({ message: "Invoice Generated & Ledger Updated", type: 'success' });
    } catch (e) {
      setToast({ message: "Failed to generate invoice.", type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const element = document.getElementById('printable-invoice');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${currentInvoice?.invoiceNumber || 'Invoice'}.pdf`);
    } catch (error) {
      setToast({ message: "PDF Generation Failed", type: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  const resetBilling = () => {
    setSelectedItems([]);
    setSelectedCustomerId('');
    setCurrentInvoice(null);
    setViewMode('terminal');
    setCustomInvoiceId('');
    setIsManualId(false);
  };

  const RenderLogo = () => (
    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black overflow-hidden border-2 border-white shadow-lg">
      {user?.logoUrl ? <img src={user.logoUrl} className="w-full h-full object-contain" /> : <Building2 />}
    </div>
  );

  if (viewMode === 'invoice' && currentInvoice) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center pb-20 animate-in fade-in duration-500">
        <div className="w-full bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-50 no-print">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setViewMode('terminal')}
              className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Invoice Review</h2>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleDownloadPDF} 
              disabled={isDownloading}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              PDF
            </button>
            {currentInvoice.id === 'preview' ? (
              <button 
                onClick={handleGenerateInvoice}
                disabled={isGenerating}
                className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Generate & Save
              </button>
            ) : (
              <button 
                onClick={resetBilling}
                className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
              >
                <Plus className="w-4 h-4" /> New Billing
              </button>
            )}
          </div>
        </div>

        <div id="printable-invoice" className="invoice-container bg-white shadow-2xl w-full max-w-[21cm] mt-10 p-12 md:p-20 relative overflow-hidden">
          <div className="flex justify-between items-start mb-16">
            <div className="space-y-6">
              <RenderLogo />
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{user?.shopName}</h1>
                <div className="text-sm text-slate-500 font-medium mt-2 max-w-xs leading-relaxed">
                  <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {user?.address || 'N/A'}</p>
                  <p className="flex items-center gap-2 mt-1"><Smartphone className="w-3 h-3" /> {user?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-slate-900 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Invoice ID</p>
                <p className="text-2xl font-black font-mono">#{currentInvoice.invoiceNumber}</p>
              </div>
              <div className="mt-6 text-sm font-bold text-slate-500 space-y-1">
                <p>Issued: {new Date(currentInvoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p className="text-blue-600">Status: {currentInvoice.id === 'preview' ? 'Draft' : (currentInvoice.total > currentInvoice.paidAmount ? 'Partially Paid' : 'Settled')}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 mb-12 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Billed To</p>
              <h4 className="text-2xl font-black text-slate-900">{currentInvoice.customerName}</h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Terms</p>
              <span className="px-4 py-1.5 bg-white border rounded-full text-[10px] font-black text-blue-600 uppercase shadow-sm">
                {currentInvoice.paymentType === 'cash' ? 'On Receipt' : 'Credit Account'}
              </span>
            </div>
          </div>

          <table className="w-full text-left mb-16">
            <thead>
              <tr className="border-b-4 border-slate-900">
                <th className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Description</th>
                <th className="py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 w-24">Qty</th>
                <th className="py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 w-32">Unit Price</th>
                <th className="py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 pr-4 w-32">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentInvoice.items.map((item, idx) => (
                <tr key={idx} className="group">
                  <td className="py-8 pl-4 font-black text-slate-900 text-lg">{item.productName}</td>
                  <td className="py-8 text-center font-bold text-slate-600">{item.quantity}</td>
                  <td className="py-8 text-right font-bold text-slate-600">Rs. {item.salePrice.toLocaleString()}</td>
                  <td className="py-8 text-right font-black text-slate-900 pr-4">Rs. {item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-12 border-t-4 border-slate-900">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <StickyNote className="w-5 h-5 text-blue-600" />
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant Notes</h5>
              </div>
              <p className="text-sm font-bold text-slate-500 italic bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-slate-100 leading-relaxed">
                {currentInvoice.notes || 'Terms: Goods once sold are not returnable. Please clear dues within 15 days.'}
              </p>
            </div>
            <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                <span>Subtotal Value</span>
                <span>Rs. {currentInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/10 my-4"></div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Grand Total Amount</p>
                <p className="text-6xl font-black italic tracking-tighter">Rs. {currentInvoice.total.toLocaleString()}</p>
              </div>
              <div className="pt-6 border-t border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Recovered</span>
                  <span className="text-lg font-black">Rs. {currentInvoice.paidAmount.toLocaleString()}</span>
                </div>
                <div className={`flex justify-between items-center ${currentInvoice.total - currentInvoice.paidAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  <span className="text-[9px] font-black uppercase tracking-widest">Balance Due</span>
                  <span className="text-lg font-black">Rs. {(currentInvoice.total - currentInvoice.paidAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <div className={`fixed bottom-10 px-8 py-4 rounded-2xl shadow-2xl z-[100] animate-toast flex items-center gap-3 border ${toast.type === 'success' ? 'bg-emerald-900 text-emerald-100 border-emerald-500' : 'bg-rose-900 text-rose-100 border-rose-500'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm tracking-tight">{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Billing Terminal</h2>
          <p className="text-slate-500">Fast item dispatch with automated inventory sync.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border shadow-sm">
           <div className="flex flex-col text-right">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Projected Terminal ID</span>
              <span className="text-sm font-black text-blue-600 font-mono">#{nextProjectedId}</span>
           </div>
           <div className="w-px h-8 bg-slate-100"></div>
           <button 
            onClick={() => setIsManualId(!isManualId)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isManualId ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-400'}`}
           >
              {isManualId ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              Manual Mode
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Picker */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Scan or search SKU / Item Name..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredProducts.map(p => {
                const inBasket = selectedItems.find(i => i.productId === p.id)?.quantity || 0;
                const remaining = p.stockQuantity - inBasket;
                const isOutOfStock = remaining <= 0;

                return (
                  <button 
                    key={p.id} 
                    onClick={() => addItem(p.id)}
                    disabled={isOutOfStock}
                    className={`flex items-center justify-between p-4 border rounded-2xl text-left transition-all relative overflow-hidden group ${isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed bg-slate-50' : 'hover:border-blue-500 bg-white active:scale-95'}`}
                  >
                    <div className="min-w-0">
                      <p className="font-black text-slate-800 truncate leading-tight">{p.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-blue-600 uppercase">Rs. {p.salePrice}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${remaining <= 5 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                          {remaining} Stock
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Plus className="w-5 h-5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden flex flex-col min-h-[300px]">
            <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" /> Active Cart
              </h3>
              <span className="px-3 py-1 bg-white border rounded-full text-[10px] font-black text-slate-400">
                {selectedItems.length} Entries
              </span>
            </div>
            <div className="divide-y overflow-y-auto max-h-[400px] custom-scrollbar">
              {selectedItems.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center gap-4 text-slate-300">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
                    <Package />
                  </div>
                  <p className="font-black text-xs uppercase tracking-widest">Cart is empty</p>
                </div>
              ) : (
                selectedItems.map(item => (
                  <div key={item.productId} className="flex items-center justify-between p-6 bg-white animate-in fade-in duration-300">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-lg leading-tight truncate">{item.productName}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Rs. {item.salePrice}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 bg-slate-50 border rounded-2xl p-1 shadow-inner">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><Minus className="w-3 h-3" /></button>
                        <span className="w-10 text-center font-black text-slate-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><Plus className="w-3 h-3" /></button>
                      </div>
                      <div className="w-24 text-right">
                        <p className="font-black text-slate-900">Rs. {item.total.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Settlement Panel */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8 sticky top-6">
             {isManualId && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                   <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <Hash className="w-3 h-3" /> Manual Invoice ID
                   </label>
                   <input 
                     type="text" 
                     placeholder="Enter manual reference..."
                     className="w-full px-5 py-4 border-2 rounded-2xl bg-amber-50 font-mono font-black text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none border-amber-100"
                     value={customInvoiceId}
                     onChange={(e) => setCustomInvoiceId(e.target.value)}
                   />
                </div>
             )}

             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Eye className="w-3 h-3" /> Select Account
                </label>
                <select 
                  value={selectedCustomerId} 
                  onChange={(e) => setSelectedCustomerId(e.target.value)} 
                  className="w-full px-5 py-4 border-2 rounded-2xl bg-slate-50 font-black text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer border-slate-100 transition-all"
                >
                  <option value="">Choose Customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
             </div>

             <div className="p-6 bg-blue-50/50 rounded-[2rem] border-2 border-blue-100/50 space-y-6">
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Settlement Option</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => setPaymentType('cash')} className={`flex flex-col items-center gap-2 py-5 rounded-2xl border-2 transition-all ${paymentType === 'cash' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'}`}>
                      <Banknote className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase">Direct</span>
                   </button>
                   <button onClick={() => setPaymentType('credit')} className={`flex flex-col items-center gap-2 py-5 rounded-2xl border-2 transition-all ${paymentType === 'credit' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'}`}>
                      <CreditCard className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase">Credit</span>
                   </button>
                </div>
                {paymentType === 'credit' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                     <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Paid Amount (Rs.)</label>
                     <input 
                      type="number" 
                      max={total}
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Math.min(total, parseFloat(e.target.value) || 0))}
                      className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
             </div>

             <div className="space-y-4">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <StickyNote className="w-3 h-3" /> Billing Notes
               </label>
               <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none text-xs leading-relaxed"
               />
             </div>

             <div className="pt-6 border-t-2 border-dashed border-slate-100 space-y-4">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Grand Total</span>
                   <span className="text-4xl font-black text-slate-900 italic tracking-tighter">Rs. {total.toLocaleString()}</span>
                </div>
                <button 
                  onClick={handleEnterInvoiceView}
                  className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                   <FileText className="w-4 h-4" /> Review Full Invoice
                </button>
             </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-toast border ${toast.type === 'success' ? 'bg-emerald-900 text-emerald-100 border-emerald-500' : 'bg-rose-900 text-rose-100 border-rose-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span className="font-bold text-sm tracking-tight">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Billing;
