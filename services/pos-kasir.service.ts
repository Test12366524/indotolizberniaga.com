import { CreatePosTransactionRequest, PosAnggotaResponse, PosTransaction, PosTransactionResponse } from "@/types/admin/pos-kasir";
import { apiSlice } from "./base-query";

function compactBody<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as T;
  Object.keys(obj).forEach((k) => {
    const v = obj[k as keyof T];
    if (v !== undefined && v !== null) {
      (out as Record<string, unknown>)[k] = v;
    }
  });
  return out as T;
}

export const posKasirApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all POS transactions
    getPosTransactions: builder.query<
      PosTransactionResponse,
      { paginate?: number; page?: number }
    >({
      query: ({ paginate = 10, page = 1 }) => ({
        url: `transaction/pos?paginate=${paginate}&page=${page}`,
        method: "GET",
      }),
      providesTags: ["PosTransaction"],
    }),

    // Get POS transaction by ID
    getPosTransactionById: builder.query<
      { code: number; message: string; data: PosTransaction },
      number
    >({
      query: (id) => ({
        url: `transaction/pos/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "PosTransaction", id }],
    }),

    // Get anggota for POS
    getPosAnggota: builder.query<
      PosAnggotaResponse,
      { paginate?: number; page?: number }
    >({
      query: ({ paginate = 10, page = 1 }) => ({
        url: `transaction/pos/anggota?paginate=${paginate}&page=${page}`,
        method: "GET",
      }),
      providesTags: ["PosAnggota"],
    }),

    // Create POS transaction
    createPosTransaction: builder.mutation<
      { code: number; message: string; data: PosTransaction },
      CreatePosTransactionRequest
    >({
      query: (raw) => {
        const base = {
          user_id: raw.user_id,
          guest_name: raw.guest_name,
          guest_email: raw.guest_email,
          guest_phone: raw.guest_phone,
          payment_type: raw.payment_type,
          status: raw.status,
          data: raw.data,
          voucher: raw.voucher && raw.voucher.length ? raw.voucher : undefined,
        };

        // Kondisional untuk payment_type
        if (raw.payment_type === "automatic") {
          Object.assign(base, {
            payment_method: raw.payment_method, // required_if automatic
            payment_channel: raw.payment_channel, // required_if automatic
          });
        } else if (raw.payment_type === "saldo") {
          Object.assign(base, {
            wallet_id: raw.wallet_id, // gunakan saat saldo
          });
        }

        return {
          url: "transaction/pos",
          method: "POST",
          body: compactBody(base),
        };
      },
      invalidatesTags: ["PosTransaction"],
    }),

    // Update POS transaction
    updatePosTransaction: builder.mutation<
      { code: number; message: string; data: PosTransaction },
      { id: number; data: Partial<CreatePosTransactionRequest> }
    >({
      query: ({ id, data }) => ({
        url: `transaction/pos/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PosTransaction", id },
        "PosTransaction",
      ],
    }),

    // Update transaction status
    updatePosTransactionStatus: builder.mutation<
      { code: number; message: string; data: PosTransaction },
      { id: number; status: number }
    >({
      query: ({ id, status }) => ({
        url: `transaction/pos/${id}/validate`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PosTransaction", id },
        "PosTransaction",
      ],
    }),

    // Delete POS transaction
    deletePosTransaction: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `transaction/pos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PosTransaction", id },
        "PosTransaction",
      ],
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
