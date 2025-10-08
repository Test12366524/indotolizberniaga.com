import { apiSlice } from "../base-query";
import {
  Supplier,
  SupplierResponse,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "@/types/master/supplier";

export const supplierApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Supplier (with pagination)
    getSupplierList: builder.query<
      {
        data: Supplier[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string }
    >({
      query: ({ page, paginate, search }) => ({
        url: `/master/suppliers`,
        method: "GET",
        params: {
          page,
          paginate,
          ...(search ? { search } : {}),
        },
      }),
      transformResponse: (response: SupplierResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Simpanan Category by ID
    getSupplierById: builder.query<Supplier, number>({
      query: (id) => ({
        url: `/master/suppliers/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Supplier;
      }) => response.data,
    }),

    // ➕ Create Simpanan Category
    createSupplier: builder.mutation<Supplier, CreateSupplierRequest>({
      query: (payload) => ({
        url: `/master/suppliers`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Supplier;
      }) => response.data,
    }),

    // ✏️ Update Simpanan Category by ID
    updateSupplier: builder.mutation<
      Supplier,
      { id: number; payload: UpdateSupplierRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/master/suppliers/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Supplier;
      }) => response.data,
    }),

    // ❌ Delete Simpanan Category by ID
    deleteSupplier: builder.mutation<{ code: number; message: string }, number>(
      {
        query: (id) => ({
          url: `/master/suppliers/${id}`,
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
  useGetSupplierListQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi;
