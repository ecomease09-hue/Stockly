
import React, { useState, useMemo, useEffect } from 'react';
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
  Image as ImageIcon,
  QrCode,
  Loader2,
  Check,
  MapPin,
  Phone,
  StickyNote,
  Wallet,
  Eye,
  FileText,
  Palette,
  Layout as LayoutIcon,
  ChevronRight,
  Hash,
  ArrowLeft,
  History,
  ReceiptText,
  Signature,
  FileDown,
  Clock,
  Calendar,
  Tag,
  Type,
  Coins,
  ChevronLeft
} from 'lucide-react';
import { InvoiceItem, PaymentType, Invoice } from '../types';

type TemplateType = 'standard' | 'minimal' | 'elegant';

interface InvoiceSettings {
  template: TemplateType;
  primaryColor: string;
  fontSize: 'sm' | 'base' | 'lg';
}

const Billing: React.FC = () => {
  const { products, customers, createInvoice, invoices, user, updateUser } = useApp();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentType, setPaymentType] = useState<PaymentType>('cash');
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('Terms: Goods once sold are not returnable. Please clear dues within 15 days.');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [shouldAnimateBadge, setShouldAnimateBadge] = useState(false);
  const [totalBump, setTotalBump] = useState(false);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  
  const [settings] = useState<InvoiceSettings>({
    template: 'standard',
    primaryColor: user?.primaryColor || '#2563eb', 
    fontSize: 'base'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedItems.length > 0) {
      setShouldAnimateBadge(true);
      setTotalBump(true);
      const timer = setTimeout(() => {
        setShouldAnimateBadge(false);
        setTotalBump(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedItems]);

  const subtotal = useMemo(() => 
    selectedItems.reduce((sum, item) => sum + item.total, 0),
  [selectedItems]);

  const total = subtotal - discount;

  const nextInvoicePreview = useMemo(() => {
    const prefix = user?.invoicePrefix || 'INV';
    const num = user?.nextInvoiceNumber || 1;
    return `${prefix}-${num.toString().padStart(5, '0')}`;
  }, [user?.invoicePrefix, user?.nextInvoiceNumber]);

  useEffect(() => {
    if (paymentType === 'cash') {
      setPaidAmount(total);
    } else {
      setPaidAmount(prev => Math.min(prev, total));
    }
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
      setToast({ message: `Stock Error: Only ${product.stockQuantity} items left.`, type: 'error' });
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

    setLastAddedId(productId);
    setTimeout(() => setLastAddedId(null), 1000);
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
          setToast({ message: `Max stock reached (${product.stockQuantity}).`, type: 'error' });
          newQty = product.stockQuantity;
        }
        newQty = Math.max(1, newQty);
        return { ...item, quantity: newQty, total: newQty * item.salePrice };
      }
      return item;
    }));
  };

  const handlePreview = () => {
    if (!selectedCustomerId || selectedItems.length === 0) {
      setToast({ message: "Missing Customer or Items.", type: 'error' });
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    const prefix = user?.invoicePrefix || 'INV';
    const nextNum = user?.nextInvoiceNumber || 1;

    const selectedDateObj = new Date(transactionDate);
    const now = new Date();
    selectedDateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const previewInvoice: Invoice = {
      id: 'preview',
      invoiceNumber: `${prefix}-${nextNum.toString().padStart(5, '0')}`,
      customerId: selectedCustomerId,
      customerName: customer.name,
      date: selectedDateObj.toISOString(),
      items: selectedItems,
      subtotal,
      tax: 0,
      discount,
      total,
      paidAmount: paidAmount,
      paymentType,
      notes
    };

    setCurrentInvoice(previewInvoice);
    setIsPreviewMode(true);
    setShowInvoiceModal(true);
  };

  const handleConfirmIssue = () => {
    if (!currentInvoice || isGenerating) return;

    for (const item of currentInvoice.items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod || prod.stockQuantity < item.quantity) {
        setToast({ 
          message: `Inventory Alert: ${item.productName} is now out of stock.`, 
          type: 'error' 
        });
        return;
      }
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const invoiceData = {
        customerId: currentInvoice.customerId,
        customerName: currentInvoice.customerName,
        date: currentInvoice.date,
        items: currentInvoice.items,
        subtotal: currentInvoice.subtotal,
        tax: 0,
        discount: currentInvoice.discount,
        total: currentInvoice.total,
        paidAmount: currentInvoice.paidAmount,
        paymentType: currentInvoice.paymentType,
        notes: currentInvoice.notes
      };

      const realInvoice = createInvoice(invoiceData);
      
      setSelectedItems([]);
      setDiscount(0);
      setPaidAmount(0);
      setSelectedCustomerId('');
      
      setCurrentInvoice(realInvoice);
      setIsPreviewMode(false);
      setIsGenerating(false);
      
      setToast({ message: "OK: Transaction Finalized. Inventory Deducted.", type: 'success' });
    }, 600); 
  };

  const handleCloseModal = () => {
    setShowInvoiceModal(false);
    setIsPreviewMode(false);
    setCurrentInvoice(null);
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'sm': return 'text-[0.75rem]';
      case 'lg': return 'text-[1.125rem]';
      default: return 'text-[1rem]';
    }
  };

  const RenderLogo = ({ size = "w-24 h-24", iconSize = "w-10 h-10" }: { size?: string, iconSize?: string }) => {
    if (user?.logoUrl) {
      return (
        <div className={`${size} bg-white rounded-3xl flex items-center justify-center overflow-hidden shadow-sm`}>
          <img src={user.logoUrl} alt="Seller Logo" className="w-full h-full object-contain p-2" />
        </div>
      );
    }
    return (
      <div className={`${size} bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white font-black shadow-xl`}>
        <Building2 className={iconSize} />
        <span className="text-[8px] mt-1 tracking-widest uppercase opacity-40">Shop</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-toast border backdrop-blur-md ${toast.type === 'success' ? 'bg-emerald-900/90 text-white border-emerald-500' : 'bg-rose-900/90 text-white border-rose-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-rose-400" />}
          <span className="font-bold text-sm tracking-tight">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <ReceiptText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Billing Terminal</h2>
            <p className="text-slate-500 text-sm">Real-time inventory deduction on issuance.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {invoices.length > 0 && (
             <button onClick={() => { setCurrentInvoice(invoices[invoices.length - 1]); setIsPreviewMode(false); setShowInvoiceModal(true); }} className="flex items-center gap-2 px-5 py-2.5 border bg-white rounded-xl hover:bg-slate-50 transition-all shadow-sm font-bold text-slate-600 active:scale-95">
              <History className="w-4 h-4" /> Last Receipt
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* SKU Selector */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border shadow-sm space-y-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Scan or Search SKU..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredProducts.map(p => {
                const inBasket = selectedItems.find(i => i.productId === p.id)?.quantity || 0;
                const remaining = p.stockQuantity - inBasket;
                const isOutOfStock = remaining <= 0;

                return (
                  <button 
                    key={p.id} 
                    onClick={() => addItem(p.id)} 
                    disabled={isOutOfStock} 
                    className={`flex items-center justify-between p-4 border rounded-2xl text-left transition-all relative overflow-hidden group ${isOutOfStock ? 'bg-slate-50 opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:shadow-xl active:scale-95 bg-white border-slate-100'} ${lastAddedId === p.id ? 'ring-2 ring-emerald-500 ring-offset-2 scale-[1.02] shadow-emerald-50' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 truncate group-hover:text-blue-600 transition-colors">{p.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Rs. {p.salePrice}</span>
                        <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${remaining <= 5 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                          {remaining} In Stock
                        </div>
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${lastAddedId === p.id ? 'bg-emerald-500 text-white scale-110 rotate-[360deg]' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                      {lastAddedId === p.id ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden flex flex-col transition-all duration-300">
            <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-black text-slate-700 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" /> Cart Selection
              </h3>
              <span className={`px-3 py-1 bg-white border rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm transition-transform ${shouldAnimateBadge ? 'animate-badge-bump text-blue-600 border-blue-100 scale-110' : ''}`}>
                {selectedItems.length} Units
              </span>
            </div>
            <div className="divide-y overflow-y-auto max-h-[400px] custom-scrollbar">
              {selectedItems.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center gap-6 animate-in fade-in duration-500">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                    <Package className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Awaiting product input.</p>
                </div>
              ) : (
                selectedItems.map((item, idx) => {
                  const prod = products.find(p => p.id === item.productId);
                  const isAtMax = item.quantity >= (prod?.stockQuantity || 0);
                  return (
                    <div key={item.productId} className={`flex items-center justify-between p-6 bg-white hover:bg-slate-50/50 transition-all duration-300 animate-item-pop border-l-4 ${isAtMax ? 'border-amber-400' : 'border-transparent'}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 tracking-tight text-lg">{item.productName}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Rs. {item.salePrice.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 border-2 border-slate-100 rounded-2xl p-1 bg-white shadow-sm">
                          <button onClick={() => updateQuantity(item.productId, -1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 active:scale-90"><Minus className="w-4 h-4" /></button>
                          <span className={`w-12 text-center text-base font-black text-slate-900 transition-transform ${shouldAnimateBadge ? 'scale-125' : 'scale-100'}`}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, 1)} disabled={isAtMax} className={`p-2 rounded-xl transition-all active:scale-90 ${isAtMax ? 'text-slate-100 cursor-not-allowed' : 'hover:bg-blue-50 text-blue-600'}`}><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="w-28 text-right">
                          <p className={`font-black text-slate-900 text-xl tracking-tighter transition-all ${totalBump ? 'scale-105 text-blue-600' : ''}`}>Rs. {item.total.toLocaleString()}</p>
                        </div>
                        <button onClick={() => removeItem(item.productId)} className="text-slate-300 hover:text-rose-500 p-3 transition-all hover:bg-rose-50 rounded-2xl group active:scale-90"><Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" /></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Payment Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8 sticky top-8">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="p-6 bg-slate-900 rounded-[2rem] shadow-xl text-white space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-125"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Txn Date</span>
                    </div>
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="space-y-4 relative z-10">
                    <input 
                      type="date" 
                      value={transactionDate} 
                      onChange={(e) => setTransactionDate(e.target.value)} 
                      className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 font-black text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
                    />
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Time</span>
                      <span className="text-xs font-black text-blue-400 tabular-nums">{currentTime}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border-2 border-slate-100 rounded-[2rem] space-y-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Hash className="w-3 h-3 text-blue-500" /> Invoice ID
                    </label>
                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-tighter">Automatic</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Preview Index</span>
                    <span className="text-2xl font-black text-slate-900 font-mono tracking-tighter italic">{nextInvoicePreview}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <User className="w-3 h-3" /> Customer Account
                </label>
                <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="w-full px-5 py-4 border-2 rounded-2xl bg-slate-50 font-black text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer">
                  <option value="">Select Account...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-6 bg-blue-50/50 border-2 border-blue-100 rounded-[2rem] space-y-6">
                <label className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Wallet className="w-3 h-3" /> Settlement
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setPaymentType('cash')} className={`flex flex-col items-center justify-center gap-3 py-6 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all relative overflow-hidden ${paymentType === 'cash' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200 scale-[1.02]' : 'bg-white text-slate-500 border-slate-100'}`}>
                    <Banknote className="w-6 h-6" /> FULL
                  </button>
                  <button onClick={() => setPaymentType('credit')} className={`flex flex-col items-center justify-center gap-3 py-6 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all relative overflow-hidden ${paymentType === 'credit' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200 scale-[1.02]' : 'bg-white text-slate-500 border-slate-100'}`}>
                    <CreditCard className="w-6 h-6" /> PARTIAL
                  </button>
                </div>

                {paymentType === 'credit' && (
                  <div className="pt-4 space-y-4 border-t border-blue-200/50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Coins className="w-3 h-3" /> Down Payment (Rs.)
                    </label>
                    <div className="relative">
                       <input 
                        type="number" 
                        max={total}
                        min={0}
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(Math.min(total, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="w-full pl-5 pr-5 py-4 bg-white border-2 border-blue-200 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex justify-between items-center px-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase">To Ledger</span>
                       <span className="text-xs font-black text-rose-500 italic">Rs. {(total - paidAmount).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t-4 border-dashed border-slate-50 pt-8 space-y-4">
              <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                <span className="uppercase tracking-tighter text-[10px] font-black text-slate-300 mb-2">Grand Total</span>
                <span className={`text-4xl font-black text-slate-900 italic tracking-tighter transition-all duration-300 ${totalBump ? 'scale-110 text-blue-600' : ''}`}>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={handlePreview} disabled={selectedItems.length === 0 || !selectedCustomerId} className={`py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all border-2 ${(selectedItems.length === 0 || !selectedCustomerId) ? 'bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-100 hover:border-blue-600 hover:bg-blue-50 active:scale-95'}`}>
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button onClick={handlePreview} disabled={selectedItems.length === 0 || !selectedCustomerId} className={`py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${(selectedItems.length === 0 || !selectedCustomerId) ? 'bg-slate-100 text-slate-300 cursor-not-allowed border' : 'bg-slate-900 text-white hover:bg-black shadow-2xl active:scale-95'}`}>
                <CheckCircle2 className="w-5 h-5" /> Generate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL INVOICE MODAL */}
      {showInvoiceModal && currentInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 bg-slate-900/95 backdrop-blur-md no-print overflow-y-auto">
          <div className="bg-white md:rounded-[4rem] shadow-3xl w-full max-w-4xl min-h-screen md:min-h-0 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-12 duration-700 ease-out relative">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-12 py-8 border-b flex items-center justify-between z-20 no-print">
              <div className="flex items-center gap-8">
                <div className={`p-4 rounded-[1.5rem] shadow-2xl transition-all text-white ${isPreviewMode ? 'bg-blue-600 shadow-blue-100' : 'bg-emerald-500 shadow-emerald-100'}`} style={{ backgroundColor: isPreviewMode ? settings.primaryColor : undefined }}>
                  {isPreviewMode ? <Eye className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tighter">{isPreviewMode ? 'Authorize Sale' : 'Transaction Authenticated'}</h3>
                  {!isPreviewMode && <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] flex items-center gap-1 mt-1"><Zap className="w-3 h-3" /> Assets Dispatched & Logged</p>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {isPreviewMode ? (
                  <>
                    <button onClick={handleCloseModal} className="flex items-center gap-3 px-6 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition-all">
                      <ChevronLeft className="w-5 h-5" /> Go Back
                    </button>
                    <button onClick={handleConfirmIssue} disabled={isGenerating} className="flex items-center gap-4 px-10 py-5 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 shadow-2xl shadow-blue-200 active:scale-95 transition-all" style={{ backgroundColor: settings.primaryColor }}>
                      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Confirm Issue</>}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleCloseModal} className="flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-black shadow-2xl active:scale-95 transition-all">
                      <ArrowLeft className="w-5 h-5" /> Back to Terminal
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-5 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:opacity-90 shadow-2xl active:scale-95 transition-all" style={{ backgroundColor: settings.primaryColor }}>
                      <Printer className="w-5 h-5" /> Print Receipt
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className={`p-16 md:p-24 bg-white invoice-container flex-1 relative ${getFontSizeClass()}`}>
              {/* PAID / PARTIAL Stamp for Finalized Invoice */}
              {!isPreviewMode && (
                <div className="absolute top-24 right-24 opacity-20 pointer-events-none select-none z-0">
                  <div className={`text-9xl font-black border-[20px] px-12 py-4 rotate-[15deg] uppercase tracking-tighter ${currentInvoice.total === currentInvoice.paidAmount ? 'text-emerald-500 border-emerald-500' : 'text-rose-500 border-rose-500'}`}>
                    {currentInvoice.total === currentInvoice.paidAmount ? 'PAID' : 'PARTIAL'}
                  </div>
                </div>
              )}

              <div className="relative z-10">
                {/* Header Section */}
                <div className="grid grid-cols-2 gap-10 mb-20 items-start">
                    <div>
                      <div className="mb-8 inline-block shadow-2xl rounded-[2rem] border-4 border-slate-50 overflow-hidden">
                        <RenderLogo />
                      </div>
                      <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">{user?.shopName}</h1>
                      <div className="text-xs text-slate-400 font-bold mt-4 italic opacity-70 border-l-4 pl-6" style={{ borderColor: settings.primaryColor }}>
                        <p className="max-w-[200px] leading-relaxed">{user?.address || 'Certified Shop Location'}</p>
                        <p className="mt-2 text-[10px] font-black not-italic text-slate-900 uppercase tracking-widest">TEL: {user?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end pt-4">
                       <div className="inline-block p-10 rounded-[3rem] text-white shadow-3xl" style={{ backgroundColor: settings.primaryColor }}>
                          <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 mb-2 text-center">Document ID</p>
                          <p className="text-3xl font-black font-mono tracking-tight">#{currentInvoice.invoiceNumber}</p>
                       </div>
                       <div className="mt-8 space-y-1">
                          <p className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">{new Date(currentInvoice.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center justify-end gap-2"><Clock className="w-3 h-3" /> {new Date(currentInvoice.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                       </div>
                    </div>
                </div>

                {/* Recipient Header */}
                <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex justify-between items-center mb-16">
                   <div>
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Account Holder</span>
                     <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{currentInvoice.customerName}</h4>
                   </div>
                   <div className="text-right">
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Settlement Status</span>
                     <div className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-sm ${currentInvoice.total === currentInvoice.paidAmount ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {currentInvoice.total === currentInvoice.paidAmount ? 'Full Settlement' : 'Payment Pending'}
                     </div>
                   </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left mb-20">
                  <thead>
                    <tr className="border-b-[4px] border-slate-900">
                      <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] pl-4">Manifest</th>
                      <th className="py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] w-24">Qty</th>
                      <th className="py-6 text-right text-[10px] font-black uppercase tracking-[0.3em] pr-4 w-40">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-[1px] divide-slate-100">
                    {currentInvoice.items.map((item, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50/50 transition-colors animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <td className="py-8 pl-4 font-black text-slate-900 text-xl tracking-tight">{item.productName}</td>
                        <td className="py-8 text-center font-black text-xl">{item.quantity}</td>
                        <td className="py-8 text-right font-black pr-4 text-xl tracking-tight" style={{ color: settings.primaryColor }}>Rs. {item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary Footer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start pt-16 border-t-[4px] border-slate-900">
                   <div className="space-y-12">
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] flex items-center gap-3"><StickyNote className="w-4 h-4" /> Remarks</h5>
                        <div className="text-sm font-bold text-slate-500 italic bg-slate-50 p-10 rounded-[3rem] border-4 border-dashed border-slate-100 leading-relaxed shadow-inner">{currentInvoice.notes || 'No specific terms recorded.'}</div>
                      </div>
                      <div className="flex items-center gap-6 opacity-30">
                         <QrCode className="w-16 h-16" />
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 max-w-[120px]">Scan for Digital Verification of Ledger Reference</p>
                      </div>
                   </div>
                   <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-6"><span>Gross Valuations</span><span>Rs. {currentInvoice.subtotal.toLocaleString()}</span></div>
                      
                      <div className="flex justify-between items-end pb-8">
                         <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.6em] block mb-2 text-blue-400">Total Due</span>
                            <span className="text-6xl font-black italic tracking-tighter leading-none">Rs. {currentInvoice.total.toLocaleString()}</span>
                         </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-white/10 space-y-4 relative z-10">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Down Payment</span>
                          <span className="text-2xl font-black tracking-tight">Rs. {currentInvoice.paidAmount.toLocaleString()}</span>
                        </div>
                        <div className={`flex justify-between items-center ${currentInvoice.total - currentInvoice.paidAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          <span className="text-[10px] font-black uppercase tracking-widest">Balance Carrying</span>
                          <span className="text-2xl font-black tracking-tight">Rs. {(currentInvoice.total - currentInvoice.paidAmount).toLocaleString()}</span>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Footer Go Back Button (Only after generated) */}
                {!isPreviewMode && (
                   <div className="mt-20 pt-10 border-t flex justify-center no-print">
                      <button 
                        onClick={handleCloseModal}
                        className="flex items-center gap-3 px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-black shadow-2xl active:scale-95 transition-all"
                      >
                        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                      </button>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
