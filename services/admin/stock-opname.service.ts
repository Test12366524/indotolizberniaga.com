import { apiSlice } from "../base-query";
import { StockOpname, CreateStockOpnameRequest, UpdateStockOpnameRequest } from "@/types/admin/stock-opname";

export const stockOpnameApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Stock Opname (with pagination)
    getStockOpnameList: builder.query<
      {
        data: StockOpname[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number }
    >({
      query: ({ page, paginate }) => ({
        url: `/stock/opname`,
        method: "GET",
        params: {
          page,
          paginate,
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: StockOpname[];
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

    // 🔍 Get Stock Opname by ID
    getStockOpnameById: builder.query<StockOpname, number>({
      query: (id) => ({
        url: `/stock/opname/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: StockOpname;
      }) => response.data,
    }),

    // ➕ Create Stock Opname
    createStockOpname: builder.mutation<StockOpname, CreateStockOpnameRequest>({
      query: (payload) => ({
        url: `/stock/opname`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: StockOpname;
      }) => response.data,
    }),

    // ✏️ Update Stock Opname by ID
    updateStockOpname: builder.mutation<StockOpname, UpdateStockOpnameRequest>({
      query: ({ id, ...payload }) => ({
        url: `/stock/opname/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: StockOpname;
      }) => response.data,
    }),

    // ❌ Delete Stock Opname by ID
    deleteStockOpname: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/stock/opname/${id}`,
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
  useGetStockOpnameListQuery,
  useGetStockOpnameByIdQuery,
  useCreateStockOpnameMutation,
  useUpdateStockOpnameMutation,
  useDeleteStockOpnameMutation,
} = stockOpnameApi;
