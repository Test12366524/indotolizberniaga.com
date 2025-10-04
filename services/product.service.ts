import { apiSlice } from "./base-query";
import { Product } from "@/types/admin/product"; 

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Products (with pagination)
    getProductList: builder.query<
      {
        data: Product[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number }
    >({
      query: ({ page, paginate }) => ({
        url: `/shop/products`,
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
          data: Product[];
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

    getProductListPublic: builder.query<
      {
        data: Product[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number, merk_id?: number }
    >({
      query: ({ page, paginate, merk_id }) => ({
        url: `/public/products`,
        method: "GET",
        params: {
          page,
          paginate,
          ...(merk_id !== undefined ? { "product_merk_id[0]": merk_id } : {}),
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: Product[];
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

    // 🔍 Get Product by Slug
    getProductBySlug: builder.query<Product, string>({
      query: (slug) => ({
        url: `/shop/products/${slug}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Product;
      }) => response.data,
    }),

    // ➕ Create Product
    createProduct: builder.mutation<Product, FormData>({
      query: (payload) => ({
        url: `/shop/products`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Product;
      }) => response.data,
    }),

    // ✏️ Update Product by Slug
    updateProduct: builder.mutation<
      Product,
      { slug: string; payload: FormData }
    >({
      query: ({ slug, payload }) => ({
        url: `/shop/products/${slug}?_method=PUT`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Product;
      }) => response.data,
    }),

    // ❌ Delete Product by Slug
    deleteProduct: builder.mutation<
      { code: number; message: string },
      string
    >({
      query: (slug) => ({
        url: `/shop/products/${slug}`,
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
  useGetProductListQuery,
  useGetProductListPublicQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;