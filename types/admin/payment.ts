export type CheckoutDetail = { product_id: number; quantity: number };

export type CheckoutShipment = {
  parameter: string; // JSON.stringify dari param ongkir
  shipment_detail: string; // JSON.stringify dari detail layanan terpilih
  courier: string; // jne | ...
  cost: number; // biaya
};

export type CheckoutItem = {
  shop_id: number;
  details: CheckoutDetail[];
  shipment: CheckoutShipment;
};

export type CheckoutPayload = {
  address_line_1: string;
  address_line_2?: string | null;
  postal_code: string;
  payment_type: "automatic" | "saldo"; // automatic=online gateway, saldo=manual
  payment_method?: string; // required_if automatic (bank_transfer|qris)
  payment_channel?: string; // required_if automatic (bca|bni|bri|cimb|qris)
  data: CheckoutItem[];
  voucher?: number[];
};

export type TxnPayment = {
  id: number;
  payment_type: string;     // "bank_transfer" | "qris" | ...
  channel?: string | null;  // "bca" | "bni" | "qris" | ...
  account_number?: string | null;
  expired_at?: string;
  paid_at?: string | null;
  amount?: number;
};

export type TxnDetailExtra = {
  payment?: TxnPayment | null;
  payment_link?: string | null;
  paid_at?: string | null;
  status?: number | string;               // backend bisa number/string
  payment_type?: "automatic" | "saldo";   // dari payload create
};