import { Payment } from "./simpanan";

export interface PosTransaction {
  id: number;
  user_id: number | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  postal_code: string | null;
  reference: string;
  ref_number: string;
  total: number;
  discount_total: number;
  shipment_cost: number;
  grand_total: number;
  order_id: string;
  payment_link: string | null;
  expires_at: string;
  paid_at: string | null;
  status: number;
  payment_type: "automatic" | "manual" | "saldo";
  type: "offline";
  created_at: string;
  updated_at: string;
  user_name: string | null;
  user_email: string | null;

  payment?: Payment | null;
}

export interface PosTransactionResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: PosTransaction[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface PosAnggota {
  user_id: number;
  reference: string;
  name: string;
  email: string;
  id: number;
  wallet_name: string;
  balance: number;
}

export interface PosAnggotaResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    current_page_url: string;
    data: PosAnggota[];
    first_page_url: string;
    from: number;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
  };
}

export interface CreatePosTransactionRequest {
  user_id?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  payment_type: "automatic" | "manual" | "saldo";
  wallet_id?: number;
  payment_method?: "bank_transfer" | "qris";
  payment_channel?: "bca" | "bni" | "bri" | "cimb" | "qris";
  status: number;
  data: Array<{
    shop_id: number;
    details: Array<{
      product_id: number;
      quantity: number;
    }>;
  }>;
  voucher?: number[];
}
export interface UpdateStatusRequest {
  status: number;
}

export type PaymentMethod = "bank_transfer" | "qris";
export type PaymentChannel = "bca" | "bni" | "bri" | "cimb" | "qris";