export interface Installment {
  id: number;
  pinjaman_id: number;
  installment_number: number; // bulan ke berapa
  amount: number; // nominal angsuran
  due_date: string; // tanggal jatuh tempo
  paid_date?: string; // tanggal dibayar
  status: "pending" | "paid" | "overdue"; // status pembayaran
  payment_proof?: string; // bukti pembayaran
  created_at: string;
  updated_at: string;
}

export interface InstallmentResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Installment[];
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

export interface PaymentProofRequest {
  installment_id: number;
  payment_proof: File;
}

export interface MarkAsPaidRequest {
  installment_id: number;
  paid_date: string;
}

export const INSTALLMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  OVERDUE: "overdue",
} as const;

export const INSTALLMENT_STATUS_LABELS = {
  [INSTALLMENT_STATUS.PENDING]: "Belum Dibayar",
  [INSTALLMENT_STATUS.PAID]: "Sudah Dibayar",
  [INSTALLMENT_STATUS.OVERDUE]: "Terlambat",
} as const;

export const INSTALLMENT_STATUS_VARIANTS = {
  [INSTALLMENT_STATUS.PENDING]: "destructive" as const,
  [INSTALLMENT_STATUS.PAID]: "success" as const,
  [INSTALLMENT_STATUS.OVERDUE]: "destructive" as const,
} as const;
