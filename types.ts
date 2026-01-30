
export interface User {
  id: string;
  name: string;
  email: string;
  shopName: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  nextInvoiceNumber: number;
  invoicePrefix: string;
  primaryColor?: string;
}

export type StockMovementType = 'in' | 'out';

export interface StockMovement {
  id: string;
  type: StockMovementType;
  quantity: number;
  date: string;
  reason: string; // e.g., 'Initial Stock', 'Sale', 'Restock', 'Correction'
  referenceId?: string; // e.g., Invoice ID
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  purchasePrice: number;
  salePrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  movements: StockMovement[]; // Track history of stock changes
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalOutstanding: number;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number; 
  salePrice: number;
  total: number;
}

export type PaymentType = 'cash' | 'credit';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  paymentType: PaymentType;
  notes?: string;
}

export type LedgerEntryType = 'invoice' | 'payment';

export interface LedgerEntry {
  id: string;
  customerId: string;
  date: string;
  refId: string; 
  type: LedgerEntryType;
  description: string;
  debit: number; 
  credit: number; 
  balance: number; 
}

export interface Payment {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  method: string;
  note?: string;
}

export interface PaymentReminder {
  id: string;
  customerId: string;
  scheduledDate: string;
  message: string;
  status: 'pending' | 'sent';
  createdAt: string;
}
