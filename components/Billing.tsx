
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
  Edit3,
  FileDown,
  Info,
  StickyNote,
  Wallet,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle,
  FileJson,
  Share2,
  Palette,
  Type,
  Layout as LayoutIcon,
  ChevronRight,
  Sparkles,
  Hash,
  ArrowRight,
  ArrowLeft,
  RotateCcw
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
  const [taxRate, setTaxRate] = useState(10); 
  const [paymentType, setPaymentType] = useState<PaymentType>('cash');
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('Terms: Goods once sold are not returnable. Please clear dues within 15 days.');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isEditingShopInfo, setIsEditingShopInfo] = useState(false);
  
  // Customization State
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [settings, setSettings] = useState<InvoiceSettings>({
    template: 'standard',
    primaryColor: user?.primaryColor || '#2563eb', 
    fontSize: 'base'
  });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const subtotal = useMemo(() => 
    selectedItems.reduce((sum, item) => sum + item.total, 0),
  [selectedItems]);

  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount - discount;

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
    
    if (product.stockQuantity <= 0) {
      setToast({ message: `"${product.name}" is currently out of stock.`, type: 'error' });
      return;
    }

    setSelectedItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          setToast({ message: `Insufficient stock for "${product.name}".`, type: 'error' });
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
          setToast({ message: "Maximum stock limit reached.", type: 'error' });
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
      setToast({ message: "Select a customer and add products first.", type: 'error' });
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    const prefix = user?.invoicePrefix || 'INV';
    const nextNum = user?.nextInvoiceNumber || 1;

    const previewInvoice: Invoice = {
      id: 'preview',
      invoiceNumber: `${prefix}-${nextNum.toString().padStart(5, '0')}`,
      customerId: selectedCustomerId,
      customerName: customer.name,
      date: new Date().toISOString(),
      items: selectedItems,
      subtotal,
      tax: taxAmount,
      discount,
      total,
      paidAmount: paymentType === 'cash' ? total : paidAmount,
      paymentType,
      notes
    };

    setCurrentInvoice(previewInvoice);
    setIsPreviewMode(true);
    setShowInvoiceModal(true);
  };

  const handleConfirmIssue = () => {
    if (!currentInvoice || isGenerating) return;

    // MANDATORY: Final inventory check before finalizing the transaction
    for (const item of currentInvoice.items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod || prod.stockQuantity < item.quantity) {
        setToast({ 
          message: `Inventory Alert: Insufficient stock for ${item.productName}. Required: ${item.quantity}, Available: ${prod?.stockQuantity || 0}`, 
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
        date: new Date().toISOString(),
        items: currentInvoice.items,
        subtotal: currentInvoice.subtotal,
        tax: currentInvoice.tax,
        discount: currentInvoice.discount,
        total: currentInvoice.total,
        paidAmount: currentInvoice.paidAmount,
        paymentType: currentInvoice.paymentType,
        notes: currentInvoice.notes
      };

      // This call now triggers state-wide inventory reduction in AppContext
      const savedInvoice = createInvoice(invoiceData);
      
      setCurrentInvoice(savedInvoice);
      setIsPreviewMode(false);
      setIsGenerating(false);
      
      // Clear local UI state after successful issuance
      setSelectedItems([]);
      setDiscount(0);
      setPaidAmount(0);
      setSelectedCustomerId('');
      
      setToast({ message: "Invoice Finalized. Inventory items have been subtracted.", type: 'success' });
    }, 800);
  };

  const handleUpdateShopInfo = (field: 'address' | 'phone', value: string) => {
    updateUser({ [field]: value });
  };

  const downloadPDF = () => {
    window.print();
  };

  const handleDownloadInvoiceFile = () => {
    if (!currentInvoice) return;
    
    const container = document.querySelector('.invoice-container');
    if (!container) return;

    const invoiceHtml = container.outerHTML;
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${currentInvoice.invoiceNumber}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; background: #f8fafc; padding: 2rem; }
          .invoice-container { background: white; max-width: 900px; margin: 0 auto; border-radius: 2rem; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.1); padding: 3rem; }
          @media print { body { padding: 0; background: white; } .invoice-container { box-shadow: none; border-radius: 0; } }
          .accent-text { color: ${settings.primaryColor} !important; }
          .accent-bg { background-color: ${settings.primaryColor} !important; }
          .accent-border { border-color: ${settings.primaryColor} !important; }
        </style>
      </head>
      <body>
        <div class="p-8">
          ${invoiceHtml}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${currentInvoice.invoiceNumber}.html`;
    link.click();
    URL.revokeObjectURL(url);
    setToast({ message: "Digital invoice downloaded!", type: 'success' });
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'sm': return 'text-sm';
      case 'lg': return 'text-xl';
      default: return 'text-base';
    }
  };

  const nextInvoicePreview = useMemo(() => {
    const prefix = user?.invoicePrefix || 'INV';
    const num = user?.nextInvoiceNumber || 1;
    return `${prefix}-${num.toString().padStart(5, '0')}`;
  }, [user?.invoicePrefix, user?.nextInvoiceNumber]);

  const handleCloseModal = () => {
    setShowInvoiceModal(false);
    setIsPreviewMode(false);
    setCurrentInvoice(null);
  };

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-toast border backdrop-blur-md ${toast.type === 'success' ? 'bg-emerald-900/90 text-white border-emerald-500' : 'bg-rose-900/90 text-white border-rose-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-rose-400" />}
          <span className="font-bold text-sm tracking-tight">{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Billing Terminal</h2>
          <p className="text-slate-500">Fast invoicing with real-time stock deduction.</p>
        </div>
        <div className="flex gap-2">
          {invoices.length > 0 && (
             <button onClick={() => { setCurrentInvoice(invoices[invoices.length - 1]); setIsPreviewMode(false); setShowInvoiceModal(true); }} className="flex items-center gap-2 px-4 py-2 border bg-white rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-bold text-slate-600">
              <Printer className="w-4 h-4" /> Last Issued
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl border shadow-sm space-y-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredProducts.map(p => (
                <button key={p.id} onClick={() => addItem(p.id)} disabled={p.stockQuantity <= 0} className={`flex items-center justify-between p-3 border rounded-xl text-left transition-all relative overflow-hidden ${p.stockQuantity <= 0 ? 'bg-slate-50 opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:shadow-lg active:scale-95 bg-white'} ${lastAddedId === p.id ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 font-bold">In Stock: {p.stockQuantity} • Rs. {p.salePrice}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${lastAddedId === p.id ? 'bg-emerald-500 text-white' : 'bg-blue-50 text-blue-600'}`}>
                    {lastAddedId === p.id ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
            <div className="p-5 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" /> Items in Basket
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {selectedItems.length} Products
              </span>
            </div>
            <div className="divide-y overflow-y-auto max-h-[350px] custom-scrollbar">
              {selectedItems.length === 0 ? (
                <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed">
                    <ImageIcon className="w-10 h-10 opacity-10" />
                  </div>
                  <p className="text-sm font-black text-slate-500">Your basket is empty.</p>
                </div>
              ) : (
                selectedItems.map((item, idx) => (
                  <div key={item.productId} className={`flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors animate-item-pop`} style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="flex-1">
                      <p className="font-black text-slate-900 tracking-tight">{item.productName}</p>
                      <p className="text-xs text-slate-500 font-bold">Rs. {item.salePrice.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-3 border rounded-xl p-1 bg-slate-50">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-1.5 bg-white hover:bg-slate-200 rounded-lg shadow-sm transition-colors text-slate-600"><Minus className="w-3 h-3" /></button>
                        <span className="w-10 text-center text-sm font-black text-slate-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-1.5 bg-white hover:bg-slate-200 rounded-lg shadow-sm transition-colors text-slate-600"><Plus className="w-3 h-3" /></button>
                      </div>
                      <div className="w-24 text-right"><p className="font-black text-slate-900 italic">Rs. {item.total.toLocaleString()}</p></div>
                      <button onClick={() => removeItem(item.productId)} className="text-slate-300 hover:text-rose-500 p-2 transition-all hover:bg-rose-50 rounded-xl"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border shadow-sm space-y-6 sticky top-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><User className="w-3 h-3" /> Account Selection</label>
                <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="w-full px-4 py-3.5 border-2 rounded-xl bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  <option value="">Choose customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-[1.5rem] space-y-4">
                <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Wallet className="w-3 h-3" /> Settlement Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPaymentType('cash')} className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] transition-all relative overflow-hidden ${paymentType === 'cash' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200 scale-[1.02]' : 'bg-white text-slate-600 border-slate-100'}`}>
                    <Banknote className="w-6 h-6" /> FULL PAID
                  </button>
                  <button onClick={() => setPaymentType('credit')} className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] transition-all relative overflow-hidden ${paymentType === 'credit' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200 scale-[1.02]' : 'bg-white text-slate-600 border-slate-100'}`}>
                    <CreditCard className="w-6 h-6" /> CREDIT/DEBT
                  </button>
                </div>

                {paymentType === 'credit' && (
                  <div className="space-y-3 animate-in slide-in-from-top-4 duration-300 pt-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Upfront Deposit (Rs.)</label>
                    <input 
                      type="number" 
                      value={paidAmount} 
                      onChange={(e) => setPaidAmount(Math.min(Number(e.target.value), total))} 
                      className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl bg-white font-black text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t-2 border-dashed border-slate-100 pt-6 space-y-3">
              <div className="flex justify-between text-slate-500 text-sm font-bold">
                <span className="uppercase tracking-widest text-[10px]">Taxable Amt</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-3xl font-black text-slate-900 border-t-4 border-slate-900/5 pt-5 mt-4 tracking-tighter">
                <span className="uppercase tracking-tighter text-[10px] pt-3 text-slate-400">Total</span>
                <span className="text-blue-600">Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={handlePreview} disabled={selectedItems.length === 0 || !selectedCustomerId} className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-2 ${(selectedItems.length === 0 || !selectedCustomerId) ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-100 hover:border-blue-600 hover:bg-blue-50'}`}>
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button onClick={() => { handlePreview(); setIsPreviewMode(true); }} disabled={selectedItems.length === 0 || !selectedCustomerId} className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${(selectedItems.length === 0 || !selectedCustomerId) ? 'bg-slate-100 text-slate-300 cursor-not-allowed border' : 'bg-slate-900 text-white hover:bg-black shadow-xl'}`}>
                <FileText className="w-4 h-4" /> Issue Bill
              </button>
            </div>
          </div>
        </div>
      </div>

      {showInvoiceModal && currentInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 bg-slate-900/95 backdrop-blur-md no-print overflow-y-auto">
          {showCustomizer && (
            <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-[110] p-8 animate-in slide-in-from-right duration-300 flex flex-col no-print border-l border-slate-200 overflow-y-auto custom-scrollbar">
               <div className="flex items-center justify-between mb-8">
                  <h4 className="font-black text-slate-900 text-lg flex items-center gap-2"><Palette className="w-5 h-5 text-blue-600" /> Terminal Settings</h4>
                  <button onClick={() => setShowCustomizer(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
               </div>
               
               <div className="space-y-10 flex-1">
                  <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-5">
                    <label className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      <Hash className="w-3 h-3" /> Invoice Series
                    </label>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Series Prefix</label>
                        <input 
                          type="text" 
                          value={user?.invoicePrefix || 'INV'} 
                          onChange={(e) => updateUser({ invoicePrefix: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-2 bg-white border rounded-xl text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="INV"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Starting Number</label>
                        <input 
                          type="number" 
                          value={user?.nextInvoiceNumber || 1} 
                          onChange={(e) => updateUser({ nextInvoiceNumber: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-2 bg-white border rounded-xl text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div className="pt-2">
                        <div className="bg-white p-3 rounded-xl border border-dashed border-blue-200 flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Next ID Preview</span>
                          <span className="text-[11px] font-mono font-black text-blue-600">{nextInvoicePreview}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Template Layout</label>
                    <div className="grid grid-cols-1 gap-2">
                       {[
                         { id: 'standard', label: 'Standard Modern', icon: LayoutIcon },
                         { id: 'minimal', label: 'Simple Minimal', icon: Minus },
                         { id: 'elegant', label: 'Corporate Elegant', icon: Building2 }
                       ].map((tpl) => (
                         <button 
                           key={tpl.id}
                           onClick={() => setSettings(s => ({ ...s, template: tpl.id as TemplateType }))}
                           className={`flex items-center justify-between px-4 py-3 border-2 rounded-xl font-bold transition-all ${settings.template === tpl.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                         >
                           <span className="flex items-center gap-3 text-xs"><tpl.icon className="w-4 h-4" /> {tpl.label}</span>
                           {settings.template === tpl.id && <Check className="w-3 h-3" />}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Theme Color</label>
                    <div className="flex flex-wrap gap-2">
                       {['#2563eb', '#10b981', '#f43f5e', '#7c3aed', '#0f172a'].map((color) => (
                         <button 
                           key={color}
                           onClick={() => setSettings(s => ({ ...s, primaryColor: color }))}
                           className={`w-10 h-10 rounded-full border-4 transition-all ${settings.primaryColor === color ? 'border-white ring-2 ring-slate-900' : 'border-white shadow-sm'}`}
                           style={{ backgroundColor: color }}
                         />
                       ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Text Size</label>
                    <div className="flex gap-2">
                       {['sm', 'base', 'lg'].map((size) => (
                         <button 
                           key={size}
                           onClick={() => setSettings(s => ({ ...s, fontSize: size as any }))}
                           className={`flex-1 py-3 border-2 rounded-xl font-black uppercase text-[10px] transition-all ${settings.fontSize === size ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                         >
                           {size}
                         </button>
                       ))}
                    </div>
                  </div>
               </div>
            </div>
          )}

          <div className="bg-white md:rounded-[4rem] shadow-2xl w-full max-w-4xl min-h-screen md:min-h-0 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-12 duration-700 ease-out relative">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-10 py-6 border-b flex items-center justify-between z-20 no-print">
              <div className="flex items-center gap-6">
                <div className="p-3 rounded-2xl shadow-xl transition-colors text-white" style={{ backgroundColor: settings.primaryColor }}>
                  {isPreviewMode ? <Eye className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg tracking-tight">{isPreviewMode ? 'Review Documentation' : 'Official Digital Invoice'}</h3>
                  {!isPreviewMode && <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] flex items-center gap-1"><Zap className="w-3 h-3" /> Inventory Adjusted Successfully</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isPreviewMode ? (
                  <>
                    <button onClick={() => setShowCustomizer(!showCustomizer)} className={`flex items-center gap-2 px-5 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${showCustomizer ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Palette className="w-4 h-4" /> {showCustomizer ? 'HIDE SETTINGS' : 'CONFIGURE'}</button>
                    <button onClick={handleConfirmIssue} disabled={isGenerating} className="flex items-center gap-3 px-8 py-5 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 shadow-2xl active:scale-95 transition-all" style={{ backgroundColor: settings.primaryColor }}>{isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Confirm & Issue</>}</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleCloseModal} className="flex items-center gap-3 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 shadow-sm active:scale-95 transition-all"><ArrowLeft className="w-4 h-4" /> Go Back / New Sale</button>
                    <button onClick={handleDownloadInvoiceFile} className="flex items-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 shadow-xl active:scale-95 transition-all"><Download className="w-4 h-4" /> Download Receipt</button>
                    <button onClick={downloadPDF} className="flex items-center gap-3 px-6 py-4 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 shadow-xl active:scale-95 transition-all" style={{ backgroundColor: settings.primaryColor }}><Printer className="w-4 h-4" /> Save PDF</button>
                  </>
                )}
                <button onClick={handleCloseModal} className="p-4 text-slate-300 hover:text-rose-500 rounded-2xl transition-all"><X className="w-7 h-7" /></button>
              </div>
            </div>

            <div className={`p-12 md:p-20 bg-white invoice-container flex-1 relative ${getFontSizeClass()}`}>
              <div className="relative z-10">
                {settings.template === 'elegant' ? (
                  <div className="text-center mb-16 border-b-2 pb-12" style={{ borderColor: settings.primaryColor + '30' }}>
                    <div className="w-24 h-24 bg-white mx-auto mb-6 flex items-center justify-center overflow-hidden border-2 rounded-[2rem]" style={{ borderColor: settings.primaryColor }}>
                       {user?.logoUrl ? <img src={user.logoUrl} className="w-full h-full object-contain p-2" /> : <Building2 className="w-10 h-10" style={{ color: settings.primaryColor }} />}
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tight" style={{ color: settings.primaryColor }}>{user?.shopName}</h1>
                    <div className="mt-4 flex justify-center gap-10 text-xs font-bold text-slate-400">
                      <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {user?.address}</p>
                      <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {user?.phone}</p>
                    </div>
                  </div>
                ) : settings.template === 'minimal' ? (
                   <div className="flex justify-between items-start mb-16">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                           {user?.logoUrl ? <img src={user.logoUrl} className="w-full h-full object-contain p-2" /> : <Building2 className="w-8 h-8" />}
                        </div>
                        <div>
                          <h1 className="text-3xl font-black text-slate-900">{user?.shopName}</h1>
                          <p className="text-xs text-slate-500 font-bold">{user?.address}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">Invoice Reference</p>
                         <p className="text-2xl font-black">#{currentInvoice.invoiceNumber}</p>
                      </div>
                   </div>
                ) : (
                  <div className="grid grid-cols-2 gap-10 mb-16 items-start">
                    <div>
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl border mb-6">
                        {user?.logoUrl ? <img src={user.logoUrl} className="w-full h-full object-contain p-3" /> : <Building2 className="w-8 h-8" style={{ color: settings.primaryColor }} />}
                      </div>
                      <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{user?.shopName}</h1>
                      <div className="text-xs text-slate-500 font-bold mt-2 italic opacity-80 border-l-4 pl-4" style={{ borderColor: settings.primaryColor }}>
                        <p>{user?.address}</p>
                        <p className="mt-1">TEL: {user?.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="inline-block p-6 rounded-[2.5rem] text-white" style={{ backgroundColor: settings.primaryColor }}>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-1 text-center">Invoice Ref</p>
                          <p className="text-2xl font-black font-mono">#{currentInvoice.invoiceNumber}</p>
                       </div>
                       <p className="text-sm font-black text-slate-400 mt-4 uppercase tracking-widest">{new Date(currentInvoice.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                <div className="p-10 rounded-[3rem] border border-slate-100 shadow-inner mb-12 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md" style={{ color: settings.primaryColor }}><User className="w-8 h-8" /></div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-1">Bill To Recipient</span>
                      <h4 className="text-2xl font-black text-slate-900">{currentInvoice.customerName}</h4>
                    </div>
                  </div>
                  <div className={`px-8 py-3 rounded-2xl border-4 rotate-[-3deg] shadow-lg ${currentInvoice.total === currentInvoice.paidAmount ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-rose-50 border-rose-500 text-rose-600'}`}>
                    <span className="text-xl font-black uppercase tracking-tighter">{currentInvoice.total === currentInvoice.paidAmount ? 'FULLY PAID' : 'PARTIAL DUE'}</span>
                  </div>
                </div>

                <table className="w-full text-left mb-16">
                  <thead>
                    <tr className="border-b-4 border-slate-900">
                      <th className="py-6 text-[10px] font-black uppercase tracking-[0.4em] pl-6">Specifications</th>
                      <th className="py-6 text-center text-[10px] font-black uppercase tracking-[0.4em]">Qty</th>
                      <th className="py-6 text-right text-[10px] font-black uppercase tracking-[0.4em] pr-6">Valuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-6 pl-6 font-black text-slate-900 text-lg">{item.productName}</td>
                        <td className="py-6 text-center font-black">{item.quantity}</td>
                        <td className="py-6 text-right font-black pr-6" style={{ color: settings.primaryColor }}>Rs. {item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start border-t-4 border-slate-900 pt-12">
                   <div className="space-y-8">
                      <div>
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 flex items-center gap-2"><StickyNote className="w-3 h-3" /> Special Notes</h5>
                        <div className="text-xs font-bold text-slate-600 italic bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200">{currentInvoice.notes || 'Goods once sold are not returnable.'}</div>
                      </div>
                      <div className="flex items-center gap-6 opacity-60">
                         <div className="w-24 h-24 bg-white border-4 rounded-3xl flex items-center justify-center p-2" style={{ borderColor: settings.primaryColor + '40' }}>
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=INV:${currentInvoice.invoiceNumber}`} alt="QR" className="w-full h-full" />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Secure Digital <br/>Transaction ID <br/>{currentInvoice.id.slice(0,8)}</p>
                      </div>
                   </div>
                   <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden" style={{ backgroundColor: settings.template === 'elegant' ? settings.primaryColor : '#0f172a' }}>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-4"><span>Subtotal Value</span><span>Rs. {currentInvoice.subtotal.toLocaleString()}</span></div>
                      <div className="h-px bg-white/10 my-4"></div>
                      <div className="flex justify-between items-end pb-8">
                         <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 block">Grand Total</span>
                            <span className="text-5xl font-black italic tracking-tighter">Rs. {currentInvoice.total.toLocaleString()}</span>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-white/10">
                         <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 block mb-1">Paid Upfront</span>
                            <p className="text-lg font-black">Rs. {currentInvoice.paidAmount.toLocaleString()}</p>
                         </div>
                         <div className={`p-4 rounded-2xl border ${currentInvoice.total - currentInvoice.paidAmount > 0 ? 'bg-rose-500/20 border-rose-500/40' : 'bg-emerald-500/20 border-emerald-500/40'}`}>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 block mb-1">Dues Left</span>
                            <p className="text-lg font-black">Rs. {(currentInvoice.total - currentInvoice.paidAmount).toLocaleString()}</p>
                         </div>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                   </div>
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
