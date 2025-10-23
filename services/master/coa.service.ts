import { apiSlice } from "../base-query";
import { CoaKoperasi } from "@/types/koperasi-types/master/coa";

export type CreateCoaRequest = Omit<
  CoaKoperasi,
  "id" | "created_at" | "updated_at"
>;
export type UpdateCoaRequest = CreateCoaRequest;

/** Bentuk respons API (disesuaikan dgn contoh) */
type CoaListApiResponse = {
  code: number;
  message: string;
  data: {
    data: CoaKoperasi[];
    last_page: number;
    current_page: number;
    total: number;
    per_page: number;
  };
};

type CoaDetailApiResponse = {
  code: number;
  message: string;
  data: CoaKoperasi;
};

export const coaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All COA (paginated)
    getCoaList: builder.query<
      {
        data: CoaKoperasi[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; orderBy?: string; order?: "asc" | "desc" }
    >({
      query: ({ page, paginate, orderBy, order }) => ({
        url: `/master/coas`,
        method: "GET",
        params: { page, paginate, orderBy, order },
      }),
      transformResponse: (response: CoaListApiResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔎 Get COA by ID
    getCoaById: builder.query<CoaKoperasi, number>({
      query: (id) => ({
        url: `/master/coas/${id}`,
        method: "GET",
      }),
      transformResponse: (response: CoaDetailApiResponse) => response.data,
    }),

    // ➕ Create COA
    createCoa: builder.mutation<CoaKoperasi, CreateCoaRequest>({
      query: (payload) => ({
        url: `/master/coas`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: CoaDetailApiResponse) => response.data,
    }),

    // ✏️ Update COA by ID
    updateCoa: builder.mutation<
      CoaKoperasi,
      { id: number; payload: UpdateCoaRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/master/coas/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: CoaDetailApiResponse) => response.data,
    }),

    // ❌ Delete COA by ID
    deleteCoa: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `/master/coas/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => ({
        code: response.code,
        message: response.message,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCoaListQuery,
  useGetCoaByIdQuery,
  useCreateCoaMutation,
  useUpdateCoaMutation,
  useDeleteCoaMutation,
} = coaApi;