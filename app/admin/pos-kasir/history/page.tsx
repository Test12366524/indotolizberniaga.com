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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetPosTransactionsQuery,
  useDeletePosTransactionMutation,
  useUpdatePosTransactionStatusMutation,
  useUpdatePosTransactionMutation,
  useGetPosTransactionByIdQuery,
  useGetPosAnggotaQuery,
} from "@/services/pos-kasir.service";
import { useGetProductListQuery } from "@/services/product.service";
import { PosTransaction, POS_PAYMENT_TYPES } from "@/types/pos-kasir";
import { Badge } from "@/components/ui/badge";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import { Plus, Trash2 } from "lucide-react";
import ActionsGroup from "@/components/admin-components/actions-group";

// Status enum mapping
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
  pending: 0,
  captured: 1,
  settlement: 2,
  deny: -1,
  expired: -2,
  cancel: -3,
};

export default function PosKasirPage() {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<PosTransaction | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  // Form state for update transaction
  const [formData, setFormData] = useState({
    user_id: "",
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    payment_type: "manual" as "automatic" | "manual" | "saldo",
    wallet_id: "",
    status: 0,
    shop_id: 1,
    products: [{ product_id: 1, quantity: 1 }],
    voucher: [] as number[],
  });

  // Helper function to format currency in Rupiah
  const formatRupiah = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "Rp 0";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(numAmount)
      .replace("IDR", "Rp");
  };

  // Helper function to format datetime to Indonesian format
  const formatDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

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
  };

  const { data, isLoading, refetch } = useGetPosTransactionsQuery({
    page: currentPage,
    paginate: itemsPerPage,
  });

  const { data: anggotaData } = useGetPosAnggotaQuery({
    page: 1,
    paginate: 100,
  });

  const { data: productData } = useGetProductListQuery({
    page: 1,
    paginate: 1000,
  });

  const {
    data: transactionDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useGetPosTransactionByIdQuery(
    selectedTransactionId !== null ? selectedTransactionId : 0,
    { skip: !selectedTransactionId }
  );

  const categoryList = useMemo(() => data?.data?.data || [], [data]);

  // Filter based on search & category (status)
  const filteredList = useMemo(() => {
    let list = categoryList;

    if (category && category !== "all") {
      const statusValue = CATEGORY_TO_STATUS[category];
      list = list.filter((item: PosTransaction) => item.status === statusValue);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((item: PosTransaction) => {
        const ref = item.reference?.toLowerCase() ?? "";
        const user = item.user_name?.toLowerCase() ?? "";
        const guest = item.guest_name?.toLowerCase() ?? "";
        return ref.includes(q) || user.includes(q) || guest.includes(q);
      });
    }

    return list;
  }, [categoryList, category, query]);

  const lastPage = useMemo(() => data?.data?.last_page || 1, [data]);

  const [deleteTransaction] = useDeletePosTransactionMutation();
  const [updateTransactionStatus] = useUpdatePosTransactionStatusMutation();
  const [updateTransaction] = useUpdatePosTransactionMutation();

  const handleDelete = async (item: PosTransaction) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus Transaksi POS?",
      text: item.reference,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteTransaction(item.id).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Transaksi POS dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus Transaksi POS", "error");
        console.error(error);
      }
    }
  };

  const handleStatusClick = (transaction: PosTransaction) => {
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status.toString());
    setIsStatusModalOpen(true);
  };

  const handleDetailClick = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setIsDetailModalOpen(true);
  };

  const handleEditClick = (transaction: PosTransaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      user_id: transaction.user_id?.toString() || "",
      guest_name: transaction.guest_name || "",
      guest_email: transaction.guest_email || "",
      guest_phone: transaction.guest_phone || "",
      payment_type: transaction.payment_type,
      wallet_id: "",
      status: transaction.status,
      shop_id: 1,
      products: [{ product_id: 1, quantity: 1 }],
      voucher: [],
    });
    setIsUpdateModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedTransaction) return;

    setIsUpdatingStatus(true);
    try {
      await updateTransactionStatus({
        id: selectedTransaction.id,
        status: parseInt(newStatus),
      }).unwrap();

      await refetch();
      setIsStatusModalOpen(false);
      setSelectedTransaction(null);
      Swal.fire("Berhasil", "Status transaksi berhasil diubah", "success");
    } catch (error) {
      Swal.fire("Gagal", "Gagal mengubah status transaksi", "error");
      console.error(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdateTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      const updateData = {
        user_id: formData.user_id || undefined,
        guest_name: formData.guest_name || undefined,
        guest_email: formData.guest_email || undefined,
        guest_phone: formData.guest_phone || undefined,
        payment_type: formData.payment_type,
        wallet_id: formData.wallet_id
          ? parseInt(formData.wallet_id)
          : undefined,
        status: formData.status,
        data: [
          {
            shop_id: formData.shop_id,
            details: formData.products,
          },
        ],
        voucher: formData.voucher.length > 0 ? formData.voucher : undefined,
      };

      await updateTransaction({
        id: selectedTransaction.id,
        data: updateData,
      }).unwrap();
      await refetch();
      setIsUpdateModalOpen(false);
      setSelectedTransaction(null);
      Swal.fire("Berhasil", "Transaksi POS berhasil diperbarui", "success");
    } catch (error) {
      Swal.fire("Gagal", "Gagal memperbarui transaksi POS", "error");
      console.error(error);
    }
  };

  const addProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { product_id: 1, quantity: 1 }],
    }));
  };

  const removeProduct = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const updateProduct = (
    index: number,
    field: "product_id" | "quantity",
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      ),
    }));
  };

  const getStatusInfo = (status: number) => {
    return (
      TRANSACTION_STATUS[status as TransactionStatusKey] || {
        label: "UNKNOWN",
        variant: "secondary",
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">POS Kasir History</h1>
      </div>

      <ProdukToolbar onSearchChange={setQuery} onCategoryChange={setCategory} />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2 whitespace-nowrap">Aksi</th>
                <th className="px-2 py-2 whitespace-nowrap">Reference</th>
                <th className="px-2 py-2 whitespace-nowrap">Ref Number</th>
                <th className="px-4 py-2 whitespace-nowrap">Customer</th>
                <th className="px-4 py-2 whitespace-nowrap">Harga</th>
                <th className="px-4 py-2 whitespace-nowrap">Diskon</th>
                <th className="px-4 py-2 whitespace-nowrap">
                  Biaya Pengiriman
                </th>
                <th className="px-4 py-2 whitespace-nowrap">Total harga</th>
                <th className="px-4 py-2 whitespace-nowrap">Tipe Pembayaran</th>
                <th className="px-4 py-2 whitespace-nowrap">Payment Link</th>
                <th className="px-4 py-2 whitespace-nowrap">Tanggal</th>
                <th className="px-4 py-2 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredList.map((item: PosTransaction) => {
                  const statusInfo = getStatusInfo(item.status);
                  return (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-2">
                        <ActionsGroup
                          handleDetail={() => handleDetailClick(item.id)}
                          handleEdit={() => handleEditClick(item)}
                          handleDelete={() => handleDelete(item)}
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {item.reference}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {item.ref_number}
                      </td>
                      <td className="px-4 py-2">
                        {item.user_name || item.guest_name || "Guest"}
                      </td>
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
                        <Badge variant="outline">
                          {
                            POS_PAYMENT_TYPES[
                              item.payment_type as keyof typeof POS_PAYMENT_TYPES
                            ]
                          }
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        {item.payment_link ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2 py-1 h-auto"
                            onClick={() =>
                              item.payment_link &&
                              window.open(
                                item.payment_link,
                                "_blank",
                                "noopener,noreferrer"
                              )
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

      {/* Update Transaction Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Transaksi POS</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_type">Tipe Pembayaran</Label>
                <Select
                  value={formData.payment_type}
                  onValueChange={(value: "automatic" | "manual" | "saldo") =>
                    setFormData((prev) => ({ ...prev, payment_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="saldo">Saldo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">PENDING</SelectItem>
                    <SelectItem value="1">CAPTURED</SelectItem>
                    <SelectItem value="2">SETTLEMENT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.payment_type === "saldo" && (
              <div>
                <Label htmlFor="user_id">Anggota</Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(value) => {
                    const selectedAnggota = anggotaData?.data?.data?.find(
                      (anggota) => anggota.user_id.toString() === value
                    );
                    setFormData((prev) => ({
                      ...prev,
                      user_id: value,
                      wallet_id: selectedAnggota?.id?.toString() || "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih anggota" />
                  </SelectTrigger>
                  <SelectContent>
                    {anggotaData?.data?.data?.map((anggota) => (
                      <SelectItem
                        key={anggota.id}
                        value={anggota.user_id.toString()}
                      >
                        {anggota.name} - {anggota.reference} (Saldo:{" "}
                        {formatRupiah(anggota.balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guest_name">Nama Guest</Label>
                <Input
                  id="guest_name"
                  value={formData.guest_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      guest_name: e.target.value,
                    }))
                  }
                  placeholder="Nama guest (opsional)"
                />
              </div>

              <div>
                <Label htmlFor="guest_email">Email Guest</Label>
                <Input
                  id="guest_email"
                  type="email"
                  value={formData.guest_email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      guest_email: e.target.value,
                    }))
                  }
                  placeholder="Email guest (opsional)"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="guest_phone">Telepon Guest</Label>
              <Input
                id="guest_phone"
                value={formData.guest_phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    guest_phone: e.target.value,
                  }))
                }
                placeholder="Telepon guest (opsional)"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Produk</Label>
                <Button type="button" onClick={addProduct} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Produk
                </Button>
              </div>
              {formData.products.map((product, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <Select
                      value={product.product_id.toString()}
                      onValueChange={(value) =>
                        updateProduct(index, "product_id", parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Produk" />
                      </SelectTrigger>
                      <SelectContent>
                        {productData?.data?.map((prod) => (
                          <SelectItem key={prod.id} value={prod.id.toString()}>
                            {prod.name} - {formatRupiah(prod.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={product.quantity}
                      onChange={(e) =>
                        updateProduct(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      min="1"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeProduct(index)}
                    disabled={formData.products.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor="voucher">Voucher (Opsional)</Label>
              <Input
                id="voucher"
                placeholder="Masukkan ID voucher (pisahkan dengan koma untuk multiple voucher)"
                value={formData.voucher.join(", ")}
                onChange={(e) => {
                  const voucherIds = e.target.value
                    .split(",")
                    .map((id) => parseInt(id.trim()))
                    .filter((id) => !isNaN(id));
                  setFormData((prev) => ({ ...prev, voucher: voucherIds }));
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Contoh: 1, 2, 3 (untuk multiple voucher)
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsUpdateModalOpen(false)}
              >
                Batal
              </Button>
              <Button onClick={handleUpdateTransaction}>
                Update Transaksi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                Customer:{" "}
                {selectedTransaction?.user_name ||
                  selectedTransaction?.guest_name}
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
                disabled={isUpdatingStatus}
              >
                Batal
              </Button>
              <Button onClick={handleStatusUpdate} disabled={isUpdatingStatus}>
                {isUpdatingStatus ? "Memperbarui..." : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail Transaksi POS</DialogTitle>
          </DialogHeader>
          {isDetailLoading ? (
            <div className="text-center p-8">Memuat detail...</div>
          ) : isDetailError || !transactionDetail ? (
            <div className="text-center p-8 text-red-500">
              Gagal memuat detail transaksi.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ringkasan Transaksi</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>ID Transaksi:</strong>{" "}
                    {transactionDetail.data.reference}
                  </p>
                  <p>
                    <strong>Ref Number:</strong>{" "}
                    {transactionDetail.data.ref_number}
                  </p>
                  <p>
                    <strong>Order ID:</strong> {transactionDetail.data.order_id}
                  </p>
                  <p>
                    <strong>Nama Pelanggan:</strong>{" "}
                    {transactionDetail.data.user_name ||
                      transactionDetail.data.guest_name ||
                      "Guest"}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {transactionDetail.data.user_email ||
                      transactionDetail.data.guest_email ||
                      "-"}
                  </p>
                  <p>
                    <strong>Telepon:</strong>{" "}
                    {transactionDetail.data.guest_phone || "-"}
                  </p>
                  <p>
                    <strong>Tanggal:</strong>{" "}
                    {formatDateTime(transactionDetail.data.created_at)}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Badge
                      variant={
                        getStatusInfo(transactionDetail.data.status).variant
                      }
                    >
                      {getStatusInfo(transactionDetail.data.status).label}
                    </Badge>
                  </p>
                  <p>
                    <strong>Tipe Pembayaran:</strong>{" "}
                    {
                      POS_PAYMENT_TYPES[
                        transactionDetail.data
                          .payment_type as keyof typeof POS_PAYMENT_TYPES
                      ]
                    }
                  </p>
                  <p>
                    <strong>Tipe:</strong> {transactionDetail.data.type}
                  </p>
                  {transactionDetail.data.paid_at && (
                    <p>
                      <strong>Tanggal Bayar:</strong>{" "}
                      {formatDateTime(transactionDetail.data.paid_at)}
                    </p>
                  )}
                  {transactionDetail.data.expires_at && (
                    <p>
                      <strong>Kedaluwarsa:</strong>{" "}
                      {formatDateTime(transactionDetail.data.expires_at)}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Totals */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Rincian Harga</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatRupiah(transactionDetail.data.total)}</span>
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span>Diskon:</span>
                      <span>
                        {formatRupiah(transactionDetail.data.discount_total)}
                      </span>
                    </div>
                    <div className="flex justify-between text-blue-600">
                      <span>Biaya Pengiriman:</span>
                      <span>
                        {formatRupiah(transactionDetail.data.shipment_cost)}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Akhir:</span>
                        <span>
                          {formatRupiah(transactionDetail.data.grand_total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {transactionDetail.data.address_line_1 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Alamat</h3>
                    <div className="text-sm">
                      <p>{transactionDetail.data.address_line_1}</p>
                      {transactionDetail.data.address_line_2 && (
                        <p>{transactionDetail.data.address_line_2}</p>
                      )}
                      {transactionDetail.data.postal_code && (
                        <p>{transactionDetail.data.postal_code}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
