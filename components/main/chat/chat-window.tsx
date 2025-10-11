"use client";

import { memo, RefObject, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconFile, IconMenu2, IconSend } from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatListItem, ChatMessage } from "@/types/chat/core";

type Props = {
  selectedChat: ChatListItem | null;
  conversations: ChatMessage[];
  messagesLoading: boolean;
  messagesError: unknown;
  refetchMessages: () => void;

  /** ref ke kontainer scroll area pesan (bukan page) */
  messagesContainerRef: RefObject<HTMLDivElement | null>;

  sendingMessage: boolean;
  onSendMessage: (text: string, file: File | null) => void;
  setSidebarOpen: (v: boolean) => void;
  currentUserId: number;

  /** reverse pagination ala WhatsApp */
  onReachTop?: () => void;
  canLoadMore?: boolean;
  loadingMoreOlder?: boolean;
};

function ChatWindowInner({
  selectedChat,
  conversations,
  messagesLoading,
  messagesError,
  refetchMessages,
  messagesContainerRef,
  sendingMessage,
  onSendMessage,
  setSidebarOpen,
  currentUserId,
  onReachTop,
  canLoadMore,
  loadingMoreOlder,
}: Props) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const topSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setText("");
    setFile(null);
    setPreview("");
  }, [selectedChat?.id]);

  // IntersectionObserver untuk sentinel di atas
  useEffect(() => {
    const root = messagesContainerRef.current ?? undefined;
    const target = topSentinelRef.current;
    if (!root || !target || !onReachTop) return;

    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && canLoadMore && !loadingMoreOlder) {
          onReachTop();
        }
      },
      { root, threshold: 1 }
    );

    io.observe(target);
    return () => io.disconnect();
  }, [messagesContainerRef, canLoadMore, loadingMoreOlder, onReachTop]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(String(ev.target?.result ?? ""));
      reader.readAsDataURL(f);
    } else {
      setPreview("");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {selectedChat ? (
        <>
          {/* header */}
          <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
            >
              <IconMenu2 className="w-5 h-5" />
            </button>
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-blue-500 text-white">
                {(selectedChat.talk_to?.[0]?.name ??
                  selectedChat.title ??
                  "U")[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">
                {selectedChat.talk_to?.[0]?.name ?? selectedChat.title}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedChat.description}
              </p>
            </div>
          </div>

          {/* messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {/* TOP SENTINEL untuk reverse pagination */}
            {canLoadMore && <div ref={topSentinelRef} className="h-1 w-full" />}

            {loadingMoreOlder && (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            )}

            {messagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : messagesError ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-red-500 mb-2">Gagal memuat pesan</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchMessages()}
                  >
                    Coba Lagi
                  </Button>
                </div>
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((m) => {
                const senderId: number = m.user?.id ?? m.user_id ?? 0;
                const mine = senderId === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`p-3 rounded-xl max-w-full ${
                        mine
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-white text-gray-900 rounded-bl-sm"
                      }`}
                    >
                      {m.file &&
                        /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(m.file) && (
                          <div className="max-w-xs mb-2">
                            <Image
                              src={m.file}
                              alt="File"
                              width={300}
                              height={200}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        )}
                      {m.message && (
                        <p className="text-sm break-words">{m.message}</p>
                      )}
                      <p
                        className={`text-xs mt-1 text-right ${
                          mine ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {new Date(m.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500">Belum ada pesan.</p>
              </div>
            )}
          </div>

          {/* composer */}
          <div className="bg-white border-t px-4 py-2">
            {file && (
              <div className="p-3 mb-2 rounded-lg bg-gray-50 flex items-center gap-3">
                {preview ? (
                  <Image
                    src={preview}
                    alt={file.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <IconFile className="w-5 h-5" />
                  </div>
                )}
                <div className="text-sm truncate">{file.name}</div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setFile(null);
                    setPreview("");
                  }}
                >
                  Hapus
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="file-chat"
                className="hidden"
                onChange={handleFile}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.mov,.avi"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById("file-chat")?.click()}
              >
                <IconFile className="w-4 h-4" />
              </Button>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSendMessage(text, file);
                    setText("");
                    setFile(null);
                    setPreview("");
                  }
                }}
                placeholder="Ketik pesan..."
                className="pr-12"
              />
              <Button
                size="sm"
                onClick={() => {
                  onSendMessage(text, file);
                  setText("");
                  setFile(null);
                  setPreview("");
                }}
              >
                {sendingMessage ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <IconSend className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-500">Pilih chat untuk memulai</p>
        </div>
      )}
    </div>
  );
}

export default memo(ChatWindowInner);