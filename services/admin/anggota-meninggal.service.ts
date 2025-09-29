import { apiSlice } from "../base-query";

// Types for API responses
export interface AnggotaMeninggal {
  id: number;
  anggota_id: number;
  deceased_at: string;
  description: string | null;
  status: number;
  created_at: string;
  updated_at: string;
  anggota_name: string;
  anggota_email: string;
  anggota_phone: string;
  anggota_nik: string;
  media: any[];
  anggota?: {
    id: number;
    user_id: number;
    reference: string;
    ref_number: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    gender: string;
    birth_date: string;
    birth_place: string;
    nik: string;
    npwp: string | null;
    nip: string | null;
    unit_kerja: string | null;
    jabatan: string | null;
    status: number;
    created_at: string;
    updated_at: string;
  };
}

export interface AnggotaMeninggalResponse {
  current_page: number;
  data: AnggotaMeninggal[];
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

export interface CreateAnggotaMeninggalRequest {
  anggota_id: number;
  deceased_at: string;
  description?: string;
  status: number;
}

export interface UpdateAnggotaMeninggalRequest {
  anggota_id?: number;
  deceased_at?: string;
  description?: string;
  status?: number;
}

export const anggotaMeninggalApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Anggota Meninggal
    getAnggotaMeninggalList: builder.query<
      AnggotaMeninggalResponse,
      { page: number; paginate: number }
    >({
      query: ({ page, paginate }) => ({
        url: `/anggota/meninggals`,
        method: "GET",
        params: {
          page,
          paginate,
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: AnggotaMeninggalResponse;
      }) => response.data,
    }),

    // 🔍 Get Anggota Meninggal by ID
    getAnggotaMeninggalById: builder.query<AnggotaMeninggal, number>({
      query: (id) => ({
        url: `/anggota/meninggals/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: AnggotaMeninggal;
      }) => response.data,
    }),

    // ➕ Create Anggota Meninggal
    createAnggotaMeninggal: builder.mutation<
      { code: number; message: string; data: AnggotaMeninggal },
      CreateAnggotaMeninggalRequest
    >({
      query: (payload) => ({
        url: `/anggota/meninggals`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["AnggotaMeninggal"],
    }),

    // ✏️ Update Anggota Meninggal
    updateAnggotaMeninggal: builder.mutation<
      { code: number; message: string; data: AnggotaMeninggal },
      { id: number; payload: UpdateAnggotaMeninggalRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/anggota/meninggals/${id}?_method=PUT`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AnggotaMeninggal", id },
        "AnggotaMeninggal",
      ],
    }),

    // ❌ Delete Anggota Meninggal
    deleteAnggotaMeninggal: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/anggota/meninggals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "AnggotaMeninggal", id },
        "AnggotaMeninggal",
      ],
    }),

    // ✅ Update Status (Validate)
    updateAnggotaMeninggalStatus: builder.mutation<
      { code: number; message: string; data: AnggotaMeninggal },
      { id: number; status: number }
    >({
      query: ({ id, status }) => ({
        url: `/anggota/meninggals/${id}/validate`,
        method: "POST",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AnggotaMeninggal", id },
        "AnggotaMeninggal",
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAnggotaMeninggalListQuery,
  useGetAnggotaMeninggalByIdQuery,
  useCreateAnggotaMeninggalMutation,
  useUpdateAnggotaMeninggalMutation,
  useDeleteAnggotaMeninggalMutation,
  useUpdateAnggotaMeninggalStatusMutation,
} = anggotaMeninggalApi;
