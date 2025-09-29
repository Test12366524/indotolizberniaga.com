import { apiSlice } from "./base-query";

// Types for API responses
export interface DashboardKoperasiHeadData {
  total_anggota: number;
  total_simpanan: string;
  total_pinjaman: string;
  total_tagihan_pinjaman_this_month: number;
}

export interface ChartData {
  month: string;
  total: string | number;
}

export const dashboardKoperasiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get Dashboard Head Data
    getDashboardKoperasiHead: builder.query<DashboardKoperasiHeadData, void>({
      query: () => ({
        url: `/dashboard/koperasi/head`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: DashboardKoperasiHeadData;
      }) => response.data,
    }),

    // 🔍 Get Simpanan Chart Data
    getSimpananChart: builder.query<ChartData[], { year: number }>({
      query: ({ year }) => ({
        url: `/dashboard/koperasi/simpanan-chart`,
        method: "GET",
        params: { year },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ChartData[];
      }) => response.data,
    }),

    // 🔍 Get Pinjaman Chart Data
    getPinjamanChart: builder.query<ChartData[], { year: number }>({
      query: ({ year }) => ({
        url: `/dashboard/koperasi/pinjaman-chart`,
        method: "GET",
        params: { year },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ChartData[];
      }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardKoperasiHeadQuery,
  useGetSimpananChartQuery,
  useGetPinjamanChartQuery,
} = dashboardKoperasiApi;
