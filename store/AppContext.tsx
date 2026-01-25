
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Customer, Invoice, LedgerEntry, Payment, PaymentReminder } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
  shopName: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  nextInvoiceNumber: number;
}

interface AppContextType {
  user: User | null;
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  ledger: LedgerEntry[];
  payments: Payment[];
  reminders: PaymentReminder[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, shopName: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalOutstanding'>) => void;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  addReminder: (reminder: Omit<PaymentReminder, 'id' | 'status' | 'createdAt'>) => void;
  markReminderAsSent: (id: string) => void;
  deleteReminder: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('inventory_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Load initial demo data
    const demoProducts: Product[] = [
      { id: '1', name: 'Premium Rice 5kg', sku: 'RICE-001', purchasePrice: 400, salePrice: 550, stockQuantity: 50, lowStockThreshold: 10 },
      { id: '2', name: 'Cooking Oil 1L', sku: 'OIL-102', purchasePrice: 150, salePrice: 185, stockQuantity: 8, lowStockThreshold: 10 },
      { id: '3', name: 'Tea Leaves 250g', sku: 'TEA-45', purchasePrice: 80, salePrice: 110, stockQuantity: 100, lowStockThreshold: 20 },
    ];
    const demoCustomers: Customer[] = [
      { id: 'c1', name: 'John Doe', phone: '555-0101', address: '123 Main St', totalOutstanding: 1500 },
      { id: 'c2', name: 'Jane Smith', phone: '555-0202', address: '456 Oak Ave', totalOutstanding: 0 },
    ];
    setProducts(demoProducts);
    setCustomers(demoCustomers);
  }, []);

  const login = async (email: string, password: string) => {
    const mockUser = { 
      id: 'u1', 
      name: 'Admin User', 
      email, 
      shopName: 'My Premium Shop',
      address: 'Building 40, Street 5, Blue Area, Islamabad',
      phone: '+92 300 1234567',
      nextInvoiceNumber: 1
    };
    setUser(mockUser);
    localStorage.setItem('inventory_user', JSON.stringify(mockUser));
  };

  const signup = async (name: string, email: string, shopName: string, password: string) => {
    const mockUser = { 
      id: 'u1', 
      name, 
      email, 
      shopName,
      address: '',
      phone: '',
      nextInvoiceNumber: 1
    };
    setUser(mockUser);
    localStorage.setItem('inventory_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('inventory_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('inventory_user', JSON.stringify(updatedUser));
  };

  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProduct = { ...p, id: Math.random().toString(36).substr(2, 9) };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (p: Product) => {
    setProducts(prev => prev.map(item => item.id === p.id ? p : item));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(item => item.id !== id));
  };

  const addCustomer = (c: Omit<Customer, 'id' | 'totalOutstanding'>) => {
    const newCustomer = { ...c, id: Math.random().toString(36).substr(2, 9), totalOutstanding: 0 };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const createInvoice = (inv: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const currentSeq = user?.nextInvoiceNumber || 1;
    const invoiceNumber = `INV-${currentSeq.toString().padStart(5, '0')}`;
    const invoiceId = Math.random().toString(36).substr(2, 9);
    
    const newInvoice: Invoice = { 
      ...inv, 
      id: invoiceId, 
      invoiceNumber 
    };

    setInvoices(prev => [...prev, newInvoice]);

    setProducts(prev => prev.map(prod => {
      const lineItem = newInvoice.items.find(item => item.productId === prod.id);
      if (lineItem) {
        return { ...prod, stockQuantity: prod.stockQuantity - lineItem.quantity };
      }
      return prod;
    }));

    if (newInvoice.paymentType === 'credit') {
      const currentOutstanding = customers.find(c => c.id === newInvoice.customerId)?.totalOutstanding || 0;
      const newEntry: LedgerEntry = {
        id: Math.random().toString(36).substr(2, 9),
        customerId: newInvoice.customerId,
        date: newInvoice.date,
        refId: invoiceId,
        type: 'invoice',
        description: `Invoice ${invoiceNumber}`,
        debit: newInvoice.total,
        credit: 0,
        balance: currentOutstanding + newInvoice.total
      };
      setLedger(prev => [...prev, newEntry]);
      setCustomers(prev => prev.map(c => c.id === newInvoice.customerId ? { ...c, totalOutstanding: c.totalOutstanding + newInvoice.total } : c));
    }

    // Increment and save the sequence
    updateUser({ nextInvoiceNumber: currentSeq + 1 });

    return newInvoice;
  };

  const addPayment = (pay: Omit<Payment, 'id'>) => {
    const paymentId = Math.random().toString(36).substr(2, 9);
    const newPayment: Payment = { ...pay, id: paymentId };
    setPayments(prev => [...prev, newPayment]);

    const currentOutstanding = customers.find(c => c.id === newPayment.customerId)?.totalOutstanding || 0;
    const newEntry: LedgerEntry = {
      id: Math.random().toString(36).substr(2, 9),
      customerId: newPayment.customerId,
      date: newPayment.date,
      refId: paymentId,
      type: 'payment',
      description: `Payment via ${newPayment.method}`,
      debit: 0,
      credit: newPayment.amount,
      balance: currentOutstanding - newPayment.amount
    };
    setLedger(prev => [...prev, newEntry]);
    setCustomers(prev => prev.map(c => c.id === newPayment.customerId ? { ...c, totalOutstanding: c.totalOutstanding - newPayment.amount } : c));
  };

  const addReminder = (r: Omit<PaymentReminder, 'id' | 'status' | 'createdAt'>) => {
    const newReminder: PaymentReminder = {
      ...r,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setReminders(prev => [...prev, newReminder]);
  };

  const markReminderAsSent = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'sent' } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user, products, customers, invoices, ledger, payments, reminders,
      isAuthenticated: !!user,
      login, signup, logout, updateUser,
      addProduct, updateProduct, deleteProduct, addCustomer, createInvoice, addPayment,
      addReminder, markReminderAsSent, deleteReminder
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
