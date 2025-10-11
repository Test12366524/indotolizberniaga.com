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
  useCreateChatOrMessageMutation,
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

type SendResult = {
  id: number;
  chat_id: number;
  user_id: number;
  message?: string;
  file?: string | null;
  created_at: string;
  updated_at: string;
  user?: ChatMessage["user"];
  reads?: ChatMessage["reads"];
};

type PusherConnection = {
  bind: (event: string, cb: (d: unknown) => void) => void;
};
type PusherInstanceLite = { connection: PusherConnection };
type EchoWithPusher = { connector?: { pusher?: PusherInstanceLite } };

export default function ChatPage() {
  const { data: session } = useSession();
  const dispatch = useDispatch();

  const currentUserId = useMemo<number>(() => {
    const u = (session?.user ?? {}) as Record<string, unknown>;
    const raw =
      u.id ??
      (u as { user_id?: unknown }).user_id ??
      (u as { uid?: unknown }).uid ??
      (u as { sub?: unknown }).sub ??
      (u["payload"] as Record<string, unknown> | undefined)?.id;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [session]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);
  const [showPickModal, setShowPickModal] = useState(false);

  // kontainer scroll khusus area pesan (bukan page)
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    data: chatList,
    isLoading: listLoading,
    refetch: refetchList,
  } = useGetChatListQuery({ page: 1, paginate: 10 });

  // ===== Reverse pagination state (ala WhatsApp) =====
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [oldCursor, setOldCursor] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const prevScrollHeightRef = useRef<number>(0);
  const lastUsedCursorRef = useRef<string | undefined>(undefined);

  const {
    data: messagesPage,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useGetChatMessagesByIdQuery(
    { chatId: selectedChat?.id ?? 0, paginate: 15, cursor },
    { skip: !selectedChat?.id, refetchOnFocus: true, refetchOnReconnect: true }
  );

  const [createChatOrMessage, { isLoading: sendingMessage }] =
    useCreateChatOrMessageMutation();

  const [conversations, setConversations] = useState<ChatMessage[]>([]);
  const echoRef = useRef<InstanceType<EchoCtor> | null>(null);

  const getCounterpartUserId = (chat: ChatListItem | null): number | null => {
    if (!chat) return null;
    const fromTalkTo = chat.talk_to?.find((u) => u.id !== currentUserId)?.id;
    if (typeof fromTalkTo === "number") return fromTalkTo;
    const users = (chat as { users?: Array<{ id: number }> }).users;
    const fromUsers = users?.find((u) => u.id !== currentUserId)?.id;
    return typeof fromUsers === "number" ? fromUsers : null;
  };

  // gabungkan pesan dari hook (prepend untuk halaman lama, urut naik)
  useEffect(() => {
    if (!messagesPage) return;

    setNextCursor(messagesPage.nextCursor ?? null);

    setConversations((prev) => {
      const map = new Map<number, ChatMessage>();
      // kalau loadMore (cursor aktif), data dari server adalah batch lebih lama → sisipkan di depan
      const merged = cursor
        ? [...messagesPage.data, ...prev]
        : [...prev, ...messagesPage.data];
      merged.forEach((m) => map.set(m.id, m));
      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    // menjaga posisi scroll saat prepend (loadMore)
    if (loadingMore && messagesContainerRef.current) {
      const el = messagesContainerRef.current;
      const before = prevScrollHeightRef.current || 0;
      requestAnimationFrame(() => {
        const after = el.scrollHeight;
        const delta = after - before;
        // tetap di posisi yang sama relatif terhadap konten
        el.scrollTop = el.scrollTop + delta;
        setLoadingMore(false);
      });
      setFetchCount((c) => c + 1);
      setOldCursor(lastUsedCursorRef.current ?? null);
    } else {
      // initial load → scroll ke bawah
      requestAnimationFrame(() => {
        if (!messagesContainerRef.current) return;
        const main = messagesContainerRef.current;
        main.scrollTop = main.scrollHeight;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesPage]);

  // reset saat ganti chat
  useEffect(() => {
    setConversations([]);
    setCursor(undefined);
    setNextCursor(null);
    setOldCursor(null);
    setFetchCount(0);
    setLoadingMore(false);
  }, [selectedChat?.id]);

  // helper scroll — fokus ke container chat
  const scrollChatToBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  // Realtime listener — gunakan latest_message
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

    const pusher = (echo as unknown as EchoWithPusher).connector?.pusher;
    pusher?.connection.bind("state_change", (s) =>
      console.log("[WS state]", s)
    );
    pusher?.connection.bind("error", (e) => console.error("[WS error]", e));

    if (currentUserId) {
      const chan =
        echo.channel?.(`chat.${currentUserId}`) ??
        echo.private(`chat.${currentUserId}`);

      type MessageSendEvent = {
        chat: {
          id: number;
          latest_message?: {
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

        const m = ev.chat.latest_message;
        if (!m) return;
        if (!selectedChat?.id || ev.chat.id !== selectedChat.id) return;
        if (m.user_id === currentUserId) return;

        setConversations((prev) => {
          if (prev.some((x) => x.id === m.id)) return prev;
          const now = new Date().toISOString();
          const appended: ChatMessage = {
            id: m.id,
            chat_id: ev.chat.id,
            user_id: m.user_id,
            message: m.message ?? "",
            file: m.file ?? null,
            created_at: m.created_at ?? now,
            updated_at: m.updated_at ?? now,
            media: [],
            user: {
              id: m.user_id,
              name: "User",
              phone: "",
              email: "",
              email_verified_at: null,
              created_at: now,
              updated_at: now,
            },
            reads: [],
          };
          const arr = [...prev, appended].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
          return arr;
        });

        requestAnimationFrame(scrollChatToBottom);
      });
    }

    return () => {
      echo.disconnect();
      echoRef.current = null;
    };
  }, [currentUserId, selectedChat?.id, dispatch]);

  const handleSelectChat = (chat: ChatListItem) => {
    setSelectedChat(chat);
    setConversations([]);
    setSidebarOpen(false);
  };

  // Optimistic send
  const handleSendMessage = async (text: string, file: File | null) => {
    if (!selectedChat?.id) return;
    if (!text.trim() && !file) return;

    const isPersonal = (selectedChat.type ?? "personal") === "personal";
    const receiverId = isPersonal ? getCounterpartUserId(selectedChat) : null;

    if (isPersonal && !receiverId) {
      Swal.fire({
        icon: "error",
        title: "Gagal mengirim",
        text: "Penerima tidak ditemukan.",
      });
      return;
    }

    const tempId = -Date.now();
    const nowIso = new Date().toISOString();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      chat_id: selectedChat.id,
      user_id: currentUserId,
      message: text.trim(),
      file: file ? "" : null,
      created_at: nowIso,
      updated_at: nowIso,
      media: [],
      user: {
        id: currentUserId,
        name: "Saya",
        phone: "",
        email: "",
        email_verified_at: null,
        created_at: nowIso,
        updated_at: nowIso,
      },
      reads: [],
    };

    setConversations((prev) =>
      [...prev, optimisticMsg].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    );
    requestAnimationFrame(scrollChatToBottom);

    try {
      const result: SendResult = await createChatOrMessage({
        chat_id: selectedChat.id,
        type: selectedChat.type ?? "personal",
        ...(isPersonal && receiverId ? { user_id: receiverId } : {}),
        message: text.trim() || undefined,
        file: file ?? undefined,
      }).unwrap();

      setConversations((prev) => {
        const replaced = prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                id: result.id,
                chat_id: result.chat_id,
                user_id: result.user_id,
                message: result.message ?? "",
                file: result.file ?? null,
                created_at: result.created_at,
                updated_at: result.updated_at,
              }
            : m
        );
        replaced.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        return replaced;
      });

      dispatch(
        apiSlice.util.invalidateTags([{ type: "ChatList", id: "LIST" }])
      );
      requestAnimationFrame(scrollChatToBottom);
    } catch {
      setConversations((prev) => prev.filter((m) => m.id !== tempId));
      Swal.fire({ icon: "error", title: "Gagal mengirim pesan" });
    }
  };

  const handleCreatePersonalChat = async (
    userId: number,
    userName?: string
  ) => {
    try {
      const first: SendResult = await createChatOrMessage({
        user_id: userId,
        type: "personal",
        message: "Permisi",
      }).unwrap();

      await refetchList();
      const list = (await refetchList()).data?.data ?? chatList?.data ?? [];
      const just = list.find((x) => x.id === first.chat_id);
      setSelectedChat(
        just ?? {
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
        }
      );
      setConversations([]);
      requestAnimationFrame(scrollChatToBottom);
    } catch {
      Swal.fire({ icon: "error", title: "Gagal membuat chat" });
    }
  };

  // ===== Fungsi load lebih lama saat mencapai atas =====
  const loadMoreOlder = () => {
    if (!nextCursor) return;
    if (nextCursor === oldCursor && fetchCount !== 0) return; // cegah double fetch
    if (loadingMore) return;

    const el = messagesContainerRef.current;
    if (el) prevScrollHeightRef.current = el.scrollHeight;

    lastUsedCursorRef.current = nextCursor;
    setLoadingMore(true);
    setCursor(nextCursor); // trigger refetch via arg hook
  };

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
        messagesContainerRef={messagesContainerRef}
        sendingMessage={sendingMessage}
        onSendMessage={handleSendMessage}
        setSidebarOpen={setSidebarOpen}
        currentUserId={currentUserId}
        onReachTop={loadMoreOlder}
        canLoadMore={Boolean(nextCursor)}
        loadingMoreOlder={loadingMore}
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