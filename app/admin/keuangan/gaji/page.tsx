"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Download, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useGetFinancialBillListQuery, type FinancialBill } from "@/services/admin/financial-bill.service";

export default function GajiPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    date: new Date().toISOString().slice(0, 7), // Default to current year-month (YYYY-MM)
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FinancialBill | null>(null);

  const { data: financialBillData, isLoading } = useGetFinancialBillListQuery({
    page: currentPage,
    paginate: 10,
    date: filters.date,
  });

  const filteredData = useMemo(() => {
    if (!financialBillData?.data) return [];
    
    return financialBillData.data.filter((item) => {
      const matchesSearch = 
        item.anggota_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.anggota_reference.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.pinjaman_reference.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = 
        filters.status === "all" || 
        String(item.status) === filters.status;
      
      return matchesSearch && matchesStatus;
    });
  }, [financialBillData?.data, filters]);

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800">Lunas</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Belum Lunas</Badge>
    );
  };

  const handleDetail = (item: FinancialBill) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    if (format === 'excel') {
      exportToExcel();
    } else if (format === 'pdf') {
      exportToPDF();
    }
  };

  const exportToExcel = () => {
    const data = filteredData.map(item => ({
      'Nama Anggota': item.anggota_name,
      'Referensi Anggota': item.anggota_reference,
      'NIK': item.anggota_nik,
      'Referensi Pinjaman': item.pinjaman_reference,
      'Nominal Pinjaman': item.pinjaman_nominal,
      'Bulan ke-': item.month,
      'Jatuh Tempo': formatDate(item.due_date),
      'Pokok Bulanan': item.pinjaman_monthly_principal,
      'Bunga Bulanan': item.pinjaman_monthly_interest,
      'Total Cicilan': item.pinjaman_monthly_installment,
      'Sudah Dibayar': item.paid,
      'Sisa Tagihan': item.remaining,
      'Status': item.status ? 'Lunas' : 'Belum Lunas',
      'Tanggal Bayar': item.paid_at ? formatDate(item.paid_at) : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Tagihan');
    
    const fileName = `data-tagihan-${filters.date}-${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Data Tagihan Keuangan', 14, 22);
    
    // Add date filter info
    doc.setFontSize(10);
    doc.text(`Periode: ${filters.date}`, 14, 30);
    doc.text(`Total Data: ${filteredData.length}`, 14, 35);
    
    // Prepare table data
    const tableData = filteredData.map(item => [
      item.anggota_name,
      item.anggota_reference,
      `Bulan ke-${item.month}`,
      formatDate(item.due_date),
      formatCurrency(item.remaining),
      item.status ? 'Lunas' : 'Belum Lunas'
    ]);

    // Add table
    autoTable(doc, {
      head: [['Nama Anggota', 'Referensi', 'Bulan', 'Jatuh Tempo', 'Sisa Tagihan', 'Status']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    const fileName = `data-tagihan-${filters.date}-${new Date().getTime()}.pdf`;
    doc.save(fileName);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Keuangan - Gaji</h1>
        <p className="text-sm text-gray-500">
          Kelola data tagihan keuangan
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Cari</Label>
              <Input
                id="search"
                placeholder="Cari nama, referensi..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="date">Bulan/Tahun</Label>
              <Input
                id="date"
                type="month"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="true">Lunas</SelectItem>
                  <SelectItem value="false">Belum Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={() => handleExport('excel')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anggota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pinjaman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bulan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jatuh Tempo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sisa Tagihan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="animate-pulse">Loading...</div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDetail(item)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Detail</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.anggota_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.anggota_reference}
                          </div>
                          <div className="text-sm text-gray-500">
                            NIK: {item.anggota_nik}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.pinjaman_reference}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(item.pinjaman_nominal)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Bulan ke-{item.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.remaining)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {financialBillData && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan {financialBillData.from} sampai {financialBillData.to} dari {financialBillData.data.length} data
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!financialBillData.prev_page_url}
            >
              Sebelumnya
            </Button>
            <span className="text-sm text-gray-700">
              Halaman {financialBillData.current_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!financialBillData.next_page_url}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail Tagihan</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              {/* Anggota Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Informasi Anggota</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="font-medium">Nama</Label>
                      <p className="text-sm text-gray-600">{selectedItem.anggota_name}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Referensi Anggota</Label>
                      <p className="text-sm text-gray-600">{selectedItem.anggota_reference}</p>
                    </div>
                    <div>
                      <Label className="font-medium">NIK</Label>
                      <p className="text-sm text-gray-600">{selectedItem.anggota_nik}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Informasi Pinjaman</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="font-medium">Referensi Pinjaman</Label>
                      <p className="text-sm text-gray-600">{selectedItem.pinjaman_reference}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Nominal Pinjaman</Label>
                      <p className="text-sm text-gray-600">{formatCurrency(selectedItem.pinjaman_nominal)}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Bunga (%)</Label>
                      <p className="text-sm text-gray-600">{selectedItem.pinjaman_interest_rate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Detail Cicilan</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="font-medium">Bulan ke-</Label>
                      <p className="text-sm text-gray-600">{selectedItem.month}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Deskripsi</Label>
                      <p className="text-sm text-gray-600">{selectedItem.description}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Jatuh Tempo</Label>
                      <p className="text-sm text-gray-600">{formatDate(selectedItem.due_date)}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Rincian Pembayaran</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="font-medium">Pokok Bulanan</Label>
                      <p className="text-sm text-gray-600">{formatCurrency(selectedItem.pinjaman_monthly_principal)}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Bunga Bulanan</Label>
                      <p className="text-sm text-gray-600">{formatCurrency(selectedItem.pinjaman_monthly_interest)}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Total Cicilan</Label>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedItem.pinjaman_monthly_installment)}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Sudah Dibayar</Label>
                      <p className="text-sm text-gray-600">{formatCurrency(selectedItem.paid)}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Sisa Tagihan</Label>
                      <p className="text-sm font-medium text-red-600">{formatCurrency(selectedItem.remaining)}</p>
                    </div>
                    {selectedItem.paid_at && (
                      <div>
                        <Label className="font-medium">Tanggal Bayar</Label>
                        <p className="text-sm text-gray-600">{formatDate(selectedItem.paid_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
