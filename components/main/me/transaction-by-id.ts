export type ApiEnvelope<T> = { code: number; message: string; data: T };

export const isApiEnvelope = <T>(v: unknown): v is ApiEnvelope<T> =>
  typeof v === "object" &&
  v !== null &&
  "data" in (v as Record<string, unknown>);

export interface ShipmentDetail {
  name?: string;
  code?: string;
  service?: string;
  description?: string;
  cost?: number;
  etd?: string;
}

export interface ApiMedia {
  id: number;
  original_url: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  diameter: number;
  rating: number;
  total_reviews: number;
  status: number;
  image?: string;
  media?: ApiMedia[];
}

export interface ApiTransactionItem {
  id: number;
  transaction_id: number;
  transaction_shop_id: number;
  product_id: number;
  price: number;
  quantity: number;
  total: number;
  product?: ApiProduct;
  product_detail: string;
}

export interface ApiTransactionShop {
  id: number;
  transaction_id: number;
  shop_id: number;
  receipt_code: string | null;
  courier: string | null;
  shipment_detail: string | null; // JSON string
  shipment_parameter: string | null;
  total: number;
  shipment_cost: number;
  grand_total: number;
  shipment_status: number;
  details?: ApiTransactionItem[];
}

export type PaymentType = "automatic" | "manual";

export interface ApiTransactionByIdData {
  id: number;
  user_id: number;
  address_line_1: string | null;
  address_line_2: string | null;
  postal_code: string | null;
  reference: string;
  ref_number: number;
  total: number;
  discount_total: number;
  shipment_cost: number;
  grand_total: number;
  status: number; // 0 = menunggu
  payment_type: PaymentType;
  type: string;
  created_at: string;
  updated_at: string;
  shops?: ApiTransactionShop[];
  // Tambahan opsional dari gateway
  payment?: {
    snap_token?: string;
    redirect_url?: string;
    qr_url?: string;
    qr_base64?: string;
    expires_at?: string;
  };
  bank_name: string;
  account_number: string | number;
  account_name: string;
}

// Type guard aman untuk baca .data dari envelope
export function isTxnByIdEnvelope(
  v: unknown
): v is ApiEnvelope<ApiTransactionByIdData> {
  return (
    !!v && typeof v === "object" && "data" in (v as Record<string, unknown>)
  );
}

export const isTxnByIdData = (v: unknown): v is ApiTransactionByIdData => {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === "number" && Array.isArray(o.shops);
};