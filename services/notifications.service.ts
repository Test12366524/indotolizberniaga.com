import { apiSlice } from "./base-query";
import { Notification } from "@/types/notification";

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all notifications (with pagination)
    getNotifications: builder.query<
      {
        data: Notification[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number }
    >({
      query: ({ page, paginate }) =>
        `/notification?paginate=${paginate}&page=${page}`,
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: Notification[];
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

    // ✅ Get notification by ID
    getNotificationById: builder.query<Notification, string>({
      query: (id) => `/notification/${id}`,
      transformResponse: (response: {
        code: number;
        message: string;
        data: Notification;
      }) => response.data,
    }),

    // ✅ Mark notification as read by ID
    markNotificationAsRead: builder.mutation<
      { message: string },
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/notification/read/${id}`,
        method: "PUT",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => ({
        message: response.message,
      }),
    }),

    // ✅ Mark all notifications as read
    markAllNotificationsAsRead: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: `/notification/read-all`,
        method: "PUT",
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
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationApi;