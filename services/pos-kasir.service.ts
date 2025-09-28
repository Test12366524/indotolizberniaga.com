import { apiSlice } from "./base-query";

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

export const posKasirApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all POS transactions
    getPosTransactions: builder.query<PosTransactionResponse, { paginate?: number; page?: number }>({
      query: ({ paginate = 10, page = 1 }) => ({
        url: `transaction/pos?paginate=${paginate}&page=${page}`,
        method: "GET",
      }),
      providesTags: ["PosTransaction"],
    }),

    // Get POS transaction by ID
    getPosTransactionById: builder.query<{ code: number; message: string; data: PosTransaction }, number>({
      query: (id) => ({
        url: `transaction/pos/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "PosTransaction", id }],
    }),

    // Get anggota for POS
    getPosAnggota: builder.query<PosAnggotaResponse, { paginate?: number; page?: number }>({
      query: ({ paginate = 10, page = 1 }) => ({
        url: `transaction/pos/anggota?paginate=${paginate}&page=${page}`,
        method: "GET",
      }),
      providesTags: ["PosAnggota"],
    }),

    // Create POS transaction
    createPosTransaction: builder.mutation<{ code: number; message: string; data: PosTransaction }, CreatePosTransactionRequest>({
      query: (data) => ({
        url: "transaction/pos",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PosTransaction"],
    }),

    // Update POS transaction
    updatePosTransaction: builder.mutation<{ code: number; message: string; data: PosTransaction }, { id: number; data: Partial<CreatePosTransactionRequest> }>({
      query: ({ id, data }) => ({
        url: `transaction/pos/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "PosTransaction", id }, "PosTransaction"],
    }),

    // Update transaction status
    updatePosTransactionStatus: builder.mutation<{ code: number; message: string; data: PosTransaction }, { id: number; status: number }>({
      query: ({ id, status }) => ({
        url: `transaction/pos/${id}/validate`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "PosTransaction", id }, "PosTransaction"],
    }),

    // Delete POS transaction
    deletePosTransaction: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `transaction/pos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "PosTransaction", id }, "PosTransaction"],
    }),
  }),
});

export const {
  useGetPosTransactionsQuery,
  useGetPosTransactionByIdQuery,
  useGetPosAnggotaQuery,
  useCreatePosTransactionMutation,
  useUpdatePosTransactionMutation,
  useUpdatePosTransactionStatusMutation,
  useDeletePosTransactionMutation,
} = posKasirApi;
