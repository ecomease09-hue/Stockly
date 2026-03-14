
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, Customer, Invoice, LedgerEntry, Payment, PaymentReminder, User, StockMovement, Vendor, VendorLedgerEntry } from '../types';

// Declare netlifyIdentity for the global window object
declare const netlifyIdentity: any;

export const PLAN_LIMITS = {
  free: { products: 20, vendors: 5, customers: 10 },
  pro: { products: 100, vendors: 20, customers: 50 },
  premium: { products: Infinity, vendors: Infinity, customers: Infinity }
};

interface AppContextType {
  user: User | null;
  products: Product[];
  customers: Customer[];
  vendors: Vendor[];
  invoices: Invoice[];
  ledger: LedgerEntry[];
  vendorLedger: VendorLedgerEntry[];
  payments: Payment[];
  reminders: PaymentReminder[];
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  loginWithCredentials: (email: string, name: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  checkLimit: (type: 'products' | 'vendors' | 'customers') => { allowed: boolean; limit: number; current: number };
  upgradePlan: (plan: 'pro' | 'premium', method: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'movements' | 'createdAt'>) => void;
  updateProduct: (product: Product, movementReason?: string) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalOutstanding'>) => Customer;
  addVendor: (vendor: Omit<Vendor, 'id' | 'totalBalance'>) => void;
  updateVendor: (vendor: Vendor) => void;
  deleteVendor: (id: string) => void;
  addVendorPayment: (payment: { vendorId: string, amount: number, method: string, date: string, note?: string }) => void;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  addReminder: (reminder: Omit<PaymentReminder, 'id' | 'status' | 'createdAt'>) => void;
  markReminderAsSent: (id: string) => void;
  deleteReminder: (id: string) => void;
  formatInvoiceNumber: (num: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [vendorLedger, setVendorLedger] = useState<VendorLedgerEntry[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);

  const resetInMemoryState = () => {
    setProducts([]);
    setCustomers([]);
    setVendors([]);
    setInvoices([]);
    setLedger([]);
    setVendorLedger([]);
    setPayments([]);
    setReminders([]);
    setHasHydrated(false);
  };

  const getStorageKey = (userId: string) => `stockly_data_v1_${userId}`;

  useEffect(() => {
    if (isAuthenticated && user?.id && hasHydrated) {
      const dataToSave = {
        products,
        customers,
        vendors,
        invoices,
        ledger,
        vendorLedger,
        payments,
        reminders
      };
      localStorage.setItem(getStorageKey(user.id), JSON.stringify(dataToSave));
    }
  }, [isAuthenticated, user?.id, hasHydrated, products, customers, vendors, invoices, ledger, vendorLedger, payments, reminders]);

  useEffect(() => {
    // Check if user was already logged in (mock persistence)
    const wasLoggedIn = localStorage.getItem('stockly_logged_in');
    const savedUserId = localStorage.getItem('stockly_user_id');
    const savedUserName = localStorage.getItem('stockly_user_name');
    const savedUserEmail = localStorage.getItem('stockly_user_email');
    
    if (wasLoggedIn === 'true' && savedUserId && savedUserEmail) {
      loginWithCredentials(savedUserEmail, savedUserName || 'User');
    }
  }, []);

  const openAuth = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuth = () => {
    setIsAuthModalOpen(false);
  };

  const loginWithCredentials = (email: string, name: string) => {
    // Generate a consistent ID based on email for demo purposes
    const mockUserId = `user-${btoa(email).replace(/=/g, '')}`;
    const appUser: User = {
      id: mockUserId,
      name: name || email.split('@')[0],
      email: email,
      shopName: localStorage.getItem(`shop_name_${mockUserId}`) || 'My Retail Shop',
      nextInvoiceNumber: parseInt(localStorage.getItem(`next_inv_${mockUserId}`) || '1'),
      invoicePrefix: localStorage.getItem(`inv_prefix_${mockUserId}`) ?? 'INV-',
      invoicePadding: parseInt(localStorage.getItem(`inv_padding_${mockUserId}`) || '5'),
      primaryColor: localStorage.getItem(`primary_color_${mockUserId}`) || '#2563eb',
      address: localStorage.getItem(`address_${mockUserId}`) || '',
      phone: localStorage.getItem(`phone_${mockUserId}`) || '',
      plan: (localStorage.getItem(`plan_${mockUserId}`) as any) || 'premium',
      subscriptionStatus: (localStorage.getItem(`sub_status_${mockUserId}`) as any) || 'active',
      planExpiryDate: localStorage.getItem(`expiry_${mockUserId}`) || undefined,
    };

    const storedDataRaw = localStorage.getItem(getStorageKey(mockUserId));
    if (storedDataRaw) {
      try {
        const d = JSON.parse(storedDataRaw);
        setProducts(d.products || []);
        setCustomers(d.customers || []);
        setVendors(d.vendors || []);
        setInvoices(d.invoices || []);
        setLedger(d.ledger || []);
        setVendorLedger(d.vendorLedger || []);
        setPayments(d.payments || []);
        setReminders(d.reminders || []);
      } catch (err) {
        console.error("Hydration failed", err);
      }
    }

    setUser(appUser);
    setIsAuthenticated(true);
    setHasHydrated(true);
    setIsAuthModalOpen(false);
    
    localStorage.setItem('stockly_logged_in', 'true');
    localStorage.setItem('stockly_user_id', mockUserId);
    localStorage.setItem('stockly_user_name', name);
    localStorage.setItem('stockly_user_email', email);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    resetInMemoryState();
    localStorage.removeItem('stockly_logged_in');
    localStorage.removeItem('stockly_user_id');
    localStorage.removeItem('stockly_user_name');
    localStorage.removeItem('stockly_user_email');
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (updates.shopName) localStorage.setItem(`shop_name_${prev.id}`, updates.shopName);
      if (updates.nextInvoiceNumber !== undefined) localStorage.setItem(`next_inv_${prev.id}`, updates.nextInvoiceNumber.toString());
      if (updates.invoicePrefix !== undefined) localStorage.setItem(`inv_prefix_${prev.id}`, updates.invoicePrefix);
      if (updates.invoicePadding !== undefined) localStorage.setItem(`inv_padding_${prev.id}`, updates.invoicePadding.toString());
      if (updates.primaryColor) localStorage.setItem(`primary_color_${prev.id}`, updates.primaryColor);
      if (updates.address) localStorage.setItem(`address_${prev.id}`, updates.address);
      if (updates.phone) localStorage.setItem(`phone_${prev.id}`, updates.phone);
      if (updates.plan) localStorage.setItem(`plan_${prev.id}`, updates.plan);
      if (updates.subscriptionStatus) localStorage.setItem(`sub_status_${prev.id}`, updates.subscriptionStatus);
      if (updates.planExpiryDate) localStorage.setItem(`expiry_${prev.id}`, updates.planExpiryDate);
      return updated;
    });
  };

  const formatInvoiceNumber = (num: number): string => {
    const prefix = user?.invoicePrefix ?? 'INV-';
    const padding = user?.invoicePadding ?? 5;
    return `${prefix}${num.toString().padStart(padding, '0')}`;
  };

  const checkLimit = (type: 'products' | 'vendors' | 'customers') => {
    const plan = user?.plan || 'free';
    const limit = (PLAN_LIMITS[plan] as any)[type];
    const current = type === 'products' ? products.length : type === 'vendors' ? vendors.length : customers.length;
    return { allowed: current < limit, limit, current };
  };

  const upgradePlan = (plan: 'pro' | 'premium', method: string) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    updateUser({ plan, subscriptionStatus: 'active', planExpiryDate: expiryDate.toISOString() });
  };

  const addVendor = (v: Omit<Vendor, 'id' | 'totalBalance'>) => {
    const newVendor = { ...v, id: Math.random().toString(36).substr(2, 9), totalBalance: 0 };
    setVendors(prev => [...prev, newVendor]);
  };

  const updateVendor = (v: Vendor) => {
    setVendors(prev => prev.map(item => item.id === v.id ? v : item));
    setProducts(prev => prev.map(p => p.vendorId === v.id ? { ...p, vendorName: v.name } : p));
  };

  const deleteVendor = (id: string) => {
    setVendors(prev => prev.filter(v => v.id !== id));
    setProducts(prev => prev.map(p => p.vendorId === id ? { ...p, vendorId: undefined, vendorName: undefined } : p));
  };

  const addVendorPayment = (pay: { vendorId: string, amount: number, method: string, date: string, note?: string }) => {
    const paymentId = Math.random().toString(36).substr(2, 9);
    
    const vendor = vendors.find(v => v.id === pay.vendorId);
    const currentBalance = vendor?.totalBalance || 0;
    const newBalance = currentBalance - pay.amount;
    
    const newEntry: VendorLedgerEntry = {
      id: paymentId,
      vendorId: pay.vendorId,
      date: pay.date,
      refId: paymentId,
      type: 'payment',
      description: `Payment via ${pay.method}${pay.note ? `: ${pay.note}` : ''}`,
      debit: pay.amount,
      credit: 0,
      balance: newBalance
    };
    
    setVendorLedger(prev => [...prev, newEntry]);
    setVendors(prevVendors => prevVendors.map(v => v.id === pay.vendorId ? { ...v, totalBalance: newBalance } : v));
  };

  const addProduct = (p: Omit<Product, 'id' | 'movements' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const productId = Math.random().toString(36).substr(2, 9);
    const newMovement: StockMovement = { id: Math.random().toString(36).substr(2, 9), type: 'in', quantity: p.stockQuantity, date: now, reason: 'Initial Stock' };
    const newProduct: Product = { ...p, id: productId, createdAt: now, movements: [newMovement] };
    
    if (p.vendorId && p.stockQuantity > 0) {
      const cost = p.purchasePrice * p.stockQuantity;
      const vendor = vendors.find(v => v.id === p.vendorId);
      const newBalance = (vendor?.totalBalance || 0) + cost;
      
      const newEntry: VendorLedgerEntry = { id: Math.random().toString(36).substr(2, 9), vendorId: p.vendorId!, date: now, refId: productId, type: 'purchase', description: `Initial Stock: ${p.name}`, debit: 0, credit: cost, balance: newBalance };
      
      setVendorLedger(prev => [...prev, newEntry]);
      setVendors(prevVendors => prevVendors.map(v => v.id === p.vendorId ? { ...v, totalBalance: newBalance } : v));
    }
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (p: Product, movementReason: string = 'Update') => {
    const oldProduct = products.find(item => item.id === p.id);
    const diff = oldProduct ? p.stockQuantity - oldProduct.stockQuantity : 0;
    const now = new Date().toISOString();
    
    if (diff > 0 && p.vendorId) {
      const cost = p.purchasePrice * diff;
      const vendor = vendors.find(v => v.id === p.vendorId);
      const newBalance = (vendor?.totalBalance || 0) + cost;
      
      const newEntry: VendorLedgerEntry = { id: Math.random().toString(36).substr(2, 9), vendorId: p.vendorId!, date: now, refId: `PUR-${p.sku}`, type: 'purchase', description: `Restock: ${p.name}`, debit: 0, credit: cost, balance: newBalance };
      
      setVendorLedger(prev => [...prev, newEntry]);
      setVendors(prevVendors => prevVendors.map(v => v.id === p.vendorId ? { ...v, totalBalance: newBalance } : v));
    }

    setProducts(prevProducts => prevProducts.map(item => {
      if (item.id === p.id) {
        const movements = [...item.movements];
        if (diff !== 0) {
          movements.push({ id: Math.random().toString(36).substr(2, 9), type: diff > 0 ? 'in' : 'out', quantity: Math.abs(diff), date: now, reason: movementReason });
        }
        return { ...p, movements };
      }
      return item;
    }));
  };

  const deleteProduct = (id: string) => setProducts(prev => prev.filter(item => item.id !== id));
  const addCustomer = (c: Omit<Customer, 'id' | 'totalOutstanding'>) => {
    const newCustomer = { ...c, id: Math.random().toString(36).substr(2, 9), totalOutstanding: 0 };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const createInvoice = (inv: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    // Robust numbering logic
    let currentSeq = user?.nextInvoiceNumber || 1;
    let invoiceNumber = formatInvoiceNumber(currentSeq);
    
    // Safety check: ensure number is unique by scanning existing invoices
    while (invoices.some(i => i.invoiceNumber === invoiceNumber)) {
        currentSeq++;
        invoiceNumber = formatInvoiceNumber(currentSeq);
    }

    const invoiceId = Math.random().toString(36).substr(2, 9);
    const transactionDate = inv.date || new Date().toISOString();
    
    const itemsWithCost = inv.items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return { ...item, purchasePrice: prod ? prod.purchasePrice : 0 };
    });

    const newInvoice: Invoice = { ...inv, date: transactionDate, items: itemsWithCost, id: invoiceId, invoiceNumber };
    
    // Update Stock
    setProducts(prevProducts => prevProducts.map(prod => {
      const soldItem = inv.items.find(item => item.productId === prod.id);
      if (soldItem) {
        const newMovement: StockMovement = { id: Math.random().toString(36).substr(2, 9), type: 'out', quantity: soldItem.quantity, date: transactionDate, reason: `Sale (${invoiceNumber})`, referenceId: invoiceId };
        return { ...prod, stockQuantity: Math.max(0, prod.stockQuantity - soldItem.quantity), movements: [...prod.movements, newMovement] };
      }
      return prod;
    }));

    setInvoices(prev => [...prev, newInvoice]);
    
    // Update Customer Ledger
    const targetCustomer = customers.find(c => c.id === newInvoice.customerId);
    const currentOutstanding = targetCustomer?.totalOutstanding || 0;
    
    const entries: LedgerEntry[] = [];
    let currentBalance = currentOutstanding;
    
    // Invoice Entry
    currentBalance += newInvoice.total;
    entries.push({
      id: Math.random().toString(36).substr(2, 9),
      customerId: newInvoice.customerId,
      date: newInvoice.date,
      refId: invoiceId,
      type: 'invoice',
      description: `Invoice ${invoiceNumber}`,
      debit: newInvoice.total,
      credit: 0,
      balance: currentBalance
    });
    
    // Payment Entry (if any)
    if (newInvoice.paidAmount > 0) {
      currentBalance -= newInvoice.paidAmount;
      entries.push({
        id: Math.random().toString(36).substr(2, 9),
        customerId: newInvoice.customerId,
        date: newInvoice.date,
        refId: invoiceId,
        type: 'payment',
        description: `Payment for Invoice ${invoiceNumber}`,
        debit: 0,
        credit: newInvoice.paidAmount,
        balance: currentBalance
      });
    }
    
    setLedger(prev => [...prev, ...entries]);
    setCustomers(prevCustomers => prevCustomers.map(c => c.id === newInvoice.customerId ? { ...c, totalOutstanding: currentBalance } : c));

    // Advance sequence for next time
    updateUser({ nextInvoiceNumber: currentSeq + 1 });
    
    return newInvoice;
  };

  const addPayment = (pay: Omit<Payment, 'id'>) => {
    const paymentId = Math.random().toString(36).substr(2, 9);
    setPayments(prev => [...prev, { ...pay, id: paymentId }]);
    
    const targetCustomer = customers.find(c => c.id === pay.customerId);
    const newBalance = (targetCustomer?.totalOutstanding || 0) - pay.amount;
    
    const newEntry: LedgerEntry = { 
      id: Math.random().toString(36).substr(2, 9), 
      customerId: pay.customerId, 
      date: pay.date, 
      refId: paymentId, 
      type: 'payment', 
      description: `Payment via ${pay.method}`, 
      debit: 0, 
      credit: pay.amount, 
      balance: newBalance 
    };
    
    setLedger(prev => [...prev, newEntry]);
    setCustomers(prevCustomers => prevCustomers.map(c => c.id === pay.customerId ? { ...c, totalOutstanding: newBalance } : c));
  };

  const addReminder = (r: Omit<PaymentReminder, 'id' | 'status' | 'createdAt'>) => setReminders(prev => [...prev, { ...r, id: Math.random().toString(36).substr(2, 9), status: 'pending', createdAt: new Date().toISOString() }]);
  const markReminderAsSent = (id: string) => setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'sent' } : r));
  const deleteReminder = (id: string) => setReminders(prev => prev.filter(r => r.id !== id));

  return (
    <AppContext.Provider value={{
      user, products, customers, vendors, invoices, ledger, vendorLedger, payments, reminders, isAuthenticated, isAuthModalOpen,
      openAuth, closeAuth, loginWithCredentials, logout, updateUser, checkLimit, upgradePlan,
      addProduct, updateProduct, deleteProduct, addCustomer, addVendor, updateVendor, deleteVendor, addVendorPayment,
      createInvoice, addPayment, addReminder, markReminderAsSent, deleteReminder, formatInvoiceNumber
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
