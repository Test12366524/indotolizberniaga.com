"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, CreditCard, ShoppingCart } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

/* ===================== Utils ===================== */
const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("IDR", "")
    .trim();

const formatNumber = (num: number): string =>
  new Intl.NumberFormat("id-ID").format(num);

const last12MonthLabels = (): string[] => {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleString("id-ID", { month: "short", year: "2-digit" }));
  }
  return labels;
};

/* ===================== Mock Data (ganti dengan API) ===================== */
const mockMonthly = (base: number, jitter: number): number[] =>
  Array.from({ length: 12 }).map((_, i) => {
    const seasonal = Math.sin((i / 12) * Math.PI * 2) * 0.15;
    const v = base * (1 + seasonal) + Math.random() * jitter;
    return Math.max(0, Math.round(v));
  });

export default function MarketplaceDashboardPage() {
  // Labels 12 bulan
  const labels = useMemo(last12MonthLabels, []);

  // Transaksi per bulan (GMV) & Order per bulan
  const monthlyGMV = useMemo(() => mockMonthly(150_000_000, 40_000_000), []);
  const monthlyOrders = useMemo(() => mockMonthly(1200, 300), []);

  // Top 5 sellers & produk (berdasar GMV)
  const top5Seller = useMemo(
    () =>
      [
        { name: "Toko Nusantara", amount: 420_000_000 },
        { name: "Mega Elektronik", amount: 360_000_000 },
        { name: "FashionX", amount: 305_000_000 },
        { name: "Dapur Kita", amount: 260_000_000 },
        { name: "GadgetHub", amount: 230_000_000 },
      ] as const,
    []
  );

  const top5Product = useMemo(
    () =>
      [
        { name: "Smartphone A", amount: 190_000_000 },
        { name: "Air Fryer Pro", amount: 165_000_000 },
        { name: "Sneakers Z", amount: 150_000_000 },
        { name: "Headset X", amount: 120_000_000 },
        { name: "Kemeja Linen", amount: 100_000_000 },
      ] as const,
    []
  );

  // Ringkasan
  const totalCustomer = 12_350;
  const totalSeller = 845;
  const totalTransaksi = useMemo(
    () => monthlyGMV.reduce((a, b) => a + b, 0),
    [monthlyGMV]
  );
  const totalOrder = useMemo(
    () => monthlyOrders.reduce((a, b) => a + b, 0),
    [monthlyOrders]
  );

  const cards = [
    {
      title: "Total Customer",
      value: formatNumber(totalCustomer),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Seller",
      value: formatNumber(totalSeller),
      icon: Store,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Total Transaksi",
      value: formatRupiah(totalTransaksi),
      icon: CreditCard,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Total Order",
      value: formatNumber(totalOrder),
      icon: ShoppingCart,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ] as const;

  /* ===================== Chart.js datasets & options (typed) ===================== */
  // Line: GMV & Orders (dual axis)
  const transaksiData: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "GMV (Rp)",
        data: monthlyGMV,
        borderColor: "rgba(59,130,246,1)", // blue-500
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.35,
        pointRadius: 2,
        fill: true,
        yAxisID: "y", // rupiah
      },
      {
        label: "Order (Qty)",
        data: monthlyOrders,
        borderColor: "rgba(16,185,129,1)", // emerald-500
        backgroundColor: "rgba(16,185,129,0.15)",
        tension: 0.35,
        pointRadius: 2,
        fill: false,
        yAxisID: "y1", // quantity
      },
    ],
  };

  const transaksiOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"line">): string => {
            const v = ctx.parsed.y ?? 0;
            const label = ctx.dataset.label ?? "Data";
            if (ctx.dataset.yAxisID === "y") {
              return `${label}: Rp ${formatNumber(v)}`;
            }
            return `${label}: ${formatNumber(v)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        position: "left",
        ticks: {
          callback: (tickValue: string | number): string =>
            `Rp ${formatNumber(Number(tickValue))}`,
        },
      },
      y1: {
        beginAtZero: true,
        position: "right",
        grid: { drawOnChartArea: false },
        ticks: {
          callback: (tickValue: string | number): string =>
            `${formatNumber(Number(tickValue))}`,
        },
      },
    },
  };

  // Bar: Top 5 Seller (horizontal)
  const topSellerData: ChartData<"bar"> = {
    labels: top5Seller.map((s) => s.name),
    datasets: [
      {
        label: "GMV (Rp)",
        data: top5Seller.map((s) => s.amount),
        backgroundColor: "rgba(99,102,241,0.6)", // indigo-500
        borderColor: "rgba(99,102,241,1)",
        borderWidth: 1,
      },
    ],
  };

  const topSellerOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">): string =>
            `Rp ${formatNumber(Number(ctx.parsed.x))}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (tickValue: string | number): string =>
            `Rp ${formatNumber(Number(tickValue))}`,
        },
      },
    },
  };

  // Bar: Top 5 Produk (horizontal)
  const topProdukData: ChartData<"bar"> = {
    labels: top5Product.map((p) => p.name),
    datasets: [
      {
        label: "GMV (Rp)",
        data: top5Product.map((p) => p.amount),
        backgroundColor: "rgba(234,88,12,0.6)", // orange-600
        borderColor: "rgba(234,88,12,1)",
        borderWidth: 1,
      },
    ],
  };

  const topProdukOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">): string =>
            `Rp ${formatNumber(Number(ctx.parsed.x))}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (tickValue: string | number): string =>
            `Rp ${formatNumber(Number(tickValue))}`,
        },
      },
    },
  };

  /* ===================== Render ===================== */
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Informasi dan Grafik
        </h1>
        <p className="text-sm text-gray-500">
          Ringkasan customer, seller, transaksi, dan order
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card
              key={i}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${c.bg}`}>
                    <Icon className={`h-4 w-4 ${c.color}`} />
                  </div>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {c.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900 mt-[-25px] text-center">
                  {c.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        <Card className="h-80 2xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Grafik Transaksi (12 bulan berjalan)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <Line data={transaksiData} options={transaksiOptions} />
          </CardContent>
        </Card>

        <Card className="h-80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Grafik Top 5 Seller
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <Bar data={topSellerData} options={topSellerOptions} />
          </CardContent>
        </Card>

        <Card className="h-80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Grafik Top 5 Produk
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <Bar data={topProdukData} options={topProdukOptions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}