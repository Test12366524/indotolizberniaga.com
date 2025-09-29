"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Banknote, CreditCard, CalendarDays } from "lucide-react";
import { useMemo } from "react";
import {
  useGetDashboardKoperasiHeadQuery,
  useGetSimpananChartQuery,
  useGetPinjamanChartQuery,
} from "@/services/dashboard-koperasi.service";

// Chart.js + types
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

// ===== Utils =====
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

export default function DashboardPage() {
  // Get current year for API call
  const currentYear = new Date().getFullYear();

  // API calls
  const { data: dashboardHead, isLoading: isLoadingHead } = useGetDashboardKoperasiHeadQuery();
  const { data: simpananChart, isLoading: isLoadingSimpanan } = useGetSimpananChartQuery({ year: currentYear });
  const { data: pinjamanChart, isLoading: isLoadingPinjaman } = useGetPinjamanChartQuery({ year: currentYear });

  // Labels 12 bulan
  const labels = useMemo(last12MonthLabels, []);

  // Process simpanan chart data
  const monthlySimpanan = useMemo(() => {
    if (!simpananChart) return Array(12).fill(0);
    return simpananChart.map(item => Number(item.total));
  }, [simpananChart]);

  // Process pinjaman chart data
  const monthlyPinjaman = useMemo(() => {
    if (!pinjamanChart) return Array(12).fill(0);
    return pinjamanChart.map(item => Number(item.total));
  }, [pinjamanChart]);

  // Ringkasan from API
  const totalAnggota = dashboardHead?.total_anggota || 0;
  const totalSimpanan = Number(dashboardHead?.total_simpanan || 0);
  const totalPinjaman = Number(dashboardHead?.total_pinjaman || 0);
  const totalTagihanBulanIni = dashboardHead?.total_tagihan_pinjaman_this_month || 0;

  const cards = [
    {
      title: "Total Anggota",
      value: formatNumber(totalAnggota),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Simpanan",
      value: formatRupiah(totalSimpanan),
      icon: Banknote,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Total Pinjaman",
      value: formatRupiah(totalPinjaman),
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Tagihan Bulan Ini",
      value: formatRupiah(totalTagihanBulanIni),
      icon: CalendarDays,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ] as const;

  // ===== Chart types (NO any) =====
  const commonOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"line">): string => {
            const v = ctx.parsed.y ?? 0;
            return `${ctx.dataset.label ?? "Data"}: Rp ${formatNumber(v)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // ✅ parameter harus string | number
          callback: (tickValue: string | number) =>
            `Rp ${formatNumber(Number(tickValue))}`,
        },
      },
    },
  };

  const simpananData: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "Simpanan per Bulan",
        data: monthlySimpanan,
        borderColor: "rgba(16,185,129,1)", // emerald-500
        backgroundColor: "rgba(16,185,129,0.2)",
        fill: true,
        tension: 0.35,
        pointRadius: 2,
      },
    ],
  };

  const pinjamanData: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "Pinjaman per Bulan",
        data: monthlyPinjaman,
        borderColor: "rgba(59,130,246,1)", // blue-500
        backgroundColor: "rgba(59,130,246,0.2)",
        fill: true,
        tension: 0.35,
        pointRadius: 2,
      },
    ],
  };

  // Loading state
  const isLoading = isLoadingHead || isLoadingSimpanan || isLoadingPinjaman;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Koperasi</h1>
          <p className="text-sm text-gray-500">
            Ringkasan anggota, simpanan, pinjaman, & tagihan
          </p>
        </div>
        
        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-gray-200">
                    <div className="h-4 w-4 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-6 w-16 bg-gray-200 rounded mx-auto"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-80">
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent className="h-[260px]">
              <div className="h-full bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>

          <Card className="h-80">
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent className="h-[260px]">
              <div className="h-full bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Koperasi</h1>
        <p className="text-sm text-gray-500">
          Ringkasan anggota, simpanan, pinjaman, & tagihan
        </p>
      </div>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card
              key={i}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full ${c.bgColor}`}>
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

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Grafik Simpanan Per Bulan (1 tahun berjalan)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            {simpananChart && simpananChart.length > 0 ? (
              <Line data={simpananData} options={commonOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Tidak ada data simpanan</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Grafik Pinjaman Per Bulan (1 tahun berjalan)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            {pinjamanChart && pinjamanChart.length > 0 ? (
              <Line data={pinjamanData} options={commonOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Tidak ada data pinjaman</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
