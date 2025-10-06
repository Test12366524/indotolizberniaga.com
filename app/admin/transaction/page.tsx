"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetTransactionListQuery,
  useDeleteTransactionMutation,
  useUpdateTransactionStatusMutation,
} from "@/services/admin/transaction.service";
import { Transaction } from "@/types/admin/transaction";
import { Badge } from "@/components/ui/badge";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import ActionsGroup from "@/components/admin-components/actions-group";
import { useSession } from "next-auth/react";
import {
  useGetSellerListQuery,
  type Seller,
} from "@/services/admin/seller.service";

import { TransactionDetailModal } from "@/components/form-modal/admin/detail-transaction";

// ==== Status enum mapping
type TransactionStatusKey = 0 | 1 | 2 | -1 | -2 | -3;
type TransactionStatusInfo = {
  label: string;
  variant: "secondary" | "default" | "success" | "destructive";
};

const TRANSACTION_STATUS: Record<TransactionStatusKey, TransactionStatusInfo> =
  {
    0: { label: "PENDING", variant: "secondary" },
    1: { label: "CAPTURED", variant: "default" },
    2: { label: "SETTLEMENT", variant: "success" },
    [-1]: { label: "DENY", variant: "destructive" },
    [-2]: { label: "EXPIRED", variant: "destructive" },
    [-3]: { label: "CANCEL", variant: "destructive" },
  };

const CATEGORY_TO_STATUS: Record<string, TransactionStatusKey> = {
  // "all" tidak memfilter status
  all: 0 as TransactionStatusKey, // nilai dummy; tidak dipakai saat statusFilter === "all"
  pending: 0,
  captured: 1,
  settlement: 2,
  deny: -1,
  expired: -2,
  cancel: -3,
};

// ==== helpers
type Role = { name?: string };
function userHasRoles(u: unknown): u is { roles: Role[] } {
  return (
    typeof u === "object" &&
    u !== null &&
    "roles" in u &&
    Array.isArray((u as { roles?: unknown }).roles)
  );
}
function safeToLower(s: unknown): string {
  return typeof s === "string" ? s.toLowerCase() : "";
}
function formatRupiah(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (!Number.isFinite(numAmount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(numAmount)
    .replace("IDR", "Rp");
}
function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch (error) {
    return String(error);
  }
}
// ambil kemungkinan nama toko dari list
function getShopNameFromListItem(item: Transaction): string | undefined {
  const u = item as unknown;
  if (typeof u !== "object" || u === null) return undefined;
  const o = u as Record<string, unknown>;
  if (typeof o["shop_name"] === "string") return o["shop_name"] as string;
  if (typeof o["store_name"] === "string") return o["store_name"] as string;
  if (typeof o["seller_name"] === "string") return o["seller_name"] as string;
  return undefined;
}

export default function TransactionPage() {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // role superadmin
  const { data: session } = useSession();
  const isSuperAdmin = useMemo(() => {
    const u = session?.user;
    if (!u) return false;
    if (userHasRoles(u)) {
      return u.roles.some((r) => safeToLower(r.name) === "superadmin");
    }
    return false;
  }, [session]);

  // data transaksi
  const { data, isLoading, refetch } = useGetTransactionListQuery({
    page: currentPage,
    paginate: itemsPerPage,
    // kalau backend sudah support filter, oper ke sini:
    // seller_id: sellerId ?? undefined,
    // status: statusFilter !== "all" ? CATEGORY_TO_STATUS[statusFilter] : undefined,
    // date_from: dateFrom ? dateFrom.toISOString().slice(0, 10) : undefined,
    // date_to: dateTo ? dateTo.toISOString().slice(0, 10) : undefined,
    // q: query || undefined,
  });

  // sellers (untuk combobox)
  const { data: sellerResp, isLoading: isSellerLoading } =
    useGetSellerListQuery({
      page: 1,
      paginate: 100,
    });
  const sellers: Seller[] = useMemo(() => sellerResp?.data ?? [], [sellerResp]);
  const selectedSellerShopName = useMemo(() => {
    const s = sellers.find((x) => x.id === sellerId);
    const shopName = s?.shop?.name ?? undefined;
    return shopName ? shopName.toLowerCase() : undefined;
  }, [sellers, sellerId]);

  // filter client-side
  const list = useMemo(() => data?.data ?? [], [data]);
  const filteredList = useMemo(() => {
    let arr = list;

    if (statusFilter !== "all") {
      const statusValue = CATEGORY_TO_STATUS[statusFilter];
      arr = arr.filter((item) => item.status === statusValue);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((item) => {
        const ref = safeToLower(item.reference);
        const user = safeToLower(item.user_name);
        const pay = safeToLower(item.payment_method);
        return ref.includes(q) || user.includes(q) || pay.includes(q);
      });
    }

    if (sellerId && selectedSellerShopName) {
      arr = arr.filter((item) => {
        const nm = getShopNameFromListItem(item);
        return safeToLower(nm).trim() === selectedSellerShopName;
      });
    }

    if (dateFrom || dateTo) {
      const fromTs =
        dateFrom !== undefined
          ? new Date(
              dateFrom.getFullYear(),
              dateFrom.getMonth(),
              dateFrom.getDate(),
              0,
              0,
              0,
              0
            ).getTime()
          : undefined;

      const toTs =
        dateTo !== undefined
          ? new Date(
              dateTo.getFullYear(),
              dateTo.getMonth(),
              dateTo.getDate(),
              23,
              59,
              59,
              999
            ).getTime()
          : undefined;

      arr = arr.filter((item) => {
        const t = new Date(item.created_at).getTime();
        if (Number.isNaN(t)) return false;
        if (fromTs !== undefined && t < fromTs) return false;
        if (toTs !== undefined && t > toTs) return false;
        return true;
      });
    }

    return arr;
  }, [
    list,
    statusFilter,
    query,
    sellerId,
    selectedSellerShopName,
    dateFrom,
    dateTo,
  ]);

  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  const [deleteTransaction] = useDeleteTransactionMutation();
  const [updateTransactionStatus] = useUpdateTransactionStatusMutation();

  const handleDelete = async (item: Transaction) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus Transaction?",
      text: item.reference,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteTransaction(item.id.toString()).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Transaction dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus Transaction", "error");
        console.error(error);
      }
    }
  };

  const handleStatusClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status.toString());
    setIsStatusModalOpen(true);
  };

  const handleDetailClick = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setIsDetailModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedTransaction) return;

    try {
      await updateTransactionStatus({
        id: selectedTransaction.id.toString(),
        status: parseInt(newStatus, 10),
      }).unwrap();

      await refetch();
      setIsStatusModalOpen(false);
      setSelectedTransaction(null);
      Swal.fire("Berhasil", "Status transaction berhasil diubah", "success");
    } catch (error) {
      Swal.fire("Gagal", "Gagal mengubah status transaction", "error");
      console.error(error);
    }
  };

  const getStatusInfo = (status: number): TransactionStatusInfo => {
    return (
      TRANSACTION_STATUS[status as TransactionStatusKey] || {
        label: "UNKNOWN",
        variant: "secondary",
      }
    );
  };

  const handlePaymentLinkClick = (paymentLink: string | null) => {
    if (typeof paymentLink === "string" && paymentLink.trim()) {
      window.open(paymentLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <ProdukToolbar
        onSearchChange={setQuery}
        enableStatusFilter
        onStatusChange={setStatusFilter}
        enableSellerFilter
        isSuperAdmin={isSuperAdmin}
        sellers={sellers}
        selectedSellerId={sellerId}
        onSellerChange={setSellerId}
        isSellerLoading={isSellerLoading}
        enableDateFilter
        onDateRangeChange={(from, to) => {
          setDateFrom(from);
          setDateTo(to);
        }}
        // RESET
        onResetAllFilters={() => {
          setQuery("");
          setStatusFilter("all");
          setSellerId(null);
          setDateFrom(undefined);
          setDateTo(undefined);
          setCurrentPage(1);
          refetch();
        }}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2 whitespace-nowrap">Aksi</th>
                <th className="px-2 py-2 whitespace-nowrap">ID</th>
                <th className="px-4 py-2 whitespace-nowrap">Customer</th>
                <th className="px-4 py-2 whitespace-nowrap">Harga</th>
                <th className="px-4 py-2 whitespace-nowrap">Diskon</th>
                <th className="px-4 py-2 whitespace-nowrap">
                  Biaya Pengiriman
                </th>
                <th className="px-4 py-2 whitespace-nowrap">Total harga</th>
                <th className="px-4 py-2 whitespace-nowrap">Payment Link</th>
                <th className="px-4 py-2 whitespace-nowrap">Tanggal</th>
                <th className="px-4 py-2 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  return (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-2">
                        <ActionsGroup
                          handleDetail={() => handleDetailClick(item.id)}
                          handleDelete={() => handleDelete(item)}
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {item.reference}
                      </td>
                      <td className="px-4 py-2">{item.user_name}</td>
                      <td className="px-4 py-2 font-medium text-green-600">
                        {formatRupiah(item.total)}
                      </td>
                      <td className="px-4 py-2 font-medium text-orange-600">
                        {formatRupiah(item.discount_total)}
                      </td>
                      <td className="px-4 py-2 font-medium text-blue-600">
                        {formatRupiah(item.shipment_cost)}
                      </td>
                      <td className="px-4 py-2 font-bold text-green-700">
                        {formatRupiah(item.grand_total)}
                      </td>
                      <td className="px-4 py-2">
                        {item.payment_link ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2 py-1 h-auto"
                            onClick={() =>
                              handlePaymentLinkClick(item.payment_link)
                            }
                          >
                            Buka Link
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            Tidak ada link
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm whitespace-nowrap">
                        {formatDateTime(item.created_at)}
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          variant={statusInfo.variant}
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => handleStatusClick(item)}
                        >
                          {statusInfo.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>

        <div className="p-4 flex items-center justify-between bg-muted">
          <div className="text-sm">
            Halaman <strong>{currentPage}</strong> dari{" "}
            <strong>{lastPage}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= lastPage}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </Card>

      {/* Status Update Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Status Transaksi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Transaksi: {selectedTransaction?.reference}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Customer: {selectedTransaction?.user_name}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Pilih Status Baru:
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">PENDING</SelectItem>
                  <SelectItem value="1">CAPTURED</SelectItem>
                  <SelectItem value="2">SETTLEMENT</SelectItem>
                  <SelectItem value="-1">DENY</SelectItem>
                  <SelectItem value="-2">EXPIRED</SelectItem>
                  <SelectItem value="-3">CANCEL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsStatusModalOpen(false)}
              >
                Batal
              </Button>
              <Button onClick={handleStatusUpdate}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal (komponen terpisah) */}
      <TransactionDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        transactionId={selectedTransactionId}
      />
    </div>
  );
}