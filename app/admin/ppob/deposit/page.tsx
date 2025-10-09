"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useModal from "@/hooks/use-modal";
import {
  useGetDepositListQuery,
  useCreateDepositMutation,
  useUpdateDepositMutation,
  useDeleteDepositMutation,
} from "@/services/ppob/deposit.service";
import { Deposit } from "@/types/ppob/deposit";
import FormDeposit from "@/components/form-modal/ppob/deposit-form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ActionsGroup from "@/components/admin-components/actions-group";
import { Plus } from "lucide-react";

// MOCK: PaymentInvoice Component
type DetailItemProps = {
    label: string;
    value: string | number;
    large?: boolean;
    copyable?: boolean;
};

const DetailItem = ({ label, value, large = false, copyable = false }: DetailItemProps) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        // Mock copy logic
        console.log(`Mock Copy: ${value}`);
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

const PaymentInvoice = ({ data, onDone, onCancel }: { data: Deposit, onDone: () => void, onCancel: () => void }) => {
    const invoice = data;

    const expirationDate = new Date(new Date(invoice.created_at).getTime() + 24 * 60 * 60 * 1000);
    const formattedExpiry = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'full',
        timeStyle: 'short',
    }).format(expirationDate);

    // Mengambil 3 digit terakhir dari nominal (amount) untuk kode unik.
    const uniqueCode = String(invoice.amount).slice(-3);


    return (
        <div className="flex justify-center items-center p-4 sm:p-8 w-full h-full bg-black/50">
            {/* PERUBAHAN UKURAN MODAL: max-w-xl menjadi max-w-2xl */}
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
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(invoice.amount)}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            Kode Unik: <span className="font-bold text-blue-800 dark:text-blue-200">{uniqueCode}</span>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <DetailItem 
                            label={`Bank Tujuan: ${invoice.bank || 'N/A'}`}
                            value={invoice.account_number ?? ""}
                            large={true}
                            copyable={true}
                        />

                        <div className="grid grid-cols-2 gap-4 border-t pt-4 border-gray-100 dark:border-zinc-800">
                            <DetailItem 
                                label="Metode Pembayaran"
                                value={invoice.payment_method || 'N/A'}
                            />
                            <DetailItem 
                                label="Nama Pemilik Rekening"
                                value={invoice.owner_name || 'N/A'}
                            />
                            <DetailItem 
                                label="Nomor Transaksi (Notes)"
                                value={invoice.notes || 'N/A'}
                                copyable={true}
                            />
                            <DetailItem 
                                label="Tanggal Dibuat"
                                value={new Date(invoice.created_at).toLocaleDateString('id-ID')}
                            />
                        </div>
                    </div>
                </div>

                {/* AREA FOOTER: Sudah menggunakan flex dan w-full pada tombol untuk 1 baris */}
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

export default function DepositPage() {
  const [form, setForm] = useState<Partial<Deposit>>({
    bank: "",
    owner_name: "",
    amount: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading, refetch } = useGetDepositListQuery({
    page: currentPage,
    paginate: itemsPerPage,
  });

  const [invoiceData, setInvoiceData] = useState<Deposit | null>(null); 

  const categoryList = useMemo(() => data?.data || [], [data]);
  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  const [createDeposit, { isLoading: isCreating }] =
    useCreateDepositMutation();
  const [updateDeposit, { isLoading: isUpdating }] =
    useUpdateDepositMutation();
  const [deleteDeposit] = useDeleteDepositMutation();

  const handleSubmit = async () => {
    try {
      const payload = {
        bank: form.bank || "",
        owner_name: form.owner_name || "",
        amount: form.amount || 0,
      };

      if (editingId) {
        await updateDeposit({ id: editingId, payload }).unwrap();
        Swal.fire("Sukses", "Deposit diperbarui", "success");
      } else {
        const response = await createDeposit(payload).unwrap();
        Swal.fire("Sukses", "Deposit ditambahkan", "success");
        // SET DATA INVOICE DARI RESPONSE API
        setInvoiceData(response); 
      }

      setForm({ bank: "", owner_name: "", amount: 0 });
      setEditingId(null);
      await refetch();
    //   closeModal();
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Gagal menyimpan data", "error");
    }
  };

  const handleCloseModal = () => {
    setForm({ bank: "", owner_name: "", amount: 0 });
    setEditingId(null);
    setReadonly(false);
    setInvoiceData(null); // RESET data invoice
    closeModal();
  };

  const handleEdit = (item: Deposit) => {
    setForm({ ...item });
    setEditingId(item.id);
    setReadonly(false);
    setInvoiceData(null);
    openModal();
  };

//   const handleDetail = (item: Deposit) => {
//     setForm(item);
//     setReadonly(true);
//     setInvoiceData(null); // RESET data invoice
//     openModal();
//   };
  const handleDetail = (item: Deposit) => {
    // 1. Reset state edit/readonly
    setEditingId(item.id); 
    setReadonly(true);
    setForm({}); // Tidak perlu mengisi form

    // 2. Isi invoiceData dengan item yang ada
    setInvoiceData(item); 
    
    // 3. Buka Modal
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
  
  const handleDelete = async (item: Deposit) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus Deposit?",
      text: item.bank,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteDeposit(item.id).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Deposit dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus Deposit", "error");
        console.error(error);
      }
    }
  };

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!query) return categoryList;
    return categoryList.filter(
      (item) =>
        item.bank.toLowerCase().includes(query.toLowerCase())
    );
  }, [categoryList, query]);

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-md bg-white p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Kiri: filter */}
          <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Cari deposit..."
              value={query}
              onChange={(e) => {
                const q = e.target.value;
                setQuery(q);
              }}
              className="w-full sm:max-w-xs"
            />
          </div>

          {/* Kanan: aksi */}
          <div className="shrink-0 flex flex-wrap items-center gap-2">
            {/* Tambah data (opsional) */}
            {openModal && <Button onClick={openModal}><Plus /> Deposit</Button>}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Bank</th>
                <th className="px-4 py-2">Nama Pemilik</th>
                <th className="px-4 py-2">Nominal</th>
                <th className="px-4 py-2">Metode Pembayaran</th>
                <th className="px-4 py-2">No. Virtual Account</th>
                <th className="px-4 py-2">Catatan</th>
                <th className="px-4 py-2">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
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
                    <td className="px-4 py-2 font-mono text-sm">{item.bank}</td>
                    <td className="px-4 py-2 font-medium">{item.owner_name}</td>
                    <td className="px-4 py-2">{item.amount}</td>
                    <td className="px-4 py-2">{item.payment_method}</td>
                    <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                      {item.account_number}
                    </td>
                    <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                      {item.notes}
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
          {/* KONDISI LOGIKA MODAL: JIKA ADA invoiceData, TAMPILKAN INVOICE */}
          {invoiceData ? (
            <PaymentInvoice
              data={invoiceData}
              onDone={handleInvoiceDone}
              onCancel={handleCloseModal}
            />
          ) : (
            // JIKA TIDAK ADA invoiceData, TAMPILKAN FORMULIR DEPOSIT
            <FormDeposit
              form={form}
              setForm={setForm}
              onCancel={handleCloseModal}
              onSubmit={handleSubmit}
              readonly={readonly}
              // Hanya gunakan isCreating jika mode tambah, atau isUpdating jika mode edit
              isLoading={editingId ? isUpdating : isCreating} 
            />
          )}
        </div>
      )}
    </div>
  );
}

