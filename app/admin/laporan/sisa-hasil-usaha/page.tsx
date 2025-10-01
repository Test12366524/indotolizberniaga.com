"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  PieChart,
  DollarSign,
  Calculator,
  Layout,
  Table,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Mock data untuk demo
const mockSHUData = {
  totalPendapatan: 125000000,
  totalBiaya: 85000000,
  sisaHasilUsaha: 40000000,
  periode: "2024",
  detailPendapatan: [
    { kategori: "Bunga Pinjaman", jumlah: 75000000, persentase: 60 },
    { kategori: "Jasa Simpanan", jumlah: 25000000, persentase: 20 },
    { kategori: "Pendapatan Lainnya", jumlah: 25000000, persentase: 20 },
  ],
  detailBiaya: [
    { kategori: "Biaya Operasional", jumlah: 45000000, persentase: 52.9 },
    { kategori: "Biaya Administrasi", jumlah: 20000000, persentase: 23.5 },
    { kategori: "Biaya Lainnya", jumlah: 20000000, persentase: 23.5 },
  ],
  distribusiSHU: [
    { kategori: "Cadangan Koperasi", jumlah: 12000000, persentase: 30 },
    { kategori: "Dana Pengurus", jumlah: 8000000, persentase: 20 },
    { kategori: "Dana Pengawas", jumlah: 4000000, persentase: 10 },
    { kategori: "Dana Karyawan", jumlah: 4000000, persentase: 10 },
    { kategori: "Dana Pendidikan", jumlah: 4000000, persentase: 10 },
    { kategori: "Dana Sosial", jumlah: 4000000, persentase: 10 },
    { kategori: "Dana Anggota", jumlah: 4000000, persentase: 10 },
  ],
  trendData: [
    { bulan: "Jan", pendapatan: 9500000, biaya: 6500000, shu: 3000000 },
    { bulan: "Feb", pendapatan: 10200000, biaya: 6800000, shu: 3400000 },
    { bulan: "Mar", pendapatan: 10800000, biaya: 7200000, shu: 3600000 },
    { bulan: "Apr", pendapatan: 11500000, biaya: 7500000, shu: 4000000 },
    { bulan: "Mei", pendapatan: 12000000, biaya: 7800000, shu: 4200000 },
    { bulan: "Jun", pendapatan: 12500000, biaya: 8000000, shu: 4500000 },
    { bulan: "Jul", pendapatan: 13000000, biaya: 8200000, shu: 4800000 },
    { bulan: "Agu", pendapatan: 13500000, biaya: 8500000, shu: 5000000 },
    { bulan: "Sep", pendapatan: 14000000, biaya: 8800000, shu: 5200000 },
    { bulan: "Okt", pendapatan: 14500000, biaya: 9000000, shu: 5500000 },
    { bulan: "Nov", pendapatan: 15000000, biaya: 9200000, shu: 5800000 },
    { bulan: "Des", pendapatan: 15500000, biaya: 9500000, shu: 6000000 },
  ],
};

// Mock data untuk template table
const mockTableData = [
  {
    id: 1,
    periode: "Januari 2024",
    pendapatan: 9500000,
    biaya: 6500000,
    shu: 3000000,
    margin: "31.6%",
    status: "Selesai",
    created_at: "2024-01-31",
  },
  {
    id: 2,
    periode: "Februari 2024",
    pendapatan: 10200000,
    biaya: 6800000,
    shu: 3400000,
    margin: "33.3%",
    status: "Selesai",
    created_at: "2024-02-29",
  },
  {
    id: 3,
    periode: "Maret 2024",
    pendapatan: 10800000,
    biaya: 7200000,
    shu: 3600000,
    margin: "33.3%",
    status: "Selesai",
    created_at: "2024-03-31",
  },
  {
    id: 4,
    periode: "April 2024",
    pendapatan: 11500000,
    biaya: 7500000,
    shu: 4000000,
    margin: "34.8%",
    status: "Selesai",
    created_at: "2024-04-30",
  },
  {
    id: 5,
    periode: "Mei 2024",
    pendapatan: 12000000,
    biaya: 7800000,
    shu: 4200000,
    margin: "35.0%",
    status: "Selesai",
    created_at: "2024-05-31",
  },
  {
    id: 6,
    periode: "Juni 2024",
    pendapatan: 12500000,
    biaya: 8000000,
    shu: 4500000,
    margin: "36.0%",
    status: "Selesai",
    created_at: "2024-06-30",
  },
  {
    id: 7,
    periode: "Juli 2024",
    pendapatan: 13000000,
    biaya: 8200000,
    shu: 4800000,
    margin: "36.9%",
    status: "Selesai",
    created_at: "2024-07-31",
  },
  {
    id: 8,
    periode: "Agustus 2024",
    pendapatan: 13500000,
    biaya: 8500000,
    shu: 5000000,
    margin: "37.0%",
    status: "Selesai",
    created_at: "2024-08-31",
  },
  {
    id: 9,
    periode: "September 2024",
    pendapatan: 14000000,
    biaya: 8800000,
    shu: 5200000,
    margin: "37.1%",
    status: "Selesai",
    created_at: "2024-09-30",
  },
  {
    id: 10,
    periode: "Oktober 2024",
    pendapatan: 14500000,
    biaya: 9000000,
    shu: 5500000,
    margin: "37.9%",
    status: "Selesai",
    created_at: "2024-10-31",
  },
  {
    id: 11,
    periode: "November 2024",
    pendapatan: 15000000,
    biaya: 9200000,
    shu: 5800000,
    margin: "38.7%",
    status: "Selesai",
    created_at: "2024-11-30",
  },
  {
    id: 12,
    periode: "Desember 2024",
    pendapatan: 15500000,
    biaya: 9500000,
    shu: 6000000,
    margin: "38.7%",
    status: "Proses",
    created_at: "2024-12-31",
  },
];

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

export default function SisaHasilUsahaPage() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [templateView, setTemplateView] = useState<"dashboard" | "table">("dashboard");

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExport = () => {
    // Simulasi export
    console.log("Exporting SHU Report...");
  };

  // Filter data berdasarkan search term
  const filteredTableData = mockTableData.filter((item) =>
    item.periode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chart data untuk trend SHU
  const trendChartData: ChartData<"bar"> = {
    labels: mockSHUData.trendData.map((item) => item.bulan),
    datasets: [
      {
        label: "Pendapatan",
        data: mockSHUData.trendData.map((item) => item.pendapatan),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
      {
        label: "Biaya",
        data: mockSHUData.trendData.map((item) => item.biaya),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
      {
        label: "SHU",
        data: mockSHUData.trendData.map((item) => item.shu),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const trendChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Trend Sisa Hasil Usaha Per Bulan",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "Rp " + formatNumber(Number(value));
          },
        },
      },
    },
  };

  // Chart data untuk distribusi SHU
  const distributionChartData: ChartData<"pie"> = {
    labels: mockSHUData.distribusiSHU.map((item) => item.kategori),
    datasets: [
      {
        data: mockSHUData.distribusiSHU.map((item) => item.jumlah),
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#F97316",
          "#06B6D4",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const distributionChartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "Distribusi Sisa Hasil Usaha",
      },
    },
  };

  const summaryCards = [
    {
      title: "Total Pendapatan",
      value: formatRupiah(mockSHUData.totalPendapatan),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+12.5%",
      changeType: "positive",
    },
    {
      title: "Total Biaya",
      value: formatRupiah(mockSHUData.totalBiaya),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
      change: "+8.2%",
      changeType: "negative",
    },
    {
      title: "Sisa Hasil Usaha",
      value: formatRupiah(mockSHUData.sisaHasilUsaha),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+15.3%",
      changeType: "positive",
    },
    {
      title: "Margin SHU",
      value: `${((mockSHUData.sisaHasilUsaha / mockSHUData.totalPendapatan) * 100).toFixed(1)}%`,
      icon: Calculator,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+2.1%",
      changeType: "positive",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Laporan Sisa Hasil Usaha
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Analisis pendapatan, biaya, dan distribusi SHU koperasi
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Template Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={templateView === "dashboard" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTemplateView("dashboard")}
            >
              <Layout className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={templateView === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTemplateView("table")}
            >
              <Table className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className={`${templateView === "table" ? "hidden" : ""}`}>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder={templateView === "dashboard" ? "Cari kategori..." : "Cari periode atau status..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            {templateView === "table" && (
              <Button size="sm" className="ml-auto">
                <FileText className="h-4 w-4 mr-2" />
                Tambah Laporan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conditional Content Based on Template */}
      {templateView === "dashboard" ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-full ${card.bgColor}`}>
                          <Icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                        <CardTitle className="text-sm font-medium text-gray-600">
                          {card.title}
                        </CardTitle>
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          card.changeType === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {card.change}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {card.value}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "overview" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("overview")}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={activeTab === "distribution" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("distribution")}
        >
          <PieChart className="h-4 w-4 mr-2" />
          Distribusi
        </Button>
        <Button
          variant={activeTab === "detail" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("detail")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Detail
        </Button>
      </div>

      {/* Content berdasarkan tab aktif */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <Card className="h-96">
            <CardHeader>
              <CardTitle>Trend SHU Per Bulan</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <Bar data={trendChartData} options={trendChartOptions} />
            </CardContent>
          </Card>

          {/* Pendapatan vs Biaya */}
          <Card className="h-96">
            <CardHeader>
              <CardTitle>Komposisi Pendapatan</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <div className="space-y-4">
                {mockSHUData.detailPendapatan.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: [
                            "#3B82F6",
                            "#10B981",
                            "#8B5CF6",
                          ][index],
                        }}
                      />
                      <span className="text-sm font-medium">{item.kategori}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {formatRupiah(item.jumlah)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.persentase}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "distribution" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution Chart */}
          <Card className="h-96">
            <CardHeader>
              <CardTitle>Distribusi SHU</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <Pie data={distributionChartData} options={distributionChartOptions} />
            </CardContent>
          </Card>

          {/* Distribution List */}
          <Card className="h-96">
            <CardHeader>
              <CardTitle>Detail Distribusi</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px] overflow-y-auto">
              <div className="space-y-3">
                {mockSHUData.distribusiSHU.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: [
                            "#3B82F6",
                            "#10B981",
                            "#F59E0B",
                            "#EF4444",
                            "#8B5CF6",
                            "#F97316",
                            "#06B6D4",
                          ][index],
                        }}
                      />
                      <span className="text-sm font-medium">{item.kategori}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {formatRupiah(item.jumlah)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.persentase}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "detail" && (
        <div className="space-y-6">
          {/* Detail Pendapatan */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Pendapatan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Kategori
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        Jumlah
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        Persentase
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSHUData.detailPendapatan.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{item.kategori}</td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {formatRupiah(item.jumlah)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {item.persentase}%
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 font-bold">
                      <td className="py-3 px-4">Total Pendapatan</td>
                      <td className="py-3 px-4 text-right">
                        {formatRupiah(mockSHUData.totalPendapatan)}
                      </td>
                      <td className="py-3 px-4 text-right">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Detail Biaya */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Biaya</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Kategori
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        Jumlah
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        Persentase
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSHUData.detailBiaya.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{item.kategori}</td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {formatRupiah(item.jumlah)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {item.persentase}%
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 font-bold">
                      <td className="py-3 px-4">Total Biaya</td>
                      <td className="py-3 px-4 text-right">
                        {formatRupiah(mockSHUData.totalBiaya)}
                      </td>
                      <td className="py-3 px-4 text-right">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
        </>
      ) : (
        /* Template Table */
        <>
          {/* Toolbar untuk Template Table */}
          <div className="rounded-md bg-white p-4 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Kiri: search & filter */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Cari periode atau status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              {/* Kanan: aksi */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Tambah Laporan
                </Button>
              </div>
            </div>
          </div>

          <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-4 py-2 whitespace-nowrap">Aksi</th>
                  <th className="px-4 py-2 whitespace-nowrap">Periode</th>
                  <th className="px-4 py-2 whitespace-nowrap">Pendapatan</th>
                  <th className="px-4 py-2 whitespace-nowrap">Biaya</th>
                  <th className="px-4 py-2 whitespace-nowrap">SHU</th>
                  <th className="px-4 py-2 whitespace-nowrap">Margin</th>
                  <th className="px-4 py-2 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-4">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredTableData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-4">
                      Tidak ada data laporan
                    </td>
                  </tr>
                ) : (
                  filteredTableData.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-400 border-blue-400 hover:text-blue-400 hover:bg-blue-50"
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-yellow-400 border-yellow-400 hover:text-yellow-400 hover:bg-yellow-50"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="font-medium">{item.periode}</div>
                        <div className="text-xs text-gray-500">{item.created_at}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-green-600 font-semibold">
                        {formatRupiah(item.pendapatan)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-red-600 font-semibold">
                        {formatRupiah(item.biaya)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-blue-600 font-semibold">
                        {formatRupiah(item.shu)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.margin}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === "Selesai"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}
