
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Customer, Invoice, LedgerEntry, Payment, PaymentReminder, User, StockMovement } from '../types';

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
  addProduct: (product: Omit<Product, 'id' | 'movements' | 'createdAt'>) => void;
  updateProduct: (product: Product, movementReason?: string) => void;
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

  useEffect(() => {
    const savedUser = localStorage.getItem('inventory_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const now = new Date().toISOString();
    const demoProducts: Product[] = [
      { 
        id: '1', name: 'Premium Rice 5kg', sku: 'RICE-001', purchasePrice: 400, salePrice: 550, stockQuantity: 50, lowStockThreshold: 10, createdAt: now,
        movements: [{ id: 'm1', type: 'in', quantity: 50, date: now, reason: 'Initial Stock' }]
      },
      { 
        id: '2', name: 'Cooking Oil 1L', sku: 'OIL-102', purchasePrice: 150, salePrice: 185, stockQuantity: 8, lowStockThreshold: 10, createdAt: now,
        movements: [{ id: 'm2', type: 'in', quantity: 8, date: now, reason: 'Initial Stock' }]
      },
      { 
        id: '3', name: 'Tea Leaves 250g', sku: 'TEA-45', purchasePrice: 80, salePrice: 110, stockQuantity: 100, lowStockThreshold: 20, createdAt: now,
        movements: [{ id: 'm3', type: 'in', quantity: 100, date: now, reason: 'Initial Stock' }]
      },
    ];
    
    const demoCustomers: Customer[] = [
      { id: 'c1', name: 'John Doe', phone: '555-0101', address: '123 Main St', totalOutstanding: 1500 },
      { id: 'c2', name: 'Jane Smith', phone: '555-0202', address: '456 Oak Ave', totalOutstanding: 0 },
    ];

    const demoLedger: LedgerEntry[] = [
      {
        id: 'l-init-1',
        customerId: 'c1',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        refId: 'OB-001',
        type: 'invoice',
        description: 'Opening Balance',
        debit: 1500,
        credit: 0,
        balance: 1500
      }
    ];

    setProducts(demoProducts);
    setCustomers(demoCustomers);
    setLedger(demoLedger);
  }, []);

  const login = async (email: string, password: string) => {
    const mockUser: User = { 
      id: 'u1', 
      name: 'Admin User', 
      email, 
      shopName: 'My Premium Shop',
      address: 'Building 40, Street 5, Blue Area, Islamabad',
      phone: '+92 300 1234567',
      nextInvoiceNumber: 1,
      invoicePrefix: 'INV',
      primaryColor: '#2563eb'
    };
    setUser(mockUser);
    localStorage.setItem('inventory_user', JSON.stringify(mockUser));
  };

  const signup = async (name: string, email: string, shopName: string, password: string) => {
    const mockUser: User = { 
      id: 'u1', 
      name, 
      email, 
      shopName,
      address: '',
      phone: '',
      nextInvoiceNumber: 1,
      invoicePrefix: 'INV',
      primaryColor: '#2563eb'
    };
    setUser(mockUser);
    localStorage.setItem('inventory_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('inventory_user');
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('inventory_user', JSON.stringify(updated));
      return updated;
    });
  };

  const addProduct = (p: Omit<Product, 'id' | 'movements' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const productId = Math.random().toString(36).substr(2, 9);
    const newMovement: StockMovement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'in',
      quantity: p.stockQuantity,
      date: now,
      reason: 'Initial Stock Addition'
    };
    const newProduct: Product = { 
      ...p, 
      id: productId, 
      createdAt: now,
      movements: [newMovement]
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (p: Product, movementReason: string = 'Update') => {
    setProducts(prev => prev.map(item => {
      if (item.id === p.id) {
        const diff = p.stockQuantity - item.stockQuantity;
        const movements = [...item.movements];
        
        if (diff !== 0) {
          movements.push({
            id: Math.random().toString(36).substr(2, 9),
            type: diff > 0 ? 'in' : 'out',
            quantity: Math.abs(diff),
            date: new Date().toISOString(),
            reason: movementReason
          });
        }
        
        return { ...p, movements };
      }
      return item;
    }));
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
    const prefix = user?.invoicePrefix || 'INV';
    const invoiceNumber = `${prefix}-${currentSeq.toString().padStart(5, '0')}`;
    const invoiceId = Math.random().toString(36).substr(2, 9);
    
    // Use user-provided date or fallback to now
    const transactionDate = inv.date || new Date().toISOString();

    const itemsWithCost = inv.items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        ...item,
        purchasePrice: prod ? prod.purchasePrice : 0
      };
    });

    const newInvoice: Invoice = { 
      ...inv, 
      date: transactionDate,
      items: itemsWithCost,
      id: invoiceId, 
      invoiceNumber 
    };

    // 1. ATOMIC INVENTORY REDUCTION & MOVEMENT LOGGING
    setProducts(prevProducts => prevProducts.map(prod => {
      const soldItem = inv.items.find(item => item.productId === prod.id);
      if (soldItem) {
        const newMovement: StockMovement = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'out',
          quantity: soldItem.quantity,
          date: transactionDate,
          reason: `Sale (Invoice ${invoiceNumber})`,
          referenceId: invoiceId
        };
        return { 
          ...prod, 
          stockQuantity: Math.max(0, prod.stockQuantity - soldItem.quantity),
          movements: [...prod.movements, newMovement]
        };
      }
      return prod;
    }));

    setInvoices(prev => [...prev, newInvoice]);

    const netDebt = newInvoice.total - newInvoice.paidAmount;
    setCustomers(prevCustomers => {
      const targetCustomer = prevCustomers.find(c => c.id === newInvoice.customerId);
      const currentOutstanding = targetCustomer?.totalOutstanding || 0;
      
      const newEntry: LedgerEntry = {
        id: Math.random().toString(36).substr(2, 9),
        customerId: newInvoice.customerId,
        date: newInvoice.date,
        refId: invoiceId,
        type: 'invoice',
        description: `Invoice ${invoiceNumber}${newInvoice.paidAmount > 0 ? ` (Received Rs. ${newInvoice.paidAmount})` : ''}`,
        debit: newInvoice.total,
        credit: newInvoice.paidAmount,
        balance: currentOutstanding + netDebt
      };
      
      setLedger(prevLedger => [...prevLedger, newEntry]);
      return prevCustomers.map(c => 
        c.id === newInvoice.customerId ? { ...c, totalOutstanding: c.totalOutstanding + netDebt } : c
      );
    });

    updateUser({ nextInvoiceNumber: currentSeq + 1 });
    return newInvoice;
  };

  const addPayment = (pay: Omit<Payment, 'id'>) => {
    const paymentId = Math.random().toString(36).substr(2, 9);
    const newPayment: Payment = { ...pay, id: paymentId };
    setPayments(prev => [...prev, newPayment]);

    setCustomers(prevCustomers => {
      const targetCustomer = prevCustomers.find(c => c.id === newPayment.customerId);
      const currentOutstanding = targetCustomer?.totalOutstanding || 0;
      
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
      
      setLedger(prevLedger => [...prevLedger, newEntry]);
      return prevCustomers.map(c => 
        c.id === newPayment.customerId ? { ...c, totalOutstanding: c.totalOutstanding - newPayment.amount } : c
      );
    });
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
