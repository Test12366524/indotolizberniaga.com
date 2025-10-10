// app/.../chat/chat-sidebar.tsx
"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconSearch, IconUserPlus } from "@tabler/icons-react";
import type { ChatListItem } from "@/types/chat/core";

type Props = {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  loading: boolean;
  items: ChatListItem[];
  selectedChatId: number | null;
  onSelectChat: (chat: ChatListItem) => void;
  onOpenPickUser: () => void;
};

function ChatSidebarInner({
  sidebarOpen,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  loading,
  items,
  selectedChatId,
  onSelectChat,
  onOpenPickUser,
}: Props) {
  const getInitials = (name: string) =>
    (name || "")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          w-80 lg:w-1/3 border-r bg-white transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <Card className="h-full rounded-none border-0">
          <CardHeader className="relative pb-3">
            <div className="mb-2 absolute right-3 -top-5 z-50">
              <Button
                variant="default"
                className="ml-auto"
                onClick={onOpenPickUser}
                title="Tambahkan chat"
              >
                <IconUserPlus className="w-5 h-5" />
              </Button>
            </div>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="divide-y">
                {items.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => onSelectChat(chat)}
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChatId === chat.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {getInitials(
                          chat.talk_to?.[0]?.name ?? chat.title ?? "U"
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">
                          {chat.talk_to?.[0]?.name ?? chat.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(chat.updated_at).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.latest_message?.message ??
                          chat.latest_message?.media?.[0]?.name ??
                          chat.description}
                      </p>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    Tidak ada chat
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default memo(ChatSidebarInner);