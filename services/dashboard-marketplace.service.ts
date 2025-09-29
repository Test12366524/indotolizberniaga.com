import { apiSlice } from "./base-query";

// Types for API responses
export interface DashboardHeadData {
  total_customer: number;
  total_seller: number;
  total_transaction: number;
  total_order: number;
}

export interface TransactionChartData {
  month: string;
  total_transaction: number;
  total_order: number;
}

export interface TopSellerData {
  name: string;
  amount: number;
}

export interface TopProductData {
  name: string;
  amount: number;
}

export const dashboardMarketplaceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get Dashboard Head Data
    getDashboardHead: builder.query<DashboardHeadData, void>({
      query: () => ({
        url: `/dashboard/market-place/head`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: DashboardHeadData;
      }) => response.data,
    }),

    // 🔍 Get Transaction Chart Data
    getTransactionChart: builder.query<TransactionChartData[], { year: number }>({
      query: ({ year }) => ({
        url: `/dashboard/market-place/transaction-chart`,
        method: "GET",
        params: { year },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: TransactionChartData[];
      }) => response.data,
    }),

    // 🔍 Get Top Sellers
    getTopSellers: builder.query<TopSellerData[], void>({
      query: () => ({
        url: `/dashboard/market-place/top-seller`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: TopSellerData[];
      }) => response.data,
    }),

    // 🔍 Get Top Products
    getTopProducts: builder.query<TopProductData[], void>({
      query: () => ({
        url: `/dashboard/market-place/top-product`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: TopProductData[];
      }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardHeadQuery,
  useGetTransactionChartQuery,
  useGetTopSellersQuery,
  useGetTopProductsQuery,
} = dashboardMarketplaceApi;
