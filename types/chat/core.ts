export type ISO = string;

export interface Media {
  id: number;
  model_type: string;
  model_id: number;
  uuid: string;
  collection_name: string;
  name: string;
  file_name: string;
  mime_type: string;
  disk: string;
  conversions_disk: string;
  size: number;
  manipulations: unknown;
  custom_properties: unknown;
  generated_conversions: unknown;
  responsive_images: unknown;
  order_column: number;
  created_at: ISO;
  updated_at: ISO;
  original_url: string;
  preview_url: string;
}

export interface UserLite {
  id: number;
  name: string;
  phone?: string;
  email: string;
  email_verified_at: ISO | null;
  created_at: ISO;
  updated_at: ISO;
}

export interface ChatListItem {
  id: number;
  title: string;
  type: string; // "personal" | "project" | ...
  description: string;
  status: boolean | number;
  created_at: ISO;
  updated_at: ISO;
  latest_message: {
    id: number;
    chat_id: number;
    user_id: number;
    message: string;
    created_at: ISO;
    updated_at: ISO;
    file: string | null;
    media: Media[];
  } | null;
  talk_to: (UserLite & { pivot: { chat_id: number; user_id: number } })[];
}

export interface ChatListApiResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    current_page_url: string;
    data: ChatListItem[];
    first_page_url: string;
    from: number;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
  };
}

export type ChatListTransformed = {
  data: ChatListItem[];
  currentPage: number;
  perPage: number;
  currentPageUrl: string;
  firstPageUrl: string;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
  from: number;
  to: number;
  path: string;
};

export interface ChatMessage {
  id: number;
  chat_id: number;
  user_id: number;
  message: string;
  created_at: ISO;
  updated_at: ISO;
  file: string | null;
  media: Media[];
  user: UserLite;
  reads: {
    id: number;
    chat_message_id: number;
    user_id: number;
    read_at: ISO;
    created_at: ISO;
    updated_at: ISO;
  }[];
}

export interface ChatDetailCursorApiResponse {
  code: number;
  message: string;
  data: {
    data: ChatMessage[];
    path: string;
    per_page: number;
    next_cursor: string | null;
    next_page_url: string | null;
    prev_cursor: string | null;
    prev_page_url: string | null;
  };
}

export type ChatDetailTransformed = {
  data: ChatMessage[];
  perPage: number;
  nextCursor: string | null;
  prevCursor: string | null;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
  path: string;
};

export interface CreateChatRequest {
  type: string; // "personal" | "project" | ...
  title: string;
  description?: string;
  user_id?: number; // penerima untuk personal chat
}
export interface CreateChatResponseData {
  id: number;
  type: string;
  title: string;
  description: string;
  created_at: ISO;
  updated_at: ISO;
}
export interface CreateChatApiResponse {
  code: number;
  message: string;
  data: CreateChatResponseData;
}

export interface CreateMessageApiResponse {
  code: number;
  message: string;
  data: {
    id: number;
    user_id: number;
    chat_id: number;
    message?: string;
    file: string | null;
    media: Media[];
    created_at: ISO;
    updated_at: ISO;
  };
}

export type GetChatListArgs = { page: number; paginate: number };
export type GetChatDetailArgs = {
  chatId: number;
  paginate: number;
  cursor?: string | null;
};