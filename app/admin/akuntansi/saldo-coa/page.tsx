"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  FileText,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Layout,
  Table,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Banknote,
  Calculator,
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

// Mock data untuk template table
const mockSaldoCOAData = [
  {
    id: 1,
    kode_akun: "1101",
    nama_akun: "Kas",
    saldo_debit: 50000000,
    saldo_kredit: 0,
    saldo_net: 50000000,
    tipe_saldo: "Debit",
    tipe_akun: "Aktiva",
    status: "Aktif",
    created_at: "2024-01-01",
  },
  {
    id: 2,
    kode_akun: "1102",
    nama_akun: "Bank BCA",
    saldo_debit: 100000000,
    saldo_kredit: 0,
    saldo_net: 100000000,
    tipe_saldo: "Debit",
    tipe_akun: "Aktiva",
    status: "Aktif",
    created_at: "2024-01-01",
  },
  {
    id: 3,
    kode_akun: "1201",
    nama_akun: "Piutang Usaha",
    saldo_debit: 75000000,
    saldo_kredit: 0,
    saldo_net: 75000000,
    tipe_saldo: "Debit",
    tipe_akun: "Aktiva",
    status: "Aktif",
    created_at: "2024-01-01",
  },
  {
    id: 4,
    kode_akun: "1301",
    nama_akun: "Persediaan Barang",
    saldo_debit: 200000000,
    saldo_kredit: 0,
    saldo_net: 200000000,
    tipe_saldo: "Debit",
    tipe_akun: "Aktiva",
    status: "Aktif",
    created_at: "2024-01-01",
  },
  {
    id: 5,
    kode_akun: "1401",
    nama_akun: "Peralatan Kantor",
    saldo_debit: 50000000,
    saldo_kredit: 0,
    saldo_net: 50000000,
    tipe_saldo: "Debit",
    tipe_akun: "Aktiva",
    status: "Aktif",
    created_at: "2024-01-01",
  },
  {
    id: 6,
    kode_akun: "2101",
    nama_akun: "Hutang Usaha",
    saldo_debit: 0,
    saldo_kredit: 80000000,
    saldo_net: 80000000,
    tipe_saldo: "Kredit",
    tipe_akun: "Kewajiban",
    status: "Aktif",
    created_at: "2024-01-01",
  },
  {
    id: 7,
    kode_akun: "2102",
    nama_akun: "Hutang Bank",
    saldo_debit: 0,
    saldo_kredit: 150000000,
    saldo_net: 150000000,
    tipe_saldo: "Kredit",
    tipe_akun: "Kewajiban",
    status: "Aktif",
    created_at: "2024-01-01",
  },
  {
    id: 8,
    kode_akun: "3101",
    nama_akun: "Modal",
    saldo_debit: 0,
    saldo_kredit: 500000000,
    saldo_net: 500000000,
    tipe_saldo: "Kredit",
    tipe_akun: "Ekuitas",
    status: "Aktif",
    created_at: "2024-01-01",
  },
  {
    id: 9,
    kode_akun: "4101",
    nama_akun: "Pendapatan Usaha",
    saldo_debit: 0,
    saldo_kredit: 250000000,
    saldo_net: 250000000,
    tipe_saldo: "Kredit",
    tipe_akun: "Pendapatan",
    status: "Aktif",
    created_at: "2024-01-01",
  },
  {
    id: 10,
    kode_akun: "5101",
    nama_akun: "Beban Operasional",
    saldo_debit: 150000000,
    saldo_kredit: 0,
    saldo_net: 150000000,
    tipe_saldo: "Debit",
    tipe_akun: "Beban",
    status: "Aktif",
    created_at: "2024-01-01",
  },
  {
    id: 11,
    kode_akun: "5102",
    nama_akun: "Beban Administrasi",
    saldo_debit: 50000000,
    saldo_kredit: 0,
    saldo_net: 50000000,
    tipe_saldo: "Debit",
    tipe_akun: "Beban",
    status: "Aktif",
    created_at: "2024-01-01",
  },
  {
    id: 12,
    kode_akun: "6101",
    nama_akun: "Beban Lain-lain",
    saldo_debit: 25000000,
    saldo_kredit: 0,
    saldo_net: 25000000,
    tipe_saldo: "Debit",
    tipe_akun: "Beban",
    status: "Aktif",
    created_at: "2024-01-01",
  },
];

// Mock data untuk template visual
const mockVisualData = {
  totalAktiva: 475000000,
  totalKewajiban: 230000000,
  totalEkuitas: 500000000,
  totalPendapatan: 250000000,
  totalBeban: 225000000,
  labaBersih: 25000000,
  periode: "2024",
  detailAktiva: [
    { kategori: "Kas & Bank", jumlah: 150000000, persentase: 31.6 },
    { kategori: "Piutang", jumlah: 75000000, persentase: 15.8 },
    { kategori: "Persediaan", jumlah: 200000000, persentase: 42.1 },
    { kategori: "Aktiva Tetap", jumlah: 50000000, persentase: 10.5 },
  ],
  detailKewajiban: [
    { kategori: "Hutang Usaha", jumlah: 80000000, persentase: 34.8 },
    { kategori: "Hutang Bank", jumlah: 150000000, persentase: 65.2 },
  ],
  detailEkuitas: [
    { kategori: "Modal", jumlah: 500000000, persentase: 100.0 },
  ],
  detailPendapatan: [
    { kategori: "Pendapatan Usaha", jumlah: 250000000, persentase: 100.0 },
  ],
  detailBeban: [
    { kategori: "Beban Operasional", jumlah: 150000000, persentase: 66.7 },
    { kategori: "Beban Administrasi", jumlah: 50000000, persentase: 22.2 },
    { kategori: "Beban Lain-lain", jumlah: 25000000, persentase: 11.1 },
  ],
  trendData: [
    { bulan: "Jan", aktiva: 450000000, kewajiban: 200000000, ekuitas: 250000000 },
    { bulan: "Feb", aktiva: 460000000, kewajiban: 205000000, ekuitas: 255000000 },
    { bulan: "Mar", aktiva: 470000000, kewajiban: 210000000, ekuitas: 260000000 },
    { bulan: "Apr", aktiva: 475000000, kewajiban: 215000000, ekuitas: 260000000 },
    { bulan: "Mei", aktiva: 480000000, kewajiban: 220000000, ekuitas: 260000000 },
    { bulan: "Jun", aktiva: 485000000, kewajiban: 225000000, ekuitas: 260000000 },
    { bulan: "Jul", aktiva: 490000000, kewajiban: 230000000, ekuitas: 260000000 },
    { bulan: "Agu", aktiva: 495000000, kewajiban: 235000000, ekuitas: 260000000 },
    { bulan: "Sep", aktiva: 500000000, kewajiban: 240000000, ekuitas: 260000000 },
    { bulan: "Okt", aktiva: 505000000, kewajiban: 245000000, ekuitas: 260000000 },
    { bulan: "Nov", aktiva: 510000000, kewajiban: 250000000, ekuitas: 260000000 },
    { bulan: "Des", aktiva: 515000000, kewajiban: 255000000, ekuitas: 260000000 },
  ],
};

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

export default function SaldoCOAPage() {
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
    console.log("Exporting Saldo COA Report...");
  };

  // Filter data berdasarkan search term
  const filteredTableData = mockSaldoCOAData.filter((item) =>
    item.nama_akun.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kode_akun.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tipe_akun.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chart data untuk trend
  const trendChartData: ChartData<"bar"> = {
    labels: mockVisualData.trendData.map((item) => item.bulan),
    datasets: [
      {
        label: "Aktiva",
        data: mockVisualData.trendData.map((item) => item.aktiva),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
      {
        label: "Kewajiban",
        data: mockVisualData.trendData.map((item) => item.kewajiban),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
      {
        label: "Ekuitas",
        data: mockVisualData.trendData.map((item) => item.ekuitas),
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
        text: "Trend Saldo COA Per Bulan",
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

  // Chart data untuk komposisi aktiva
  const aktivaChartData: ChartData<"pie"> = {
    labels: mockVisualData.detailAktiva.map((item) => item.kategori),
    datasets: [
      {
        data: mockVisualData.detailAktiva.map((item) => item.jumlah),
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const aktivaChartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "Komposisi Aktiva",
      },
    },
  };


  const summaryCards = [
    {
      title: "Total Aktiva",
      value: formatRupiah(mockVisualData.totalAktiva),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8.5%",
      changeType: "positive",
    },
    {
      title: "Total Kewajiban",
      value: formatRupiah(mockVisualData.totalKewajiban),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
      change: "+5.2%",
      changeType: "negative",
    },
    {
      title: "Total Ekuitas",
      value: formatRupiah(mockVisualData.totalEkuitas),
      icon: Banknote,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12.3%",
      changeType: "positive",
    },
    {
      title: "Laba Bersih",
      value: formatRupiah(mockVisualData.labaBersih),
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+15.7%",
      changeType: "positive",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Saldo COA
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Laporan saldo Chart of Accounts dan analisis keuangan
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
                placeholder={templateView === "dashboard" ? "Cari akun..." : "Cari kode atau nama akun..."}
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
                Tambah Akun
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
              variant={activeTab === "neraca" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("neraca")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Neraca
            </Button>
            <Button
              variant={activeTab === "laba" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("laba")}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Laba Rugi
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
                  <CardTitle>Trend Saldo COA Per Bulan</CardTitle>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <Bar data={trendChartData} options={trendChartOptions} />
                </CardContent>
              </Card>

              {/* Komposisi Aktiva */}
              <Card className="h-96">
                <CardHeader>
                  <CardTitle>Komposisi Aktiva</CardTitle>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <Pie data={aktivaChartData} options={aktivaChartOptions} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "neraca" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Aktiva */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">AKTIVA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockVisualData.detailAktiva.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"][index],
                            }}
                          />
                          <span className="text-sm font-medium">{item.kategori}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600">
                            {formatRupiah(item.jumlah)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.persentase}%
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between font-bold">
                        <span>Total Aktiva</span>
                        <span className="text-green-600">
                          {formatRupiah(mockVisualData.totalAktiva)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Kewajiban */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">KEWAJIBAN</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockVisualData.detailKewajiban.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: ["#EF4444", "#F59E0B"][index],
                            }}
                          />
                          <span className="text-sm font-medium">{item.kategori}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-red-600">
                            {formatRupiah(item.jumlah)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.persentase}%
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between font-bold">
                        <span>Total Kewajiban</span>
                        <span className="text-red-600">
                          {formatRupiah(mockVisualData.totalKewajiban)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ekuitas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">EKUITAS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockVisualData.detailEkuitas.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: "#3B82F6",
                            }}
                          />
                          <span className="text-sm font-medium">{item.kategori}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-blue-600">
                            {formatRupiah(item.jumlah)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.persentase}%
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between font-bold">
                        <span>Total Ekuitas</span>
                        <span className="text-blue-600">
                          {formatRupiah(mockVisualData.totalEkuitas)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "laba" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pendapatan */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">PENDAPATAN</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockVisualData.detailPendapatan.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full bg-green-500"
                          />
                          <span className="text-sm font-medium">{item.kategori}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600">
                            {formatRupiah(item.jumlah)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.persentase}%
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between font-bold">
                        <span>Total Pendapatan</span>
                        <span className="text-green-600">
                          {formatRupiah(mockVisualData.totalPendapatan)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Beban */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">BEBAN</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockVisualData.detailBeban.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: ["#EF4444", "#F59E0B", "#8B5CF6"][index],
                            }}
                          />
                          <span className="text-sm font-medium">{item.kategori}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-red-600">
                            {formatRupiah(item.jumlah)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.persentase}%
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between font-bold">
                        <span>Total Beban</span>
                        <span className="text-red-600">
                          {formatRupiah(mockVisualData.totalBeban)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "detail" && (
            <div className="space-y-6">
              {/* Detail Aktiva */}
              <Card>
                <CardHeader>
                  <CardTitle>Detail Saldo COA - Aktiva</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Kode Akun
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Nama Akun
                          </th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">
                            Saldo Debit
                          </th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">
                            Saldo Kredit
                          </th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">
                            Saldo Net
                          </th>
                          <th className="text-center py-3 px-4 font-medium text-gray-600">
                            Tipe Saldo
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockSaldoCOAData.filter(item => item.tipe_akun === "Aktiva").map((item) => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono text-sm">{item.kode_akun}</td>
                            <td className="py-3 px-4">{item.nama_akun}</td>
                            <td className="py-3 px-4 text-right font-semibold text-green-600">
                              {formatRupiah(item.saldo_debit)}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-red-600">
                              {formatRupiah(item.saldo_kredit)}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-green-600">
                              {formatRupiah(item.saldo_net)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {item.tipe_saldo}
                              </span>
                            </td>
                          </tr>
                        ))}
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
                    placeholder="Cari kode atau nama akun..."
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
                  Tambah Akun
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
                    <th className="px-4 py-2 whitespace-nowrap">Kode Akun</th>
                    <th className="px-4 py-2 whitespace-nowrap">Nama Akun</th>
                    <th className="px-4 py-2 whitespace-nowrap">Tipe Akun</th>
                    <th className="px-4 py-2 whitespace-nowrap">Saldo Debit</th>
                    <th className="px-4 py-2 whitespace-nowrap">Saldo Kredit</th>
                    <th className="px-4 py-2 whitespace-nowrap">Saldo Net</th>
                    <th className="px-4 py-2 whitespace-nowrap">Tipe Saldo</th>
                    <th className="px-4 py-2 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="text-center p-4">
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredTableData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-4">
                        Tidak ada data akun
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
                        <td className="px-4 py-2 whitespace-nowrap font-mono text-sm">
                          {item.kode_akun}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {item.nama_akun}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.tipe_akun === "Aktiva"
                                ? "bg-green-100 text-green-800"
                                : item.tipe_akun === "Kewajiban"
                                ? "bg-red-100 text-red-800"
                                : item.tipe_akun === "Ekuitas"
                                ? "bg-blue-100 text-blue-800"
                                : item.tipe_akun === "Pendapatan"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.tipe_akun}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-green-600 font-semibold">
                          {formatRupiah(item.saldo_debit)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-red-600 font-semibold">
                          {formatRupiah(item.saldo_kredit)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap font-bold">
                          {formatRupiah(item.saldo_net)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.tipe_saldo === "Debit"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.tipe_saldo}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === "Aktif"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
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
