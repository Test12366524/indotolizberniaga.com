"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";

export interface ApiPayment {
  id: number;
  channel: string;
  account_number: string; // VA / URL QRIS
  payment_type: string; // 'bank_transfer' / 'qris' / ...
  expired_at: string;
  amount: number;
}

export interface ApiProductDetails {
  id: number;
  name: string;
  sku: string;
  sell_price: string;
}

export interface ApiTransaksiData {
  id: number;
  user_id: number;
  customer_no: string;
  reference: string;
  amount: string; // string di API
  created_at: string;
  product_details: ApiProductDetails;
  payment: ApiPayment;
}

// =================== INVOICE (re-usable) ===================
type DetailItemProps = {
  label: string;
  value: string | number;
  large?: boolean;
  copyable?: boolean;
};

const DetailItem = ({
  label,
  value,
  large = false,
  copyable = false,
}: DetailItemProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex flex-col ${large ? "py-2" : "py-1"}`}>
      <p
        className={`font-medium ${
          large
            ? "text-lg text-gray-800 dark:text-gray-200"
            : "text-sm text-gray-500 dark:text-gray-400"
        }`}
      >
        {label}
      </p>
      <div className="flex items-center justify-between">
        <p
          className={`font-extrabold truncate ${
            large
              ? "text-3xl text-blue-600 dark:text-blue-400"
              : "text-base text-gray-900 dark:text-white"
          }`}
        >
          {value}
        </p>
        {copyable && (
          <button
            onClick={handleCopy}
            className={`ml-4 px-3 py-1 text-xl font-semibold rounded-full transition-colors ${
              copied
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-zinc-700 dark:text-blue-300"
            }`}
            disabled={copied}
          >
            {copied ? "Tersalin!" : "Salin"}
          </button>
        )}
      </div>
      {large && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Pastikan transfer tepat hingga digit terakhir.
        </p>
      )}
    </div>
  );
};

export const PaymentInvoice = ({
  data,
  onDone,
  onCancel,
}: {
  data: ApiTransaksiData;
  onDone: () => void;
  onCancel: () => void;
}) => {
  const expirationDate = new Date(data.payment.expired_at);
  const formattedExpiry = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(expirationDate);

  const numericAmount = parseFloat(data.amount);
  const uniqueCode = String(numericAmount).slice(-3);

  const formatBankChannel = (channel: string) =>
    channel ? channel.toUpperCase() : "N/A";
  const formatPaymentType = (type: string) =>
    type
      ? type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      : "N/A";

  return (
    <div className="flex justify-center items-center p-4 sm:p-8 w-full h-full bg-black/50">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl border border-gray-100 dark:border-zinc-800 transition-all duration-300">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
              Invoice Pembayaran
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
              Selesaikan pembayaran sebelum batas waktu.
            </p>
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
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(numericAmount)}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Kode Unik:{" "}
              <span className="font-bold text-blue-800 dark:text-blue-200">
                {uniqueCode}
              </span>
            </p>
          </div>

          <div className="space-y-4">
            {data.payment.channel.toLowerCase() === "qris" ? (
              <div className="flex flex-col items-center space-y-3">
                <p className="font-semibold text-lg text-center text-blue-700 dark:text-blue-300">
                  Scan QRIS untuk Membayar
                  <br />
                  Produk: {data.product_details.name}
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
                  label={`Transfer Melalui: ${formatBankChannel(
                    data.payment.channel
                  )}`}
                  value={data.payment.account_number ?? ""}
                  large
                  copyable
                />

                <div className="grid grid-cols-2 gap-4 border-t pt-4 border-gray-100 dark:border-zinc-800">
                  <DetailItem
                    label="Produk"
                    value={data.product_details.name || "N/A"}
                  />
                  <DetailItem
                    label="Metode Pembayaran"
                    value={formatPaymentType(data.payment.payment_type)}
                  />
                  <DetailItem
                    label="Nomor Transaksi (Reference)"
                    value={data.reference || "N/A"}
                    copyable
                  />
                  <DetailItem
                    label="Tanggal Dibuat"
                    value={new Date(data.created_at).toLocaleDateString(
                      "id-ID"
                    )}
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
          <Button
            onClick={onDone}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            Saya Sudah Bayar
          </Button>
        </div>
      </div>
    </div>
  );
};

// =================== FORMS (UI TETAP, LOGIC DISAMAKAN) ===================
type PpobCategory = "pulsa" | "data" | "pln" | "pdam" | "ewallet" | "internet";

type SubmitArgs = {
  customer_no: string;
  denomination?: number | null; // khusus pulsa
};

type PpobFormsProps = {
  category: PpobCategory;
  isSubmitting?: boolean;
  onSubmit: (args: SubmitArgs) => Promise<void> | void;
};

// util kecil
const digitsOnly = (s: string) => s.replace(/\D+/g, "");

const PulsaInner = ({
  isSubmitting,
  onSubmit,
}: {
  isSubmitting?: boolean;
  onSubmit: (args: SubmitArgs) => void;
}) => {
  const [nomor, setNomor] = useState("");
  const [produk, setProduk] = useState<number | null>(null);
  const denominations = [10000, 25000, 50000, 100000];

  const handleSubmit = () => {
    const d = digitsOnly(nomor);
    if (!d || d.length < 10 || d.length > 14 || !d.startsWith("08")) {
      Swal.fire(
        "Gagal",
        "Nomor telepon harus 10–14 digit dan diawali 08.",
        "error"
      );
      return;
    }
    if (!produk) {
      Swal.fire("Gagal", "Pilih nominal terlebih dahulu.", "error");
      return;
    }
    onSubmit({ customer_no: d, denomination: produk });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <label
          htmlFor="nomor-telepon"
          className="block text-sm font-bold text-gray-800 mb-2"
        >
          Nomor Telepon
        </label>
        <input
          id="nomor-telepon"
          type="tel"
          value={nomor}
          onChange={(e) => setNomor(e.target.value)}
          placeholder="Contoh: 081234567890"
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E53935]"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Pilih Nominal
        </label>
        <div className="grid grid-cols-2 gap-3">
          {denominations.map((d) => (
            <button
              key={d}
              onClick={() => setProduk(d)}
              type="button"
              className={`text-left p-4 border rounded-2xl transition-all ${
                produk === d
                  ? "bg-[#E53935] text-white border-[#E53935] ring-2 ring-offset-2 ring-[#E53935]"
                  : "bg-white hover:border-[#E53935] hover:bg-red-50"
              }`}
            >
              <span className="font-bold text-lg">
                Rp {d.toLocaleString("id-ID")}
              </span>
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-[#E53935] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-red-700 transition-colors disabled:opacity-60"
      >
        {isSubmitting ? "Memproses..." : "Beli Sekarang"}
      </button>
    </div>
  );
};

const PlnInner = ({
  isSubmitting,
  onSubmit,
}: {
  isSubmitting?: boolean;
  onSubmit: (args: SubmitArgs) => void;
}) => {
  const [idPelanggan, setIdPelanggan] = useState("");

  const handleCekTagihan = () => {
    const d = digitsOnly(idPelanggan);
    if (!d || d.length < 6) {
      Swal.fire(
        "Gagal",
        "Mohon isi ID Pelanggan/No. Meter yang valid.",
        "error"
      );
      return;
    }
    // Langsung create transaksi (logic disamakan: submit → invoice)
    onSubmit({ customer_no: d });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <label
          htmlFor="id-pelanggan"
          className="block text-sm font-bold text-gray-800 mb-2"
        >
          ID Pelanggan / Nomor Meter
        </label>
        <input
          id="id-pelanggan"
          type="text"
          value={idPelanggan}
          onChange={(e) => setIdPelanggan(e.target.value)}
          placeholder="Masukkan ID Pelanggan"
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E53935]"
        />
      </div>
      <button
        onClick={handleCekTagihan}
        disabled={isSubmitting}
        className="w-full bg-[#E53935] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-red-700 transition-colors disabled:opacity-60"
      >
        {isSubmitting ? "Memproses..." : "Cek Tagihan"}
      </button>
    </div>
  );
};

const GenericInner = ({
  serviceName,
  isSubmitting,
  onSubmit,
}: {
  serviceName: string;
  isSubmitting?: boolean;
  onSubmit: (args: SubmitArgs) => void;
}) => {
  const [nomor, setNomor] = useState("");

  const handleSubmit = () => {
    const d = digitsOnly(nomor);
    if (!d || d.length < 5) {
      Swal.fire(
        "Gagal",
        `Mohon isi nomor/ID yang valid untuk ${serviceName}.`,
        "error"
      );
      return;
    }
    onSubmit({ customer_no: d });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <label
          htmlFor="generic-input"
          className="block text-sm font-bold text-gray-800 mb-2"
        >
          Nomor Pelanggan / ID
        </label>
        <input
          id="generic-input"
          type="text"
          placeholder={`Masukkan nomor untuk ${serviceName}`}
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E53935]"
          value={nomor}
          onChange={(e) => setNomor(e.target.value)}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-[#E53935] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-red-700 transition-colors disabled:opacity-60"
      >
        {isSubmitting ? "Memproses..." : "Lanjutkan"}
      </button>
    </div>
  );
};

export const PpobForms = ({
  category,
  isSubmitting,
  onSubmit,
}: PpobFormsProps) => {
  const content = useMemo(() => {
    switch (category) {
      case "pulsa":
        return <PulsaInner isSubmitting={isSubmitting} onSubmit={onSubmit} />;
      case "pln":
        return <PlnInner isSubmitting={isSubmitting} onSubmit={onSubmit} />;
      case "data":
        return (
          <GenericInner
            serviceName="Paket Data"
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        );
      case "pdam":
        return (
          <GenericInner
            serviceName="Air PDAM"
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        );
      case "ewallet":
        return (
          <GenericInner
            serviceName="E-Wallet"
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        );
      case "internet":
        return (
          <GenericInner
            serviceName="Internet & TV"
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        );
      default:
        return (
          <p className="text-center text-gray-500">
            Pilih layanan untuk memulai.
          </p>
        );
    }
  }, [category, isSubmitting, onSubmit]);

  return <>{content}</>;
};