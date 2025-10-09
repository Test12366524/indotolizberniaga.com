import { apiSlice } from "../base-query";
import {
  Transaksi,
  TransaksiResponse,
  CreateTransaksiRequest,
  UpdateTransaksiRequest,
} from "@/types/ppob/transaksi";

export const transaksiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Transaksi (with pagination)
    getTransaksiList: builder.query<
      {
        data: Transaksi[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string }
    >({
      query: ({ page, paginate, search }) => ({
        url: `/digiflazz/topups`,
        method: "GET",
        params: {
          page,
          paginate,
          ...(search ? { search } : {}),
        },
      }),
      transformResponse: (response: TransaksiResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Simpanan Category by ID
    getTransaksiById: builder.query<Transaksi, number>({
      query: (id) => ({
        url: `/digiflazz/topups/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Transaksi;
      }) => response.data,
    }),

    // ➕ Create Simpanan Category
    createTransaksi: builder.mutation<Transaksi, CreateTransaksiRequest>({
      query: (payload) => ({
        url: `/digiflazz/topups`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Transaksi;
      }) => response.data,
    }),

    // ✏️ Update Simpanan Category by ID
    updateTransaksi: builder.mutation<
      Transaksi,
      { id: number; payload: UpdateTransaksiRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/digiflazz/topups/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Transaksi;
      }) => response.data,
    }),

    // ❌ Delete Simpanan Category by ID
    deleteTransaksi: builder.mutation<{ code: number; message: string }, number>(
      {
        query: (id) => ({
          url: `/digiflazz/topups/${id}`,
          method: "DELETE",
        }),
        transformResponse: (response: {
          code: number;
          message: string;
          data: null;
        }) => response,
      }
    ),
  }),
  overrideExisting: false,
});

export const {
  useGetTransaksiListQuery,
  useGetTransaksiByIdQuery,
  useCreateTransaksiMutation,
  useUpdateTransaksiMutation,
  useDeleteTransaksiMutation,
} = transaksiApi;
