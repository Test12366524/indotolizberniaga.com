import { apiSlice } from "../base-query";

export interface KodeTransaksi {
  id: number;
  module: string;
  description: string;
  code: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface CreateKodeTransaksiRequest {
  code: string;
  module: string;
  description: string;
  status: number;
  debits: Array<{
    coa_id: number;
    order: number;
  }>;
  credits: Array<{
    coa_id: number;
    order: number;
  }>;
}

export interface UpdateKodeTransaksiRequest extends CreateKodeTransaksiRequest {}

export interface COA {
  id: number;
  coa_id: number | null;
  code: string;
  name: string;
  description: string;
  level: number;
  type: string;
  created_at: string;
  updated_at: string;
  parent_name: string | null;
  parent_code: string | null;
  parent_level: number | null;
}

export const kodeTransaksiService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getKodeTransaksiList: builder.query<
      {
        data: KodeTransaksi[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; orderBy?: string; order?: string }
    >({
      query: ({ page, paginate, orderBy = "updated_at", order = "desc" }) => ({
        url: `/accounting/journal-templates`,
        method: "GET",
        params: {
          page,
          paginate,
          orderBy,
          order,
        },
      }),
      transformResponse: (response: { code: number; message: string; data: any }) => response.data,
      providesTags: ["KodeTransaksi"],
    }),

    getKodeTransaksiById: builder.query<KodeTransaksi, number>({
      query: (id) => `/accounting/journal-templates/${id}`,
      transformResponse: (response: { code: number; message: string; data: KodeTransaksi }) => response.data,
      providesTags: ["KodeTransaksi"],
    }),

    createKodeTransaksi: builder.mutation<KodeTransaksi, CreateKodeTransaksiRequest>({
      query: (data) => ({
        url: `/accounting/journal-templates`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { code: number; message: string; data: KodeTransaksi }) => response.data,
      invalidatesTags: ["KodeTransaksi"],
    }),

    updateKodeTransaksi: builder.mutation<KodeTransaksi, { id: number; data: UpdateKodeTransaksiRequest }>({
      query: ({ id, data }) => ({
        url: `/accounting/journal-templates/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: { code: number; message: string; data: KodeTransaksi }) => response.data,
      invalidatesTags: ["KodeTransaksi"],
    }),

    deleteKodeTransaksi: builder.mutation<void, number>({
      query: (id) => ({
        url: `/accounting/journal-templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["KodeTransaksi"],
    }),

    getCOAList: builder.query<
      {
        data: COA[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number }
    >({
      query: ({ page, paginate }) => ({
        url: `/master/coas`,
        method: "GET",
        params: {
          page,
          paginate,
        },
      }),
      transformResponse: (response: { code: number; message: string; data: any }) => response.data,
      providesTags: ["COA"],
    }),
  }),
});

export const {
  useGetKodeTransaksiListQuery,
  useGetKodeTransaksiByIdQuery,
  useCreateKodeTransaksiMutation,
  useUpdateKodeTransaksiMutation,
  useDeleteKodeTransaksiMutation,
  useGetCOAListQuery,
} = kodeTransaksiService;
