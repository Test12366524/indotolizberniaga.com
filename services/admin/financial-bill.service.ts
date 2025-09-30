import { apiSlice } from "../base-query";

export interface FinancialBill {
  id: number;
  pinjaman_id: number;
  month: number;
  paid: number;
  remaining: number;
  due_date: string;
  paid_at: string | null;
  description: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  anggota_reference: string;
  anggota_name: string;
  anggota_nik: string;
  pinjaman_reference: string;
  pinjaman_nominal: number;
  pinjaman_interest_rate: number;
  pinjaman_monthly_principal: number;
  pinjaman_monthly_interest: number;
  pinjaman_monthly_installment: number;
}

export interface FinancialBillListResponse {
  current_page: number;
  current_page_url: string;
  data: FinancialBill[];
  first_page_url: string;
  from: number;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
}

export const financialBillService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialBillList: builder.query<
      FinancialBillListResponse,
      { page: number; paginate: number; date?: string }
    >({
      query: ({ page, paginate, date }) => ({
        url: `/financial/list-bill`,
        method: "GET",
        params: {
          page,
          paginate,
          ...(date && { date }),
        },
      }),
      transformResponse: (response: { code: number; message: string; data: FinancialBillListResponse }) => response.data,
      providesTags: ["FinancialBill"],
    }),
  }),
});

export const {
  useGetFinancialBillListQuery,
} = financialBillService;
