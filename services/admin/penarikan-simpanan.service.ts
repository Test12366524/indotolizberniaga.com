import { apiSlice } from "../base-query";
import {
  PenarikanSimpanan,
  PenarikanSimpananResponse,
  CreatePenarikanSimpananRequest,
  UpdatePenarikanSimpananRequest,
  Wallet,
  WalletResponse,
} from "@/types/admin/penarikan-simpanan";

const penarikanSimpananApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Penarikan Simpanan (with pagination)
    getPenarikanSimpananList: builder.query<
      {
        data: PenarikanSimpanan[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number }
    >({
      query: ({ page, paginate }) => ({
        url: `/wallet/withdrawals`,
        method: "GET",
        params: {
          page,
          paginate,
        },
      }),
      transformResponse: (response: PenarikanSimpananResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),
    // ➕ Create Penarikan Simpanan
    createPenarikanSimpanan: builder.mutation<
      PenarikanSimpanan,
      CreatePenarikanSimpananRequest
    >({
      query: (payload) => ({
        url: `/wallet/withdrawals`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PenarikanSimpanan;
      }) => response.data,
    }),
    // ✏️ Update Penarikan Simpanan by ID
    updatePenarikanSimpanan: builder.mutation<
      PenarikanSimpanan,
      { id: number; payload: UpdatePenarikanSimpananRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/wallet/withdrawals/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PenarikanSimpanan;
      }) => response.data,
    }),
    // ❌ Delete Penarikan Simpanan by ID
    deletePenarikanSimpanan: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/wallet/withdrawals/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => response,
    }),
    // 🔄 Update Status Penarikan
    updatePenarikanStatus: builder.mutation<
      PenarikanSimpanan,
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/wallet/withdrawals/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PenarikanSimpanan;
      }) => response.data,
    }),

    getWalletList: builder.query<
      {
        data: Wallet[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; user_id?: number }
    >({
      query: ({ page, paginate, user_id }) => ({
        url: `/wallet`,
        method: "GET",
        params: {
          page,
          paginate,
          user_id, // 🟡 kirim user_id ke params jika ada
        },
      }),
      transformResponse: (response: WalletResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),
  }),
});

export const {
  useGetPenarikanSimpananListQuery,
  useCreatePenarikanSimpananMutation,
  useUpdatePenarikanSimpananMutation,
  useDeletePenarikanSimpananMutation,
  useUpdatePenarikanStatusMutation,
  useGetWalletListQuery,
} = penarikanSimpananApi;
