"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useModal from "@/hooks/use-modal";
import {
  useGetTransaksiListQuery,
  useCreateTransaksiMutation,
  useUpdateTransaksiMutation,
  useDeleteTransaksiMutation,
} from "@/services/ppob/transaksi.service";
// HAPUS: Type Transaksi lama tidak lagi digunakan untuk invoice
import { Transaksi, ProductDetails } from "@/types/ppob/transaksi";
// Pastikan tidak ada import Transaksi dari "@/types/ppob/transaksi" di file ini!
import FormTransaksi from "@/components/form-modal/ppob/transaksi-form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ActionsGroup from "@/components/admin-components/actions-group";
import { Plus } from "lucide-react";

// =================================================================
// 1. DEFINISI TYPE BARU SESUAI API RESPONSE
// =================================================================

// Type untuk nested object 'payment' dari API response
interface ApiPayment {
  id: number;
  channel: string; // e.g., 'bca'
  account_number: string;
  payment_type: string; // e.g., 'bank_transfer'
  expired_at: string;
  amount: number;
}

// Type untuk nested object 'product_details' dari API response
interface ApiProductDetails {
  id: number;
  name: string;
  sku: string;
  sell_price: string;
}

// Type untuk object 'data' utama dari API response
interface ApiTransaksiData {
  id: number;
  user_id: number;
  customer_no: string;
  reference: string; // Ini akan digunakan sebagai 'notes' atau nomor transaksi
  amount: string; // Perhatikan ini adalah string di API
  created_at: string;
  product_details: ApiProductDetails;
  payment: ApiPayment;
}

// Type untuk keseluruhan API response saat create
interface ApiResponse {
  code: number;
  message: string;
  data: Transaksi;
}


// =================================================================
// 2. MOCK: PaymentInvoice Component (SUDAH DISESUAIKAN)
// =================================================================
type DetailItemProps = {
    label: string;
    value: string | number;
    large?: boolean;
    copyable?: boolean;
};

const DetailItem = ({ label, value, large = false, copyable = false }: DetailItemProps) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(String(value));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`flex flex-col ${large ? 'py-2' : 'py-1'}`}>
            <p className={`font-medium ${large ? 'text-lg text-gray-800 dark:text-gray-200' : 'text-sm text-gray-500 dark:text-gray-400'}`}>
                {label}
            </p>
            <div className="flex items-center justify-between">
                <p className={`font-extrabold truncate ${large ? 'text-3xl text-blue-600 dark:text-blue-400' : 'text-base text-gray-900 dark:text-white'}`}>
                    {value}
                </p>
                {copyable && (
                    <button 
                        onClick={handleCopy}
                        className={`ml-4 px-3 py-1 text-xl font-semibold rounded-full transition-colors ${copied ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-zinc-700 dark:text-blue-300'}`}
                        disabled={copied}
                    >
                        {copied ? 'Tersalin!' : 'Salin'}
                    </button>
                )}
            </div>
            {large && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pastikan transfer tepat hingga digit terakhir.</p>}
        </div>
    );
};

// Ubah prop 'data' menjadi type 'ApiTransaksiData'
const PaymentInvoice = ({ data, onDone, onCancel }: { data: ApiTransaksiData, onDone: () => void, onCancel: () => void }) => {
    // Gunakan expiration date langsung dari API jika ada
    const expirationDate = new Date(data.payment.expired_at);
    const formattedExpiry = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'full',
        timeStyle: 'short',
    }).format(expirationDate);
    
    // Konversi amount dari string ke number untuk kalkulasi dan formatting
    const numericAmount = parseFloat(data.amount);
    const uniqueCode = String(numericAmount).slice(-3);

    // Fungsi untuk memformat nama channel bank agar lebih rapi
    const formatBankChannel = (channel: string) => {
        if (!channel) return 'N/A';
        return channel.toUpperCase();
    }

    // Fungsi untuk memformat tipe pembayaran
    const formatPaymentType = (type: string) => {
        if (!type) return 'N/A';
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // bank_transfer -> Bank Transfer
    }

    return (
        <div className="flex justify-center items-center p-4 sm:p-8 w-full h-full bg-black/50">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl border border-gray-100 dark:border-zinc-800 transition-all duration-300">
                <div className="p-6 sm:p-8 space-y-6">
                    
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">Invoice Pembayaran</h1>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Selesaikan pembayaran sebelum batas waktu.</p>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 rounded-lg shadow-sm">
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                            Batas Akhir Pembayaran:
                        </p>
                        <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                            {formattedExpiry}
                        </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-inner">
                        <div className="flex justify-between items-end">
                            <p className="text-base font-semibold text-blue-800 dark:text-blue-300">
                                Total Pembayaran
                            </p>
                             <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                (Termasuk Kode Unik)
                            </p>
                        </div>
                        <p className="text-5xl font-black text-blue-700 dark:text-blue-300 mt-2 tracking-tighter">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(numericAmount)}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            Kode Unik: <span className="font-bold text-blue-800 dark:text-blue-200">{uniqueCode}</span>
                        </p>
                    </div>
                    
                    {/* Mapping data dari struktur API baru */}
                    <div className="space-y-4">
                        {data.payment.channel.toLowerCase() === "qris" ? (
                            <div className="flex flex-col items-center space-y-3">
                                <p className="font-semibold text-lg text-center text-blue-700 dark:text-blue-300">
                                    Scan QRIS untuk Membayar<br></br>Produk: {data.product_details.name}
                                </p>
                                <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700 shadow">
                                    <img
                                        src={data.payment.account_number}
                                        alt="QRIS"
                                        className="w-56 h-56 object-contain mx-auto"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <DetailItem 
                                    label={`Transfer Melalui: ${formatBankChannel(data.payment.channel)}`}
                                    value={data.payment.account_number ?? ""}
                                    large={true}
                                    copyable={true}
                                />

                                <div className="grid grid-cols-2 gap-4 border-t pt-4 border-gray-100 dark:border-zinc-800">
                                    <DetailItem 
                                        label="Produk"
                                        value={data.product_details.name || 'N/A'}
                                    />
                                    <DetailItem 
                                        label="Metode Pembayaran"
                                        value={formatPaymentType(data.payment.payment_type)}
                                    />
                                    <DetailItem 
                                        label="Nomor Transaksi (Reference)"
                                        value={data.reference || 'N/A'}
                                        copyable={true}
                                    />
                                    <DetailItem 
                                        label="Tanggal Dibuat"
                                        value={new Date(data.created_at).toLocaleDateString('id-ID')}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-6 sm:p-8 bg-gray-50 dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={onCancel} className="w-full">
                        Kembali
                    </Button>
                    <Button onClick={onDone} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                        Saya Sudah Bayar
                    </Button>
                </div>
            </div>
        </div>
    );
}

// =================================================================
// 3. HALAMAN UTAMA (TRANSAKSIPAGE)
// =================================================================
export default function TransaksiPage() {
  // form state tetap menggunakan Partial<Transaksi> untuk form tambah/edit
  const [form, setForm] = useState<Partial<Transaksi>>({
    user_id: 1,
    ppob_product_id: 0,
    customer_no: "",
    payment_method: "",
    payment_channel: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading, refetch } = useGetTransaksiListQuery({
    page: currentPage,
    paginate: itemsPerPage,
  });
  
  // State untuk invoice sekarang menggunakan type ApiTransaksiData
  const [invoiceData, setInvoiceData] = useState<ApiTransaksiData | null>(null); 

  // data list dari `useGetTransaksiListQuery` tetap menggunakan type `Transaksi`
  const categoryList: Transaksi[] = useMemo(() => data?.data || [], [data]);
  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  const [createTransaksi, { isLoading: isCreating }] =
    useCreateTransaksiMutation();
  const [updateTransaksi, { isLoading: isUpdating }] =
    useUpdateTransaksiMutation();
  const [deleteTransaksi] = useDeleteTransaksiMutation();

  const handleSubmit = async () => {
    try {
      const payload = {
        user_id: 1,
        ppob_product_id: form.ppob_product_id || 0,
        customer_no: form.customer_no || "",
        payment_method: form.payment_method || "",
        payment_channel: form.payment_channel || "",
      };

      if (editingId) {
        await updateTransaksi({ id: editingId, payload }).unwrap();
        Swal.fire("Sukses", "Transaksi diperbarui", "success");
        // Jika mode edit, tutup modal setelah submit
        closeModal(); 
      } else {
        // Panggil API create dan dapatkan response lengkapnya
        const response = await createTransaksi(payload).unwrap();
        Swal.fire("Sukses", "Transaksi ditambahkan", "success");
        // SET DATA INVOICE DARI `response.data`
        setInvoiceData(response as unknown as ApiTransaksiData);
      }

      // Reset form dan state edit hanya jika tidak menampilkan invoice
      if (!invoiceData) {
          setForm({ ppob_product_id: 0, customer_no: "", payment_method: "", payment_channel: "" });
          setEditingId(null);
      }
      await refetch();
    
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Gagal menyimpan data", "error");
    }
  };

  const handleCloseModal = () => {
    setForm({ user_id: 1, ppob_product_id: 0, customer_no: "", payment_method: "", payment_channel: "" });
    setEditingId(null);
    setReadonly(false);
    setInvoiceData(null); // RESET data invoice saat modal ditutup
    closeModal();
  };
  
  // Handler untuk tombol tambah data
  const handleAdd = () => {
    setForm({ user_id: 1, ppob_product_id: 0, customer_no: "", payment_method: "", payment_channel: "" });
    setEditingId(null);
    setReadonly(false);
    setInvoiceData(null);
    openModal();
  }

  const handleEdit = (item: Transaksi) => {
    setForm({ ...item });
    setEditingId(item.id);
    setReadonly(false);
    setInvoiceData(null);
    openModal();
  };

  const handleDetail = (item: Transaksi) => {
    setEditingId(null); 
    setReadonly(true);
    setForm({});

    // Karena `item` dari list memiliki struktur sederhana, kita perlu
    // mentransformasikannya agar sesuai dengan struktur `ApiTransaksiData`
    // yang diharapkan oleh `PaymentInvoice`.
    // Ini adalah "mock" data transformation.
    const transformedData: ApiTransaksiData = {
        id: item.id,
        user_id: 0, // Mock data
        customer_no: '', // Mock data
        reference: item.reference ?? '', // Use 'reference' or fallback to empty string
        amount: String(item.amount),
        created_at: item.created_at,
        product_details: { // Mock data
            id: 0,
            name: 'Lihat Detail Transaksi',
            sku: '',
            sell_price: String(item.amount),
        },
        payment: { // Mock data
            id: 0,
            channel: item.payment_channel ?? '', // Use 'payment_channel' or fallback to empty string
            account_number: item.payment.account_number ?? '', // Use 'virtual_account' or fallback to empty string
            payment_type: item.payment_method ?? '', // Use 'payment_method' or fallback to empty string
            expired_at: new Date(new Date(item.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString(),
            amount: item.amount,
        }
    };
    
    setInvoiceData(transformedData); 
    openModal();
  };

  const handleInvoiceDone = async () => {
    Swal.fire({
      title: "Pemberitahuan",
      text: "Permintaan Anda untuk memeriksa pembayaran telah diterima. Harap tunggu konfirmasi.",
      icon: "info"
    });
    await refetch();
    handleCloseModal();
  };
  
  const handleDelete = async (item: Transaksi) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus Transaksi?",
      text: item.reference,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteTransaksi(item.id).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Transaksi dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus Transaksi", "error");
        console.error(error);
      }
    }
  };

  const filteredData = useMemo(() => {
    if (!query) return categoryList;
    return categoryList.filter(
      (item) =>
        item.reference?.toLowerCase().includes(query.toLowerCase())
    );
  }, [categoryList, query]);

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-md bg-white p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Cari transaksi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:max-w-xs"
            />
          </div>
          <div className="shrink-0 flex flex-wrap items-center gap-2">
            <Button onClick={handleAdd}><Plus /> Transaksi</Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Reference</th>
                <th className="px-4 py-2">Order ID</th>
                <th className="px-4 py-2">Nomor / ID Pelanggan</th>
                <th className="px-4 py-2">Produk</th>
                <th className="px-4 py-2">Harga</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <ActionsGroup
                          handleDetail={() => handleDetail(item)}
                          handleEdit={() => handleEdit(item)}
                          handleDelete={() => handleDelete(item)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 font-mono text-sm">{item.reference}</td>
                    <td className="px-4 py-2 font-medium">{item.order_id}</td>
                    <td className="px-4 py-2 font-medium">{item.customer_no}</td>
                    <td className="px-4 py-2 font-medium">{item.product.name}</td>
                    <td className="px-4 py-2">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.amount)}</td>
                    <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                      {item.status}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))
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

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          {invoiceData ? (
            <PaymentInvoice
              data={invoiceData}
              onDone={handleInvoiceDone}
              onCancel={handleCloseModal}
            />
          ) : (
            <FormTransaksi
              form={form}
              setForm={setForm}
              onCancel={handleCloseModal}
              onSubmit={handleSubmit}
              readonly={readonly}
              isLoading={editingId ? isUpdating : isCreating} 
            />
          )}
        </div>
      )}
    </div>
  );
}