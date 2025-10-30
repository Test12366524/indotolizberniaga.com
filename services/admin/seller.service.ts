import { apiSlice } from "../base-query";

export interface SellerMedia {
  id: number;
  model_type: string;
  model_id: number;
  uuid: string;
  collection_name: string;
  name: string;
  file_name: string;
  mime_type: string;
  disk: string;
  conversions_disk: string;
  size: number;
  order_column: number;
  created_at: string;
  updated_at: string;
  original_url: string;
  preview_url: string;
}

export interface SellerShop {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  latitude: string;
  longitude: string;
  rating: string;
  total_reviews: number;
  rajaongkir_province_id: number;
  rajaongkir_city_id: number;
  rajaongkir_district_id: number;
  status: number;
  created_at: string;
  updated_at: string;
  logo: string;
  banner: string;
  media: SellerMedia[];
}

export interface Seller {
  id: number;
  name: string;
  phone: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  anggota_reference: string;
  anggota_status: number;
  shop: SellerShop;
}

export interface SellerListResponse {
  current_page: number;
  data: Seller[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export const sellerService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSellerList: builder.query<
      SellerListResponse,
      { page: number; paginate: number }
    >({
      query: ({ page, paginate }) => ({
        url: `/user/sellers`,
        method: "GET",
        params: {
          page,
          paginate,
        },
      }),
      transformResponse: (response: { code: number; message: string; data: SellerListResponse }) => response.data,
      providesTags: ["Seller"],
    }),
    getSellerShopList: builder.query<
      SellerListResponse,
      { page: number; paginate: number }
    >({
      query: ({ page, paginate }) => ({
        url: `/public/shops`,
        method: "GET",
        params: {
          page,
          paginate,
        },
      }),
      transformResponse: (response: { code: number; message: string; data: SellerListResponse }) => response.data,
      providesTags: ["Seller"],
    }),
  }),
});

export const {
  useGetSellerListQuery,
  useGetSellerShopListQuery,
} = sellerService;
