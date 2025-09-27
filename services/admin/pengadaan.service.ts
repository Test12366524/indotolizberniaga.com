import { apiSlice } from "../base-query";
import { PurchaseOrder, CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest } from "@/types/admin/pengadaan";

export const pengadaanApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Purchase Orders (with pagination)
    getPurchaseOrderList: builder.query<
      {
        data: PurchaseOrder[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number }
    >({
      query: ({ page, paginate }) => ({
        url: `/po/purchase-orders`,
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
          data: PurchaseOrder[];
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

    // 🔍 Get Purchase Order by ID
    getPurchaseOrderById: builder.query<PurchaseOrder, number>({
      query: (id) => ({
        url: `/po/purchase-orders/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PurchaseOrder;
      }) => response.data,
    }),

    // ➕ Create Purchase Order
    createPurchaseOrder: builder.mutation<PurchaseOrder, CreatePurchaseOrderRequest>({
      query: (payload) => ({
        url: `/po/purchase-orders`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PurchaseOrder;
      }) => response.data,
    }),

    // ✏️ Update Purchase Order by ID
    updatePurchaseOrder: builder.mutation<PurchaseOrder, UpdatePurchaseOrderRequest>({
      query: ({ id, ...payload }) => ({
        url: `/po/purchase-orders/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PurchaseOrder;
      }) => response.data,
    }),

    // ❌ Delete Purchase Order by ID
    deletePurchaseOrder: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/po/purchase-orders/${id}`,
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
  useGetPurchaseOrderListQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} = pengadaanApi;
