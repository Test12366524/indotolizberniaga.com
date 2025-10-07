"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  ShoppingCart,
  Users,
  Package,
  Tag,
  BookDashed,
  Landmark,
  FileText,
  LineChart,
  ClipboardList,
  Settings,
  UserCheck,
  GalleryVertical,
  Newspaper,
  BookUser,
  CreditCard,
  Building,
  Webhook,
  FileStack,
  Smartphone,
  SmartphoneNfc,
} from "lucide-react";
import Header from "@/components/admin-components/header";
import Sidebar from "@/components/admin-components/sidebar";
import { AdminLayoutProps, MenuItem } from "@/types";
import { FaMoneyBillWave, FaCoins } from "react-icons/fa";
import { useSession } from "next-auth/react";
import type { User } from "@/types/user";

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user as User | undefined;

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let menuItems: MenuItem[] = [];

  // Menu items untuk superadmin (semua menu)
  const superadminMenuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <BookDashed className="h-5 w-5" />,
      href: "/admin/dashboard",
    },
    {
      id: "anggota",
      label: "Anggota",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/anggota",
    },
    {
      id: "simpanan",
      label: "Simpanan",
      icon: <FaCoins className="h-5 w-5" />,
      href: "#",
      children: [
        {
          id: "simpanan/simpanan-anggota",
          label: "Simpanan Anggota",
          href: "/admin/simpanan/simpanan-anggota",
        },
        {
          id: "simpanan/kategori",
          label: "Kategori Simpanan",
          href: "/admin/simpanan/kategori",
        },
        {
          id: "penarikan-simpanan",
          label: "Penarikan Simpanan",
          href: "/admin/penarikan-simpanan",
        },
      ],
    },
    {
      id: "pinjaman",
      label: "Pinjaman",
      icon: <FaMoneyBillWave className="h-5 w-5" />,
      href: "#",
      children: [
        {
          id: "pinjaman/pinjaman-anggota",
          label: "Pinjaman Anggota",
          href: "/admin/pinjaman/pinjaman-anggota",
        },
        {
          id: "pinjaman/kategori",
          label: "Kategori Pinjaman",
          href: "/admin/pinjaman/pinjaman-kategori",
        },
      ],
    },
    {
      id: "data-keuangan",
      label: "Data Keuangan",
      icon: <Landmark className="h-5 w-5" />,
      href: "#",
      children: [
        {
          id: "data-keuangan/pemotongan-gaji",
          label: "Data Pemotongan Gaji",
          href: "/admin/keuangan/gaji",
        },
        {
          id: "data-keuangan/angsuran-pinjaman",
          label: "Update Angsuran Pinjaman",
          href: "/admin/keuangan/angsuran-pinjaman",
        },
      ],
    },
    {
      id: "anggota-meninggal",
      label: "Anggota Meninggal",
      icon: <ClipboardList className="h-5 w-5" />,
      href: "/admin/anggota-meninggal",
      // children: [
      //   {
      //     id: "anggota-meninggal/main",
      //     label: "Data Anggota Meninggal",
      //     href: "/admin/anggota-meninggal",
      //   },
      //   // {
      //   //   id: "anggota-meninggal/status-anggota",
      //   //   label: "Status Anggota",
      //   //   href: "/admin/anggota-meninggal/status-anggota",
      //   // },
      //   // {
      //   //   id: "anggota-meninggal/status-pinjaman",
      //   //   label: "Status Pinjaman",
      //   //   href: "/admin/anggota-meninggal/status-pinjaman",
      //   // },
      //   // {
      //   //   id: "anggota-meninggal/pembayaran-anggota",
      //   //   label: "Pembayaran Anggota",
      //   //   href: "/admin/anggota-meninggal/pembayaran-anggota",
      //   // },
      // ],
    },
    {
      id: "akuntansi",
      label: "Akuntansi",
      icon: <FileText className="h-5 w-5" />,
      href: "#",
      children: [
        {
          id: "akuntansi/jurnal-transaksi",
          label: "Jurnal Transaksi",
          href: "/admin/akuntansi/jurnal-transaksi",
        },
        {
          id: "akuntansi/saldo-coa",
          label: "Saldo COA",
          href: "/admin/akuntansi/saldo-coa",
        },
        {
          id: "akuntansi/buku-besar",
          label: "Buku Besar",
          href: "/admin/akuntansi/buku-besar",
        },
      ],
    },
    {
      id: "laporan",
      label: "Laporan",
      icon: <LineChart className="h-5 w-5" />,
      href: "#",
      children: [
        {
          id: "laporan/pengajuan-pinjaman",
          label: "Pengajuan Pinjaman",
          href: "/admin/laporan/pengajuan-pinjaman",
        },
        {
          id: "laporan/nominatif-pinjaman",
          label: "Nominatif Pinjaman",
          href: "/admin/laporan/nominatif-pinjaman",
        },
        {
          id: "laporan/nominatif-simpanan",
          label: "Nominatif Simpanan",
          href: "/admin/laporan/nominatif-simpanan",
        },
        {
          id: "laporan/anggota-meninggal-dunia",
          label: "Anggota Meninggal Dunia",
          href: "/admin/laporan/anggota-meninggal-dunia",
        },
        {
          id: "laporan/sisa-hasil-usaha",
          label: "Sisa Hasil Usaha",
          href: "/admin/laporan/sisa-hasil-usaha",
        },
      ],
    },
    {
      id: "konfigurasi",
      label: "Konfigurasi",
      icon: <Settings className="h-5 w-5" />,
      href: "#",
      children: [
        {
          id: "konfigurasi/jenis-marketing",
          label: "Jenis Marketing",
          href: "/admin/konfigurasi/jenis-marketing",
        },
        {
          id: "konfigurasi/marketing",
          label: "Marketing",
          href: "/admin/konfigurasi/marketing",
        },
        {
          id: "konfigurasi/suku-bunga",
          label: "Suku Bunga",
          href: "/admin/konfigurasi/suku-bunga",
        },
        {
          id: "konfigurasi/coa-induk",
          label: "COA Induk",
          href: "/admin/konfigurasi/coa-induk",
        },
        {
          id: "konfigurasi/general-ledger",
          label: "General Ledger",
          href: "/admin/konfigurasi/general-ledger",
        },
        {
          id: "konfigurasi/sub-general-ledger",
          label: "Sub General Ledger",
          href: "/admin/konfigurasi/sub-general-ledger",
        },
        {
          id: "konfigurasi/rekening-general-ledger",
          label: "Rekening General Ledger",
          href: "/admin/konfigurasi/rekening-general-ledger",
        },
        {
          id: "konfigurasi/kode-transaksi",
          label: "Kode Transaksi",
          href: "/admin/master/kode-transaksi",
        },
        {
          id: "konfigurasi/pengelola",
          label: "Pengelola",
          href: "/admin/pengelola",
        },
      ],
    },
    {
      id: "master",
      label: "Master",
      icon: <Database className="h-5 w-5" />,
      href: "#",
      children: [
        {
          id: "master/coa",
          label: "COA",
          href: "/admin/master/coas",
        },
        {
          id: "master/kode-transaksi",
          label: "Kode Transaksi",
          href: "/admin/master/kode-transaksi",
        },
      ],
    },
    {
      id: "pemisah-marketplace",
      label: "Marketplace",
      isSeparator: true,
      href: "#"
    },
    {
      id: "dashboard-marketplace",
      label: "Dashboard",
      icon: <BookDashed className="h-5 w-5" />,
      href: "/admin/dashboard-marketplace",
    },
    {
      id: "seller",
      label: "Seller",
      icon: <UserCheck className="h-5 w-5" />,
      href: "/admin/seller", 
    },
    {
      id: "product-marketplace",
      label: "Produk",
      icon: <Package className="h-5 w-5" />,
      href: "/admin/product-list", 
    },
    {
      id: "transaction-marketplace",
      label: "Transaksi",
      icon: <ShoppingCart className="h-5 w-5" />,
      href: "/admin/transaction",
    },
    {
      id: "ppob",
      label: "PPOB",
      icon: <SmartphoneNfc className="h-5 w-5" />,
      href: "#",
      children: [
        {
          id: "ppob/transaksi",
          label: "Transaksi",
          href: "/admin/ppob/transaksi",
        },
        {
          id: "ppob/produk",
          label: "Produk PPOB",
          href: "/admin/ppob/produk",
        },
      ],
    },
    {
      id: "stock-opname",
      label: "Stock Opname",
      icon: <Package className="h-5 w-5" />,
      href: "/admin/stock-opname",
    },
    {
      id: "pengadaan",
      label: "Pengadaan",
      icon: <Package className="h-5 w-5" />,
      href: "/admin/pengadaan",
    },
    {
      id: "pos-kasir",
      label: "Pos Kasir",
      icon: <CreditCard className="h-5 w-5" />,
      href: "#",
      children: [
        {
          id: "pos-kasir/kasir",
          label: "Kasir",
          href: "/admin/pos-kasir/kasir",
        },
        {
          id: "pos-kasir/history",
          label: "History",
          href: "/admin/pos-kasir/history",
        },
      ],
    },
    {
      id: "customer-marketplace",
      label: "Data Customer",
      icon: <BookUser className="h-5 w-5" />,
      href: "/admin/customer",
    },
    {
      id: "voucher",
      label: "Voucher",
      icon: <Tag className="h-5 w-5" />,
      href: "/admin/voucher", 
    },
    {
      id: "master-marketplace",
      label: "Master",
      icon: <Database className="h-5 w-5" />,
      href: "#", 
      children: [
        {
          id: "master-product-category-marketplace",
          label: "Kategori Produk",
          href: "/admin/product-category",
        },
        {
          id: "master-product-merk-marketplace",
          label: "Tipe Produk",
          href: "/admin/product-merk",
        },
        {
          id: "master-supplier-marketplace",
          label: "Supplier",
          href: "/admin/supplier",
        },
      ],
    },
    {
      id: "profile-toko",
      label: "Profile Toko",
      icon: <Building className="h-5 w-5" />,
      href: "/admin/profile-toko",
    },
    {
      id: "pemisah-konten-website",
      label: "Konten Website",
      isSeparator: true,
      href: "#"
    },
    {
      id: "home",
      label: "Home",
      icon: <Webhook className="h-5 w-5" />,
      href: "/admin/home", 
    },
    {
      id: "tentang-kami",
      label: "Tentang Kami",
      icon: <FileStack className="h-5 w-5" />,
      href: "/admin/tentang-kami", 
    },
    {
      id: "gallery",
      label: "Galeri",
      icon: <GalleryVertical className="h-5 w-5" />,
      href: "/admin/gallery", 
    },
    {
      id: "news",
      label: "Berita",
      icon: <Newspaper className="h-5 w-5" />,
      href: "/admin/news", 
    },
  ];

  // Menu items untuk admin (terbatas)
  const adminMenuItems: MenuItem[] = [
    {
      id: "dashboard-admin",
      label: "Dashboard",
      icon: <BookDashed className="h-5 w-5" />,
      href: "/admin/dashboard",
    },
    {
      id: "pemisah-marketplace-admin",
      label: "Marketplace",
      isSeparator: true,
      href: "#"
    },
    {
      id: "master-admin",
      label: "Master",
      icon: <Database className="h-5 w-5" />,
      href: "#", 
      children: [
        {
          id: "master-product-category-admin",
          label: "Kategori Produk",
          href: "/admin/product-category",
        },
        {
          id: "master-product-merk-admin",
          label: "Tipe Produk",
          href: "/admin/product-merk",
        },
      ],
    },
    {
      id: "product-admin",
      label: "Produk",
      icon: <Package className="h-5 w-5" />,
      href: "/admin/product-list", 
    },
    {
      id: "transaction-admin",
      label: "Transaksi",
      icon: <ShoppingCart className="h-5 w-5" />,
      href: "/admin/transaction",
    },
    {
      id: "customer-admin",
      label: "Data Customer",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/customer",
    },
  ];

  // Tentukan menu items berdasarkan role pengguna
  if (!user || user?.roles[0].name === "superadmin") {
    menuItems = superadminMenuItems;
  } else if (user?.roles[0].name === "admin") {
    menuItems = adminMenuItems;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={menuItems}
      />

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-2">
            <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-2">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;