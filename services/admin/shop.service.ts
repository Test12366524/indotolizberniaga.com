import { apiSlice } from "../base-query";
import { UserProfile } from "@/types/admin/shop";

export const shopApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get Current User Profile (includes shop info)
    getMe: builder.query<UserProfile, void>({
      query: () => ({
        url: `/me`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: UserProfile;
      }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMeQuery,
} = shopApi;
