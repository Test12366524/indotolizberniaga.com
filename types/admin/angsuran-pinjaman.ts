import { Payment } from "./simpanan";

export interface AngsuranPinjaman {
  id: number;
  pinjaman_id: number;
  pinjaman_detail_id: number;
  reference: string;
  ref_number:number;
  order_id: string;
  amount: number;
  payment_link: string | null;
  expires_at: string | null;
  paid_at: string | null;
  type: string; // case MANUAL = 'manual'; case AUTOMATIC = 'automatic';
  status: number;
  created_at: string;
  updated_at: string;
  user_name: string;
  detail_month: number;
  detail_due_date: string;
  pinjaman_monthly_principal: number;
  pinjaman_monthly_interest: number;
  pinjaman_monthly_installment: number;
  image: File | string | null;
    payment_method: string; // Diisi kalau automatic bank_transfer,qris
    payment_channel: string; // Diisi kalau automatic bca,bni,bri,cimb,qris
    payment: Payment;
}

export type ListEnvelope<T> = {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: T[];
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type ItemEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};