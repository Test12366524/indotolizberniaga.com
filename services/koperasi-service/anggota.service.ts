import { apiSlice } from "../base-query";
import type { AnggotaKoperasi } from "@/types/koperasi-types/anggota";

export const anggotaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Anggota (with pagination)
    getAnggotaList: builder.query<
      {
        data: AnggotaKoperasi[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; status?: number }
    >({
      query: ({ page, paginate, status }) => ({
        url: `/anggota/anggotas`,
        method: "GET",
        params: { page, paginate, ...(status && { status }) },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: AnggotaKoperasi[];
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

    // 🔍 Get Anggota by ID
    getAnggotaById: builder.query<AnggotaKoperasi, number>({
      query: (id) => ({
        url: `/anggota/anggotas/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: AnggotaKoperasi;
      }) => response.data,
    }),

    // ➕ Create Anggota
    createAnggota: builder.mutation<AnggotaKoperasi, FormData>({
      query: (payload) => ({
        url: `/anggota/anggotas`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: AnggotaKoperasi;
      }) => response.data,
    }),

    // ✏️ Update Anggota by ID
    updateAnggota: builder.mutation<
      AnggotaKoperasi,
      { id: number; payload: FormData }
    >({
      query: ({ id, payload }) => ({
        url: `/anggota/anggotas/${id}?_method=PUT`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: AnggotaKoperasi;
      }) => response.data,
    }),

    // ❌ Delete Anggota by ID
    deleteAnggota: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `/anggota/anggotas/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => ({ code: response.code, message: response.message }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAnggotaListQuery,
  useGetAnggotaByIdQuery,
  useCreateAnggotaMutation,
  useUpdateAnggotaMutation,
  useDeleteAnggotaMutation,
} = anggotaApi;