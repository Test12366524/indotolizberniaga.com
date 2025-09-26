import { apiSlice } from "@/services/base-query";
import type { Users } from "@/types/koperasi-types/users";

// Pastikan field di bawah ini benar-benar yang backend terima saat CREATE
export type CreateUsersPayload = Omit<
  Users,
  "id" | "jabatan" | "unit_kerja" | "roles"
> & {
  jabatan_id: number | null;
  unit_kerja_id: number | null;
  password: string;
  password_confirmation: string;
};

// Untuk UPDATE: password opsional
export type UpdateUsersPayload = Partial<
  Omit<Users, "id" | "jabatan" | "unit_kerja" | "roles">
> & {
  jabatan_id?: number | null;
  unit_kerja_id?: number | null;
  password?: string;
  password_confirmation?: string;
};

export const userUsersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createUsers: builder.mutation<Users, CreateUsersPayload>({
      query: (payload) => ({
        url: "/user/users",
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Users;
      }) => response.data,
    }),

    getUsersList: builder.query<
      {
        code: number;
        data: {
          data: Users[];
          last_page: number;
          current_page?: number;
          total?: number;
        };
      },
      { page: number; paginate: number; search?: string; search_by?: string }
    >({
      query: ({ page, paginate, search = "", search_by = "name" }) => ({
        url: `/user/users?paginate=${paginate}&page=${page}&search=${encodeURIComponent(
          search
        )}&search_by=${encodeURIComponent(search_by)}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        data: {
          data: Users[];
          last_page: number;
          current_page?: number;
          total?: number;
        };
      }) => response,
    }),

    getUsersById: builder.query<Users, number>({
      query: (id) => ({
        url: `/user/users/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Users;
      }) => response.data,
    }),

    updateUsers: builder.mutation<
      Users,
      { id: number; payload: UpdateUsersPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/user/users/${id}`,
        method: "PUT", // ganti ke "PATCH" bila backend mengharuskan partial update
        body: payload,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Users;
      }) => response.data,
    }),

    deleteUsers: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `/user/users/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateUsersMutation,
  useGetUsersListQuery,
  useGetUsersByIdQuery,
  useUpdateUsersMutation,
  useDeleteUsersMutation,
} = userUsersApi;