import { Voucher } from "../voucher";
import { CheckoutPayload } from "./payment";
import { Payment } from "./simpanan";

// Main Transaction interface for API responses
export interface Transaction {
  id: number;
  user_id: number | string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  reference: string;
  ref_number: number;
  total: number;
  discount_total: number;
  shipment_cost: number;
  grand_total: number;
  order_id: string;
  payment_link: string | null;
  expires_at: string;
  paid_at: string | null;
  status: number;
  payment_method?: string;
  payment_proof?: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  address_line_1?: string;
  address_line_2?: string;
  postal_code?: string;
  media?: Array<{ original_url: string }>;
  // An array of stores associated with this transaction
  stores: Store[];
  payment?: Payment;
}

// Interface for a single store within a transaction
export interface Store {
  id: number;
  transaction_id: number;
  shop_id: number;
  receipt_code: string | null;
  courier: string;
  shipment_detail: string; // JSON string
  shipment_cost: number;
  total: number;
  shipment_status: number;
  created_at: string;
  updated_at: string;
  shipment_parameter: string; // JSON string
  shop: {
    id: number;
    name: string;
    slug: string;
    // ... other shop details
  };
  // The items purchased from this store
  details: TransactionItem[];
}

// Interface for each product item in a transaction
export interface TransactionItem {
  id: number;
  transaction_id: number;
  transaction_store_id: number;
  product_id: number;
  product_detail: string; // JSON string containing full product data
  quantity: number;
  price: number;
  total: number;
  created_at: string;
  updated_at: string;
}

// For API service typing (list response)
export interface TransactionListResponse {
  code: number;
  message: string;
  data: Transaction[];
  last_page: number;
  total: number;
}

// For API service typing (single item response)
export interface TransactionDetailResponse {
  code: number;
  message: string;
  data: Transaction;
}

// Update transaction status request
export interface UpdateTransactionStatusRequest {
  id: string; // Assuming ID is passed as string in RTK Query
  status: number;
}

// Transaction list query parameters
export interface TransactionListParams {
  page?: number;
  paginate?: number; // Renamed to match your component
  status?: number;
  search?: string;
}

// Create transaction request payload
export interface CreateTransactionRequest {
  data: Transaction[];
  voucher?: Voucher[]; // Add proper voucher type if needed
}

export type CreateTransactionFrontendRequest = CheckoutPayload;

export interface CreateTransactionFrontendResponse {
  code: number;
  message: string;
  data: Transaction;
}

// Create transaction response
export interface CreateTransactionResponse {
  success: boolean;
  message: string;
  data: Transaction | Transaction[]; // Could be single or multiple transactions
}

export interface CreateTransactionPayload {
  address_line_1: string;
  postal_code: string;
  payment_method: string;
  date?: string;
  hour?: string;
  data: {
    shop_id: number;
    details: {
      product_id: number;
      quantity: number;
    }[];
    shipment?: {
      parameter: string;
      shipment_detail: string;
      courier: string;
      cost: number;
    };
    customer_info: {
      name: string;
      phone: string;
      address_line_1: string;
      postal_code: string;
      province_id: number;
      city_id: number;
      district_id: number;
    };
  }[];
  voucher?: Voucher[];
}