// services/chat/chat.service.ts
import { apiSlice } from "../base-query";
import type {
  ChatListApiResponse,
  ChatDetailCursorApiResponse,
  CreateChatRequest,
  CreateChatApiResponse,
  CreateChatResponseData,
  CreateMessageApiResponse,
  ChatDetailTransformed,
  GetChatDetailArgs,
  ChatListTransformed,
  GetChatListArgs,
} from "@/types/chat/core";

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChatList: builder.query<ChatListTransformed, GetChatListArgs>({
      query: ({ page, paginate }) => ({
        url: "/chat",
        params: { page, paginate },
      }),
      transformResponse: (r: ChatListApiResponse): ChatListTransformed => ({
        data: r.data.data,
        currentPage: r.data.current_page,
        perPage: r.data.per_page,
        currentPageUrl: r.data.current_page_url,
        firstPageUrl: r.data.first_page_url,
        nextPageUrl: r.data.next_page_url,
        prevPageUrl: r.data.prev_page_url,
        from: r.data.from,
        to: r.data.to,
        path: r.data.path,
      }),
      providesTags: () => [{ type: "ChatList" as const, id: "LIST" }],
    }),

    getChatMessagesById: builder.query<
      ChatDetailTransformed,
      GetChatDetailArgs
    >({
      query: ({ chatId, paginate, cursor }) => ({
        url: `/chat/${chatId}`,
        params: { paginate, ...(cursor ? { cursor } : {}) },
      }),
      transformResponse: (
        r: ChatDetailCursorApiResponse
      ): ChatDetailTransformed => ({
        data: r.data.data,
        perPage: r.data.per_page,
        path: r.data.path,
        nextCursor: r.data.next_cursor,
        prevCursor: r.data.prev_cursor,
        nextPageUrl: r.data.next_page_url,
        prevPageUrl: r.data.prev_page_url,
      }),
      providesTags: (_r, _e, a) => [
        { type: "ChatMessages" as const, id: a.chatId },
      ],
      keepUnusedDataFor: 0,
    }),

    // (opsional) create chat kosong via JSON kalau backend-mu support
    createChat: builder.mutation<CreateChatResponseData, CreateChatRequest>({
      query: (body) => ({ url: "/chat", method: "POST", body }),
      transformResponse: (r: CreateChatApiResponse) => r.data,
      invalidatesTags: () => [{ type: "ChatList" as const, id: "LIST" }],
    }),
    createChatOrMessage: builder.mutation<
      CreateMessageApiResponse["data"],
      {
        chat_id?: number;
        user_id?: number;
        type?: string; // "personal" | "project" | ...
        message?: string;
        file?: File | null;
        reply_to_id?: number;
        title?: string;
        description?: string;
      }
    >({
      query: ({
        chat_id,
        user_id,
        type,
        message,
        file,
        reply_to_id,
        title,
        description,
      }) => {
        const form = new FormData();
        if (typeof chat_id === "number")
          form.append("chat_id", String(chat_id));
        if (typeof user_id === "number")
          form.append("user_id", String(user_id));
        if (typeof type === "string") form.append("type", type);
        if (typeof title === "string") form.append("title", title);
        if (typeof description === "string")
          form.append("description", description);
        if (message && message.trim() !== "") form.append("message", message);
        if (file instanceof File) form.append("file", file);
        if (typeof reply_to_id === "number")
          form.append("reply_to_id", String(reply_to_id));
        return { url: "/chat", method: "POST", body: form };
      },
      transformResponse: (r: CreateMessageApiResponse) => r.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            apiSlice.util.invalidateTags([
              { type: "ChatList", id: "LIST" },
              { type: "ChatMessages", id: data.chat_id },
            ])
          );
        } catch {
          /* noop */
        }
      },
    }),
  }),
});

export const {
  useGetChatListQuery,
  useGetChatMessagesByIdQuery,
  useCreateChatMutation,
  useCreateChatOrMessageMutation,
} = chatApi;