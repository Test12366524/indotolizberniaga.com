import { apiSlice } from "./base-query";

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

export interface CreatePaymentRequest {
  pinjaman_id: number;
  pinjaman_detail_id: number;
  amount: number;
  type: 'manual' | 'automatic';
  image?: File;
}

export const installmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get installments by pinjaman ID
    getInstallmentsByPinjaman: builder.query<InstallmentResponse, { 
      pinjaman_id: number; 
      paginate?: number; 
      page?: number 
    }>({
      query: ({ pinjaman_id, paginate = 100, page = 1 }) => ({
        url: `pinjaman/${pinjaman_id}/installments?paginate=${paginate}&page=${page}`,
        method: "GET",
      }),
      providesTags: (result, error, { pinjaman_id }) => [
        { type: "Installment", id: pinjaman_id },
        "Installment"
      ],
    }),

    // Mark installment as paid
    markInstallmentAsPaid: builder.mutation<{ code: number; message: string; data: Installment }, MarkAsPaidRequest>({
      query: ({ installment_id, paid_date }) => ({
        url: `installments/${installment_id}/mark-paid`,
        method: "PUT",
        body: { paid_date },
      }),
      invalidatesTags: (result, error, { installment_id }) => [
        { type: "Installment", id: installment_id },
        "Installment"
      ],
    }),

    // Upload payment proof
    uploadPaymentProof: builder.mutation<{ code: number; message: string; data: Installment }, PaymentProofRequest>({
      query: ({ installment_id, payment_proof }) => {
        const formData = new FormData();
        formData.append('payment_proof', payment_proof);
        formData.append('installment_id', installment_id.toString());
        
        return {
          url: `installments/${installment_id}/upload-proof`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { installment_id }) => [
        { type: "Installment", id: installment_id },
        "Installment"
      ],
    }),

    // Generate installments for a loan (if not exists)
    generateInstallments: builder.mutation<{ code: number; message: string; data: Installment[] }, { pinjaman_id: number }>({
      query: ({ pinjaman_id }) => ({
        url: `pinjaman/${pinjaman_id}/generate-installments`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { pinjaman_id }) => [
        { type: "Installment", id: pinjaman_id },
        "Installment"
      ],
    }),

    // Create payment
    createPayment: builder.mutation<{ code: number; message: string; data: any }, CreatePaymentRequest>({
      query: ({ pinjaman_id, pinjaman_detail_id, amount, type, image }) => {
        const formData = new FormData();
        formData.append('pinjaman_id', pinjaman_id.toString());
        formData.append('pinjaman_detail_id', pinjaman_detail_id.toString());
        formData.append('amount', amount.toString());
        formData.append('type', type);
        if (image) {
          formData.append('image', image);
        }
        
        return {
          url: `pinjaman/payment`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { pinjaman_id }) => [
        { type: "Installment", id: pinjaman_id },
        "Installment"
      ],
    }),
  }),
});

export const {
  useGetInstallmentsByPinjamanQuery,
  useMarkInstallmentAsPaidMutation,
  useUploadPaymentProofMutation,
  useGenerateInstallmentsMutation,
  useCreatePaymentMutation,
} = installmentApi;
