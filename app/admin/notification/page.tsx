"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/services/notifications.service";

export default function NotificationPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetNotificationsQuery({
    page,
    paginate: 10,
  });

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkAllLoading }] =
    useMarkAllNotificationsAsReadMutation();

  const notifications = data?.data || [];
  const lastPage = data?.last_page || 1;
  const totalData = data?.total || 0;
  const perPage = data?.per_page || 10;
  const totalPages = Math.ceil(totalData / perPage);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead({ id }).unwrap();
      refetch();
    } catch (err) {
      console.error("Gagal menandai sebagai dibaca:", err);
    }
  };

  const handleDownload = async (id: string, link: string) => {
    try {
      await markAsRead({ id }).unwrap();
      window.open(link, "_blank");
      refetch();
    } catch (err) {
      console.error("Gagal mengunduh atau menandai sebagai dibaca:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      refetch();
    } catch (err) {
      console.error("Gagal menandai semua notifikasi sebagai dibaca:", err);
    }
  };

  const limitWords = (text?: string | null, maxWords = 7) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > maxWords
      ? words.slice(0, maxWords).join(" ") + "..."
      : text;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifikasi</h1>
        <Button
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={isMarkAllLoading || notifications.every((n) => n.read_at)}
        >
          Tandai Semua Dibaca
        </Button>
      </div>
      {/* <p className="text-xs text-muted-foreground">
        * Jika belum ada button download, harap refresh halaman
      </p> */}

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm" suppressHydrationWarning>
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Tipe</th>
                <th className="px-4 py-2">Pesan</th>
                <th className="px-4 py-2">Tanggal</th>
                {/* <th className="px-4 py-2">Link</th> */}
                <th className="px-4 py-2">Link Download</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center p-4 text-muted-foreground"
                  >
                    Memuat notifikasi...
                  </td>
                </tr>
              ) : (
                <>
                  {notifications.map((n, index) => (
                    <tr key={n.id} className="border-t">
                      <td className="px-4 py-2">
                        {(page - 1) * perPage + index + 1}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {n.data.type}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {limitWords(n.data.message)}
                      </td>
                      {/* <td className="px-4 py-2">{n.data.url}</td> */}
                      <td className="px-4 py-2 whitespace-nowrap">
                        {new Date(n.data.date).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-2">
                        {typeof n.data?.url === "string" &&
                        n.data.url.trim() !== "" &&
                        n.data.url.trim() !== "#" ? (
                          <a
                            href={n.data.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline">
                              Download
                            </Button>
                          </a>
                        ) : null}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Badge variant={n.read_at ? "default" : "secondary"}>
                          {n.read_at ? "Dibaca" : "Baru"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        {!n.read_at && (
                          <>
                            {n.data.link && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleDownload(n.id, n.data.link!)
                                }
                              >
                                Unduh File
                              </Button>
                            )}
                            {!n.data.link && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsRead(n.id)}
                              >
                                Tandai Dibaca
                              </Button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {notifications.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center p-4 text-muted-foreground"
                      >
                        Tidak ada notifikasi.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </CardContent>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between gap-2 bg-muted">
          <div className="text-sm text-muted-foreground">
            Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
              variant="outline"
            >
              Sebelumnya
            </Button>
            <Button
              disabled={page >= lastPage}
              onClick={() => setPage((prev) => prev + 1)}
              variant="outline"
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}