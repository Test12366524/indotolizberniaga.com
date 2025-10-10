"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import Pusher from "pusher-js";
import Echo from "laravel-echo";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { apiSlice } from "@/services/base-query";

import {
  useGetChatListQuery,
  useGetChatMessagesByIdQuery,
  useCreateChatOrMessageMutation, // ⬅️ pakai /chat (multipart)
} from "@/services/chat/chat.service";

import { type ChatListItem, type ChatMessage } from "@/types/chat/core";

import PickUserModal from "./pick-user-modal";
import ChatSidebar from "./chat-sidebar";
import ChatWindow from "./chat-window";

type EchoCtor = new (opts: unknown) => {
  channel(name: string): {
    listen<T>(ev: string, cb: (data: T) => void): unknown;
  };
  private(name: string): {
    listen<T>(ev: string, cb: (data: T) => void): unknown;
  };
  disconnect(): void;
};

export default function ChatPage() {
  const { data: session } = useSession();
  const dispatch = useDispatch();

  const currentUserId = useMemo<number>(() => {
    const u = (session?.user ?? {}) as Record<string, unknown>;
    const raw =
      (u.id as unknown) ??
      (u.user_id as unknown) ??
      (u.uid as unknown) ??
      (u.sub as unknown) ??
      (u["payload"] as Record<string, unknown> | undefined)?.id;

    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [session]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);
  const [showPickModal, setShowPickModal] = useState(false);

  // list sidebar
  const {
    data: chatList,
    isLoading: listLoading,
    refetch: refetchList,
  } = useGetChatListQuery({ page: 1, paginate: 10 });

  // messages (cursor/limit di service)
  const {
    data: messagesPage,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useGetChatMessagesByIdQuery(
    { chatId: selectedChat?.id ?? 0, paginate: 10 },
    { skip: !selectedChat?.id, refetchOnFocus: true, refetchOnReconnect: true }
  );

  // kirim pesan / buat chat via POST /chat
  const [createChatOrMessage, { isLoading: sendingMessage }] =
    useCreateChatOrMessageMutation();

  // state realtime
  const [conversations, setConversations] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const echoRef = useRef<InstanceType<EchoCtor> | null>(null);

  // === helper: ambil user_id lawan bicara untuk chat personal ===
  const getCounterpartUserId = (chat: ChatListItem | null): number | null => {
    if (!chat) return null;

    // prioritas: talk_to dari response sidebar
    const fromTalkTo = chat.talk_to?.find((u) => u.id !== currentUserId)?.id;
    if (typeof fromTalkTo === "number") return fromTalkTo;

    // fallback: beberapa response punya "users"
    const users = (chat as unknown as { users?: Array<{ id: number }> }).users;
    const fromUsers = users?.find((u) => u.id !== currentUserId)?.id;
    if (typeof fromUsers === "number") return fromUsers;

    return null;
  };

  // merge API → state
  useEffect(() => {
    if (!messagesPage) return;
    setConversations((prev) => {
      const map = new Map<number, ChatMessage>();
      [...prev, ...messagesPage.data].forEach((m) => map.set(m.id, m));
      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, [messagesPage]);

  // realtime listener
  useEffect(() => {
    (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

    const isHttps =
      (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "https") === "https";
    const host =
      process.env.NEXT_PUBLIC_REVERB_HOST ?? window.location.hostname;
    const port = Number(
      process.env.NEXT_PUBLIC_REVERB_PORT ?? (isHttps ? 443 : 80)
    );

    const echo = new (Echo as unknown as EchoCtor)({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "",
      wsHost: host,
      wsPort: isHttps ? undefined : port,
      wssPort: isHttps ? port : undefined,
      forceTLS: isHttps,
      enabledTransports: ["ws", "wss"],
      encrypted: isHttps,
      disableStats: true,
    });
    echoRef.current = echo;

    if (currentUserId) {
      const chan =
        echo.channel?.(`chat.${currentUserId}`) ??
        echo.private(`chat.${currentUserId}`);
      type MessageSendEvent = {
        chat: {
          id: number;
          latest_send: {
            id: number;
            chat_id: number;
            user_id: number;
            message?: string;
            file?: string | null;
            created_at?: string;
            updated_at?: string;
          };
        };
      };

      chan.listen<MessageSendEvent>("MessageSend", (ev) => {
        dispatch(
          apiSlice.util.invalidateTags([{ type: "ChatList", id: "LIST" }])
        );

        if (!selectedChat?.id || ev.chat.id !== selectedChat.id) return;
        dispatch(
          apiSlice.util.invalidateTags([
            { type: "ChatMessages", id: ev.chat.id },
          ])
        );

        const m = ev.chat.latest_send;
        if (!m) return;

        setConversations((prev) => {
          if (prev.some((x) => x.id === m.id)) return prev;
          const appended: ChatMessage = {
            id: m.id,
            chat_id: ev.chat.id,
            user_id: m.user_id,
            message: m.message ?? "",
            file: m.file ?? null,
            created_at: m.created_at ?? new Date().toISOString(),
            updated_at: m.updated_at ?? new Date().toISOString(),
            media: [],
            user: {
              id: m.user_id,
              name: "User",
              phone: "",
              email: "",
              email_verified_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            reads: [],
          };
          const arr = [...prev, appended];
          arr.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
          return arr;
        });

        requestAnimationFrame(() =>
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        );
      });
    }

    return () => {
      echo.disconnect();
      echoRef.current = null;
    };
  }, [currentUserId, selectedChat?.id, dispatch]);

  // pilih item sidebar
  const handleSelectChat = (chat: ChatListItem) => {
    setSelectedChat(chat);
    setConversations([]); // reset lalu diisi oleh API + realtime
    dispatch(
      apiSlice.util.invalidateTags([{ type: "ChatMessages", id: chat.id }])
    );
    setSidebarOpen(false);
  };

  // kirim pesan → POST /chat (pakai chat_id) + user_id (WAJIB untuk personal)
  const handleSendMessage = async (text: string, file: File | null) => {
    if (!selectedChat?.id) return;
    if (!text.trim() && !file) return;

    const isPersonal = (selectedChat.type ?? "personal") === "personal";
    const receiverId = isPersonal ? getCounterpartUserId(selectedChat) : null;

    if (isPersonal && !receiverId) {
      Swal.fire({
        icon: "error",
        title: "Gagal mengirim",
        text: "Penerima tidak ditemukan pada chat ini.",
      });
      return;
    }

    try {
      await createChatOrMessage({
        chat_id: selectedChat.id,
        type: selectedChat.type ?? "personal",
        ...(isPersonal && receiverId ? { user_id: receiverId } : {}),
        message: text.trim() || undefined,
        file: file ?? undefined,
      }).unwrap();
      // realtime akan mengisi UI / invalidate
    } catch {
      Swal.fire({ icon: "error", title: "Gagal mengirim pesan" });
    }
  };

  // buat chat personal baru (penerima dari useGetAnggotaListQuery) → POST /chat tanpa chat_id
  const handleCreatePersonalChat = async (
    userId: number,
    userName?: string
  ) => {
    try {
      const first = await createChatOrMessage({
        user_id: userId, // ⬅️ WAJIB
        type: "personal",
        message: "Permisi",
      }).unwrap();

      await refetchList();
      const list = (await refetchList()).data?.data ?? chatList?.data ?? [];
      const just = list.find((x) => x.id === first.chat_id);
      handleSelectChat(
        just ??
          ({
            id: first.chat_id,
            title: userName ? `Chat with ${userName}` : "Personal Chat",
            description: userName
              ? `Personal chat with ${userName}`
              : "Personal chat",
            type: "personal",
            status: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            latest_message: null,
            talk_to: [],
          } as ChatListItem)
      );
    } catch {
      Swal.fire({ icon: "error", title: "Gagal membuat chat" });
    }
  };

  // filter untuk sidebar
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const list = chatList?.data ?? [];
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.talk_to?.some((u) => u.name.toLowerCase().includes(q)) ?? false)
    );
  }, [chatList, searchQuery]);

  return (
    <div className="h-[calc(100vh-120px)] flex relative pt-10">
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loading={listLoading}
        items={filteredItems}
        selectedChatId={selectedChat?.id ?? null}
        onSelectChat={handleSelectChat}
        onOpenPickUser={() => setShowPickModal(true)}
      />

      <ChatWindow
        selectedChat={selectedChat}
        conversations={conversations}
        messagesLoading={messagesLoading}
        messagesError={messagesError}
        refetchMessages={refetchMessages}
        messagesEndRef={messagesEndRef}
        sendingMessage={sendingMessage}
        onSendMessage={handleSendMessage}
        setSidebarOpen={setSidebarOpen}
        currentUserId={currentUserId}
      />

      <PickUserModal
        open={showPickModal}
        onClose={() => setShowPickModal(false)}
        onPickUser={(id, name) => {
          void handleCreatePersonalChat(id, name);
        }}
      />
    </div>
  );
}
