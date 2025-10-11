import { apiSlice } from "@/services/base-query";
import type { UserBank } from "@/types/koperasi-types/user-bank";

/** Payloads */
export interface CreateUserBankRequest {
  user_id: number;
  bank: string;
  account_name: string;
  account_number: string;
  description?: string;
  is_primary?: boolean | number;
}

export interface UpdateUserBankRequest {
  bank?: string;
  account_name?: string;
  account_number?: string;
  description?: string;
  is_primary?: boolean | number;
}

/** API */
export const userBankApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all User Bank (with pagination + search + user_id)
    getUserBankList: builder.query<
      {
        data: UserBank[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string; user_id?: number }
    >({
      query: ({ page, paginate, search = "", user_id }) => {
        const params = new URLSearchParams();
        params.set("paginate", String(paginate));
        params.set("page", String(page));
        params.set("search", search);
        if (typeof user_id === "number") params.set("user_id", String(user_id));

        return `/user/banks?${params.toString()}`;
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: UserBank[];
          last_page: number;
          total: number;
          per_page: number;
        };
      }) => ({
        data: response.data.data,
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // ✅ Get by ID
    getUserBankById: builder.query<UserBank, number | string>({
      query: (id) => `/user/banks/${id}`,
      transformResponse: (response: {
        code: number;
        message: string;
        data: UserBank;
      }) => response.data,
    }),

    // ✅ Create
    createUserBank: builder.mutation<
      { message: string; data: UserBank },
      CreateUserBankRequest
    >({
      query: (body) => ({
        url: `/user/banks`,
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: UserBank;
      }) => ({
        message: response.message,
        data: response.data,
      }),
    }),

    // ✅ Update
    updateUserBank: builder.mutation<
      { message: string; data: UserBank },
      { id: number | string; body: UpdateUserBankRequest }
    >({
      query: ({ id, body }) => ({
        url: `/user/banks/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: UserBank;
      }) => ({
        message: response.message,
        data: response.data,
      }),
    }),

    // ✅ Delete
    deleteUserBank: builder.mutation<
      { message: string },
      { id: number | string }
    >({
      query: ({ id }) => ({
        url: `/user/banks/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => ({
        message: response.message,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetUserBankListQuery,
  useGetUserBankByIdQuery,
  useCreateUserBankMutation,
  useUpdateUserBankMutation,
  useDeleteUserBankMutation,
} = userBankApi;