import { apiSlice } from "../base-query";
import {
  Deposit,
  DepositResponse,
  CreateDepositRequest,
  UpdateDepositRequest,
} from "@/types/ppob/deposit";

export const depositApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Deposit (with pagination)
    getDepositList: builder.query<
      {
        data: Deposit[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string }
    >({
      query: ({ page, paginate, search }) => ({
        url: `/digiflazz/deposit`,
        method: "GET",
        params: {
          page,
          paginate,
          ...(search ? { search } : {}),
        },
      }),
      transformResponse: (response: DepositResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Simpanan Category by ID
    getDepositById: builder.query<Deposit, number>({
      query: (id) => ({
        url: `/digiflazz/deposit/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Deposit;
      }) => response.data,
    }),

    // ➕ Create Simpanan Category
    createDeposit: builder.mutation<Deposit, CreateDepositRequest>({
      query: (payload) => ({
        url: `/digiflazz/deposit`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Deposit;
      }) => response.data,
    }),

    // ✏️ Update Simpanan Category by ID
    updateDeposit: builder.mutation<
      Deposit,
      { id: number; payload: UpdateDepositRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/digiflazz/deposit/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Deposit;
      }) => response.data,
    }),

    // ❌ Delete Simpanan Category by ID
    deleteDeposit: builder.mutation<{ code: number; message: string }, number>(
      {
        query: (id) => ({
          url: `/digiflazz/deposit/${id}`,
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
  useGetDepositListQuery,
  useGetDepositByIdQuery,
  useCreateDepositMutation,
  useUpdateDepositMutation,
  useDeleteDepositMutation,
} = depositApi;
