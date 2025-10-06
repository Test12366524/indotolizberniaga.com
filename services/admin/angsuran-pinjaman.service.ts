import { AngsuranPinjaman, ItemEnvelope, ListEnvelope } from "@/types/admin/angsuran-pinjaman";
import { apiSlice } from "../base-query";

export const angsuranPinjamanApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Angsuran Pinjaman (with pagination & filters)
    getAngsuranPinjamanList: builder.query<
      {
        data: AngsuranPinjaman[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      {
        page: number;
        paginate: number;
        type?: string; // 'manual' | 'automatic' | ''
        pinjaman_id?: number;
        pinjaman_detail_id?: number;
      }
    >({
      query: ({ page, paginate, type, pinjaman_id, pinjaman_detail_id }) => ({
        url: `/pinjaman/payment`,
        method: "GET",
        params: {
          page,
          paginate,
          type: type ?? "",
          pinjaman_id,
          pinjaman_detail_id,
        },
      }),
      transformResponse: (response: ListEnvelope<AngsuranPinjaman>) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔎 Get Angsuran Pinjaman by ID
    getAngsuranPinjamanById: builder.query<AngsuranPinjaman, number>({
      query: (id) => ({
        url: `/pinjaman/payment/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ItemEnvelope<AngsuranPinjaman>) =>
        response.data,
    }),

    // ➕ Create Angsuran Pinjaman
    // Catatan: gunakan FormData agar bisa kirim file (image)
    createAngsuranPinjaman: builder.mutation<AngsuranPinjaman, FormData>({
      query: (payload) => ({
        url: `/pinjaman/payment`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ItemEnvelope<AngsuranPinjaman>) =>
        response.data,
    }),

    // ✏️ Update Angsuran Pinjaman by ID
    updateAngsuranPinjaman: builder.mutation<
      AngsuranPinjaman,
      { id: number; payload: FormData }
    >({
      query: ({ id, payload }) => {
        // pastikan method override agar kompatibel dengan Laravel
        if (!payload.has("_method")) {
          payload.append("_method", "PUT");
        }
        return {
          url: `/pinjaman/payment/${id}`,
          method: "POST",
          body: payload,
        };
      },
      transformResponse: (response: ItemEnvelope<AngsuranPinjaman>) =>
        response.data,
    }),

    // ❌ Delete Angsuran Pinjaman by ID
    deleteAngsuranPinjaman: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/pinjaman/payment/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { code: number; message: string }) =>
        response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAngsuranPinjamanListQuery,
  useGetAngsuranPinjamanByIdQuery,
  useCreateAngsuranPinjamanMutation,
  useUpdateAngsuranPinjamanMutation,
  useDeleteAngsuranPinjamanMutation,
} = angsuranPinjamanApi;
