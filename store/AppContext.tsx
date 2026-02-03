
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Customer, Invoice, LedgerEntry, Payment, PaymentReminder, User, StockMovement, Vendor, VendorLedgerEntry } from '../types';

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
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, shopName: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addProduct: (product: Omit<Product, 'id' | 'movements' | 'createdAt'>) => void;
  updateProduct: (product: Product, movementReason?: string) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalOutstanding'>) => void;
  addVendor: (vendor: Omit<Vendor, 'id' | 'totalBalance'>) => void;
  updateVendor: (vendor: Vendor) => void;
  deleteVendor: (id: string) => void;
  addVendorPayment: (payment: { vendorId: string, amount: number, method: string, date: string, note?: string }) => void;
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
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [vendorLedger, setVendorLedger] = useState<VendorLedgerEntry[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('inventory_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const now = new Date().toISOString();
    
    const demoVendors: Vendor[] = [
      { id: 'v1', name: 'Global Foods Ltd', contactPerson: 'Mark Supplier', phone: '555-9000', email: 'sales@globalfoods.com', address: 'Industrial Area Phase 1', totalBalance: 5000 },
      { id: 'v2', name: 'Agro Distributors', contactPerson: 'Sarah Seed', phone: '555-8000', email: 'sarah@agro.com', address: 'North Farm Road', totalBalance: 0 }
    ];

    const demoProducts: Product[] = [
      { 
        id: '1', name: 'Premium Rice 5kg', sku: 'RICE-001', purchasePrice: 400, salePrice: 550, stockQuantity: 50, lowStockThreshold: 10, createdAt: now,
        vendorId: 'v1', vendorName: 'Global Foods Ltd',
        movements: [{ id: 'm1', type: 'in', quantity: 50, date: now, reason: 'Initial Stock' }]
      },
      { 
        id: '2', name: 'Cooking Oil 1L', sku: 'OIL-102', purchasePrice: 150, salePrice: 185, stockQuantity: 8, lowStockThreshold: 10, createdAt: now,
        vendorId: 'v1', vendorName: 'Global Foods Ltd',
        movements: [{ id: 'm2', type: 'in', quantity: 8, date: now, reason: 'Initial Stock' }]
      },
    ];
    
    const demoCustomers: Customer[] = [
      { id: 'c1', name: 'John Doe', phone: '555-0101', address: '123 Main St', totalOutstanding: 1500 },
    ];

    const demoVendorLedger: VendorLedgerEntry[] = [
      {
        id: 'vl-init-1',
        vendorId: 'v1',
        date: new Date(Date.now() - 86400000 * 10).toISOString(),
        refId: 'PB-001',
        type: 'purchase',
        description: 'Opening Balance (Initial Inventory)',
        debit: 0,
        credit: 5000,
        balance: 5000
      }
    ];

    setVendors(demoVendors);
    setProducts(demoProducts);
    setCustomers(demoCustomers);
    setVendorLedger(demoVendorLedger);
  }, []);

  const login = async (email: string, password: string) => {
    const mockUser: User = { 
      id: 'u1', name: 'Admin User', email, shopName: 'My Premium Shop', address: 'Industrial Area, Islamabad', phone: '+92 300 1234567', nextInvoiceNumber: 1, invoicePrefix: 'INV', primaryColor: '#2563eb'
    };
    setUser(mockUser);
    localStorage.setItem('inventory_user', JSON.stringify(mockUser));
  };

  const signup = async (name: string, email: string, shopName: string, password: string) => {
    const mockUser: User = { 
      id: 'u1', name, email, shopName, address: '', phone: '', nextInvoiceNumber: 1, invoicePrefix: 'INV', primaryColor: '#2563eb'
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
    
    setVendors(prevVendors => {
      const vendor = prevVendors.find(v => v.id === pay.vendorId);
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
      return prevVendors.map(v => v.id === pay.vendorId ? { ...v, totalBalance: newBalance } : v);
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
      ...p, id: productId, createdAt: now, movements: [newMovement]
    };

    // Record in vendor ledger if vendor selected
    if (p.vendorId && p.stockQuantity > 0) {
      const cost = p.purchasePrice * p.stockQuantity;
      setVendors(prevVendors => {
        const vendor = prevVendors.find(v => v.id === p.vendorId);
        const currentBalance = vendor?.totalBalance || 0;
        const newBalance = currentBalance + cost;

        const newEntry: VendorLedgerEntry = {
          id: Math.random().toString(36).substr(2, 9),
          vendorId: p.vendorId!,
          date: now,
          refId: productId,
          type: 'purchase',
          description: `Initial Stock: ${p.name} (x${p.stockQuantity})`,
          debit: 0,
          credit: cost,
          balance: newBalance
        };

        setVendorLedger(prev => [...prev, newEntry]);
        return prevVendors.map(v => v.id === p.vendorId ? { ...v, totalBalance: newBalance } : v);
      });
    }

    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (p: Product, movementReason: string = 'Update') => {
    setProducts(prevProducts => prevProducts.map(item => {
      if (item.id === p.id) {
        const diff = p.stockQuantity - item.stockQuantity;
        const movements = [...item.movements];
        const now = new Date().toISOString();
        
        if (diff !== 0) {
          movements.push({
            id: Math.random().toString(36).substr(2, 9),
            type: diff > 0 ? 'in' : 'out',
            quantity: Math.abs(diff),
            date: now,
            reason: movementReason
          });

          // If stock increased and vendor is linked, record as purchase
          if (diff > 0 && p.vendorId) {
            const cost = p.purchasePrice * diff;
            setVendors(prevVendors => {
              const vendor = prevVendors.find(v => v.id === p.vendorId);
              const currentBalance = vendor?.totalBalance || 0;
              const newBalance = currentBalance + cost;

              const newEntry: VendorLedgerEntry = {
                id: Math.random().toString(36).substr(2, 9),
                vendorId: p.vendorId!,
                date: now,
                refId: `PUR-${p.sku}`,
                type: 'purchase',
                description: `Stock Purchase: ${p.name} (x${diff})`,
                debit: 0,
                credit: cost,
                balance: newBalance
              };

              setVendorLedger(prevLedger => [...prevLedger, newEntry]);
              return prevVendors.map(v => v.id === p.vendorId ? { ...v, totalBalance: newBalance } : v);
            });
          }
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
    const transactionDate = inv.date || new Date().toISOString();

    const itemsWithCost = inv.items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return { ...item, purchasePrice: prod ? prod.purchasePrice : 0 };
    });

    const newInvoice: Invoice = { ...inv, date: transactionDate, items: itemsWithCost, id: invoiceId, invoiceNumber };

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
        return { ...prod, stockQuantity: Math.max(0, prod.stockQuantity - soldItem.quantity), movements: [...prod.movements, newMovement] };
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
      return prevCustomers.map(c => c.id === newInvoice.customerId ? { ...c, totalOutstanding: c.totalOutstanding + netDebt } : c);
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
      return prevCustomers.map(c => c.id === newPayment.customerId ? { ...c, totalOutstanding: c.totalOutstanding - newPayment.amount } : c);
    });
  };

  const addReminder = (r: Omit<PaymentReminder, 'id' | 'status' | 'createdAt'>) => {
    const newReminder: PaymentReminder = { ...r, id: Math.random().toString(36).substr(2, 9), status: 'pending', createdAt: new Date().toISOString() };
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
      user, products, customers, vendors, invoices, ledger, vendorLedger, payments, reminders,
      isAuthenticated: !!user,
      login, signup, logout, updateUser,
      addProduct, updateProduct, deleteProduct, addCustomer,
      addVendor, updateVendor, deleteVendor, addVendorPayment,
      createInvoice, addPayment,
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
