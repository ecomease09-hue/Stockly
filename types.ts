
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
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  purchasePrice: number;
  salePrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
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
  refId: string; // InvoiceId or PaymentId
  type: LedgerEntryType;
  description: string;
  debit: number; // Charges
  credit: number; // Payments
  balance: number; // Running balance
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
