import { apiSlice } from "../base-query";
import { 
  Transaction, 
  CreateTransactionRequest, 
  CreateTransactionResponse 
} from "@/types/admin/transaction";

export const transactionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Transaction Categories (with pagination)
    getTransactionList: builder.query<
      {
        data: Transaction[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; user_id?: number }
    >({
      query: ({ page, paginate, user_id }) => ({
        url: `/transaction`,
        method: "GET",
        params: {
          page,
          paginate,
          user_id
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: Transaction[];
          last_page: number;
          total: number;
          per_page: number;
        };
      }) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Transaction Category by Slug
    getTransactionBySlug: builder.query<Transaction, string>({
      query: (slug) => ({
        url: `/transaction/${slug}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Transaction;
      }) => response.data,
    }),

    getTransactionById: builder.query<Transaction, string>({
      query: (id) => ({
        url: `/transaction/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Transaction;
      }) => response.data,
    }),

    // ➕ Create Transaction (Updated for checkout payload)
    createTransaction: builder.mutation<
      CreateTransactionResponse,
      CreateTransactionRequest
    >({
      query: (payload) => ({
        url: `/transaction`,
        method: "POST",
        body: payload, // Send JSON object instead of FormData
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Transaction | Transaction[];
      }): CreateTransactionResponse => ({
        success: response.code === 200 || response.code === 201,
        message: response.message,
        data: response.data,
      }),
    }),

    // ➕ Create Transaction with FormData (for admin panel if needed)
    createTransactionFormData: builder.mutation<Transaction, FormData>({
      query: (payload) => ({
        url: `/transaction`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Transaction;
      }) => response.data,
    }),

    // ✏️ Update Transaction Category by Slug
    updateTransaction: builder.mutation<
      Transaction,
      { slug: string; payload: FormData }
    >({
      query: ({ slug, payload }) => ({
        url: `/transaction/${slug}?_method=PUT`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Transaction;
      }) => response.data,
    }),

    // 🔄 Update Transaction Status by ID
    updateTransactionStatus: builder.mutation<
      Transaction,
      { id: string; status: number }
    >({
      query: ({ id, status }) => ({
        url: `/transaction/${id}`,
        method: "PUT",
        body: {
          status,
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Transaction;
      }) => response.data,
    }),

    // ❌ Delete Transaction Category by Slug
    deleteTransaction: builder.mutation<
      { code: number; message: string },
      string
    >({
      query: (slug) => ({
        url: `/transaction/${slug}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTransactionListQuery,
  useGetTransactionBySlugQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useCreateTransactionFormDataMutation, // New export for FormData version
  useUpdateTransactionMutation,
  useUpdateTransactionStatusMutation,
  useDeleteTransactionMutation,
} = transactionApi;