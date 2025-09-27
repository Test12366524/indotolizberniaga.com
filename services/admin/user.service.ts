import { apiSlice } from "../base-query";
import { User, UserListResponse } from "@/types/admin/user";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Users (with pagination)
    getUserList: builder.query<
      {
        data: User[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number }
    >({
      query: ({ page, paginate }) => ({
        url: `/user/users`,
        method: "GET",
        params: {
          page,
          paginate,
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: UserListResponse;
      }) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserListQuery,
} = userApi;
