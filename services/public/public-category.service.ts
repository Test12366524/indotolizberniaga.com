import { apiSlice } from "../base-query";
import { ProductCategory } from "@/types/master/product-category";

export const publicProductCategoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Public Product Categories (with pagination)
    getPublicProductCategoryList: builder.query<
      {
        data: ProductCategory[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; is_parent?: number; parent_id?: number }
    >({
      query: ({ page, paginate, is_parent, parent_id }) => ({
        url: `/public/product-categories`,
        method: "GET",
        params: {
          page,
          paginate,
          ...(is_parent !== undefined && { is_parent }),
          ...(parent_id !== undefined && { parent_id }),
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: ProductCategory[];
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
  }),
  overrideExisting: false,
});

export const { useGetPublicProductCategoryListQuery } =
  publicProductCategoryApi;