import { apiSlice } from "../base-query";
import { 
  PinjamanCategory, 
  PinjamanCategoryResponse, 
  CreatePinjamanCategoryRequest, 
  UpdatePinjamanCategoryRequest 
} from "@/types/master/pinjaman-category";

export const pinjamanCategoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Pinjaman Categories (with pagination)
    getPinjamanCategoryList: builder.query<
      {
        data: PinjamanCategory[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number }
    >({
      query: ({ page, paginate }) => ({
        url: `/master/pinjaman-categories`,
        method: "GET",
        params: {
          page,
          paginate,
        },
      }),
      transformResponse: (response: PinjamanCategoryResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Pinjaman Category by ID
    getPinjamanCategoryById: builder.query<PinjamanCategory, number>({
      query: (id) => ({
        url: `/master/pinjaman-categories/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PinjamanCategory;
      }) => response.data,
    }),

    // ➕ Create Pinjaman Category
    createPinjamanCategory: builder.mutation<
      PinjamanCategory, 
      CreatePinjamanCategoryRequest
    >({
      query: (payload) => ({
        url: `/master/pinjaman-categories`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PinjamanCategory;
      }) => response.data,
    }),

    // ✏️ Update Pinjaman Category by ID
    updatePinjamanCategory: builder.mutation<
      PinjamanCategory,
      { id: number; payload: UpdatePinjamanCategoryRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/master/pinjaman-categories/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PinjamanCategory;
      }) => response.data,
    }),

    // ❌ Delete Pinjaman Category by ID
    deletePinjamanCategory: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/master/pinjaman-categories/${id}`,
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
  useGetPinjamanCategoryListQuery,
  useGetPinjamanCategoryByIdQuery,
  useCreatePinjamanCategoryMutation,
  useUpdatePinjamanCategoryMutation,
  useDeletePinjamanCategoryMutation,
} = pinjamanCategoryApi;
