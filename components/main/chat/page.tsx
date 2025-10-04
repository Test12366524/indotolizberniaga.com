"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  X,
  FileText,
  Download,
  UserCircle,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";

// Tipe untuk setiap pesan dalam chat
interface Message {
  id: number;
  sender: "me" | "seller";
  text?: string;
  file?: {
    name: string;
    url: string;
    type: string;
  };
  timestamp: string;
}

// Tipe untuk setiap percakapan
interface Chat {
  chatId: number;
  sellerName: string;
  sellerAvatar: string;
  messages: Message[];
}

// Data awal untuk simulasi beberapa percakapan
const initialChats: Chat[] = [
  {
    chatId: 1,
    sellerName: "Toko Elektronik Jaya",
    sellerAvatar: "/images/placeholder.jpg",
    messages: [
      { id: 1, sender: "seller", text: "Terima kasih sudah memesan. Pesanan Anda sedang kami proses.", timestamp: "14:30" },
      { id: 2, sender: "me", text: "Baik, ditunggu ya.", timestamp: "14:31" },
    ],
  },
  {
    chatId: 2,
    sellerName: "Warung Sembako Bu Siti",
    sellerAvatar: "/images/placeholder.jpg",
    messages: [
      { id: 1, sender: "me", text: "Halo, apakah stok beras 5kg masih ada?", timestamp: "11:05" },
      { id: 2, sender: "seller", text: "Halo kak, masih ada banyak. Silakan diorder.", timestamp: "11:06" },
      { id: 3, sender: "me", file: { name: "bukti-transfer.jpg", url: "/images/placeholder.jpg", type: "image/jpeg" }, timestamp: "11:15" },
    ],
  },
  {
    chatId: 3,
    sellerName: "Koperasi Merah Putih",
    sellerAvatar: "/logo-koperasi-merah-putih-online.webp",
    messages: [
      { id: 1, sender: "seller", text: "Ada yang bisa kami bantu terkait layanan simpan pinjam?", timestamp: "Kemarin" },
    ],
  },
];

// Komponen untuk menampilkan file dalam modal (tidak berubah)
const FileViewerModal = ({ file, onClose }: { file: { url: string; name: string; type: string }; onClose: () => void; }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="font-bold text-lg text-gray-800 truncate">{file.name}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X className="w-6 h-6 text-gray-600" /></button>
        </div>
        <div className="flex-1 overflow-auto flex justify-center items-center">
          {file.type.startsWith("image/") ? (
            <Image src={file.url} alt={file.name} width={800} height={600} className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="text-center p-10">
              <FileText className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Pratinjau tidak tersedia.</p>
              <a href={file.url} download={file.name} className="mt-6 inline-flex items-center gap-2 bg-[#E53935] text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                <Download className="w-5 h-5" />Unduh File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [fileInModal, setFileInModal] = useState<{ url: string; name: string; type: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevActiveChatId = useRef(activeChatId); // ✨ Ref untuk menyimpan ID chat sebelumnya
  const activeChat = chats.find((c) => c.chatId === activeChatId);

  // ✨ Logika useEffect yang sudah diperbaiki
  useEffect(() => {
    // Hanya scroll jika ID chat tidak berubah (artinya, ada pesan baru di chat yang sama).
    if (activeChatId === prevActiveChatId.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    // Perbarui ref dengan ID chat yang sekarang untuk render selanjutnya.
    prevActiveChatId.current = activeChatId;
  }, [activeChat?.messages, activeChatId]); // Dependensi diperbarui

  const handleSendMessage = () => {
    if ((newMessage.trim() === "" && !attachedFile) || !activeChatId) return;

    const newMsg: Message = {
      id: Date.now(),
      sender: "me",
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      ...(newMessage.trim() && { text: newMessage.trim() }),
      ...(attachedFile && {
        file: {
          name: attachedFile.name,
          url: URL.createObjectURL(attachedFile),
          type: attachedFile.type,
        },
      }),
    };

    setChats(currentChats =>
      currentChats.map(chat =>
        chat.chatId === activeChatId
          ? { ...chat, messages: [...chat.messages, newMsg] }
          : chat
      )
    );

    setNewMessage("");
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setAttachedFile(event.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex h-screen mt-10">
      {/* Panel Kiri: Daftar Chat */}
      <aside className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <header className="p-4 border-b font-bold text-xl text-gray-800">Percakapan</header>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            return (
              <button
                key={chat.chatId}
                onClick={() => setActiveChatId(chat.chatId)}
                className={`w-full text-left flex items-center gap-4 p-4 border-b transition-colors ${
                  activeChatId === chat.chatId ? 'bg-[#E53935]/10' : 'hover:bg-gray-100'
                }`}
              >
                <Image src={chat.sellerAvatar} alt={chat.sellerName} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 truncate">
                  <h2 className="font-semibold text-gray-800">{chat.sellerName}</h2>
                  <p className="text-sm text-gray-500 truncate">
                    {lastMessage?.text || lastMessage?.file?.name || '...'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Panel Kanan: Jendela Chat Aktif */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Header Chat Aktif */}
            <header className="bg-white shadow-sm flex items-center gap-4 p-4">
                <Image src={activeChat.sellerAvatar} alt={activeChat.sellerName} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <h1 className="font-bold text-lg text-gray-800">{activeChat.sellerName}</h1>
                    <p className="text-sm text-green-500 font-semibold">Online</p>
                </div>
            </header>

            {/* Area Pesan */}
            <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {activeChat.messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'seller' && <Image src={activeChat.sellerAvatar} alt="seller" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />}
                        <div className={`max-w-lg p-4 rounded-2xl ${msg.sender === 'me' ? 'bg-[#E53935] text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-sm'}`}>
                            {msg.text && <p className="text-base">{msg.text}</p>}
                            {msg.file && (
                                <div className="bg-black/10 p-3 rounded-lg cursor-pointer hover:bg-black/20" onClick={() => setFileInModal(msg.file!)}>
                                    <div className="flex items-center gap-3">
                                        {msg.file.type.startsWith("image/") ? <Image src={msg.file.url} alt="thumbnail" width={48} height={48} className="w-12 h-12 object-cover rounded-md"/> : <FileText className="w-10 h-10 flex-shrink-0" />}
                                        <div className="truncate"><p className="font-semibold truncate">{msg.file.name}</p><p className="text-sm opacity-80">Klik untuk melihat</p></div>
                                    </div>
                                </div>
                            )}
                            <p className={`text-xs mt-2 ${msg.sender === 'me' ? 'text-white/70' : 'text-gray-400'} text-right`}>{msg.timestamp}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>

            {/* Area Input Pesan */}
            <footer className="bg-white p-4 border-t">
              <div className="flex items-center gap-4">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full hover:bg-gray-200 transition-colors" title="Lampirkan File"><Paperclip className="w-6 h-6 text-gray-600" /></button>
                <div className="flex-1 relative">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ketik pesan..." className="w-full px-5 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#E53935]" />
                  {attachedFile && <div className="absolute bottom-14 left-0 bg-gray-100 p-2 rounded-lg shadow-md text-sm">File: {attachedFile.name}<button onClick={() => setAttachedFile(null)} className="ml-2 font-bold text-red-500">&times;</button></div>}
                </div>
                <button onClick={handleSendMessage} className="bg-[#E53935] p-3 rounded-full text-white hover:bg-red-700 transition-colors shadow-lg" title="Kirim Pesan"><Send className="w-6 h-6" /></button>
              </div>
            </footer>
          </>
        ) : (
          // Placeholder jika tidak ada chat aktif
          <div className="flex-1 flex flex-col justify-center items-center text-center bg-gray-50 p-4">
            <MessageSquare className="w-24 h-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700">Selamat Datang di Pusat Pesan</h2>
            <p className="text-gray-500 mt-2">Pilih percakapan dari daftar di sebelah kiri untuk memulai.</p>
          </div>
        )}
      </div>

      {/* Modal untuk melihat file */}
      {fileInModal && <FileViewerModal file={fileInModal} onClose={() => setFileInModal(null)} />}
    </div>
  );
}