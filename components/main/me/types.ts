"use client";

import { OrderStatus } from "@/lib/status-order";

/** ====== Shared types (dari file lama) ====== */
export interface UserProfile {
  id: string;
  anggota: { reference: string | null };
  shop: string | null;
  email_verified_at: string | null;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  image: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
}

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  total: number;
  grand_total: number;
  items: OrderItem[];
  trackingNumber?: string;
  payment_method?: string;
  payment_proof?: string;
  shipment_cost?: number;
  cod?: number;
  discount_total?: number;
  address_line_1?: string;
  postal_code?: string;
}

export interface ApiTransactionDetail {
  id?: number | string;
  product_id?: number;
  quantity?: number;
  price?: number;
  product_name?: string;
  product?: {
    name?: string;
    image?: string;
    media?: Array<{ original_url: string }>;
  } | null;
  image?: string | null;
}

export interface ApiTransaction {
  id: number | string;
  reference?: string;
  status?: number;
  total: number;
  grand_total: number;
  discount_total?: number;
  created_at?: string;
  details?: ApiTransactionDetail[];
  tracking_number?: string;
  payment_method?: string;
  payment_proof?: string;
  shipment_cost?: number;
  cod?: number;
  address_line_1?: string;
  postal_code?: string;
}

/** ====== Utilities yang dipakai lintas file ====== */
export const pickImageUrl = (d?: ApiTransactionDetail): string => {
  if (!d) return "/api/placeholder/80/80";
  if (typeof d.image === "string" && d.image) return d.image;
  const prod = d.product;
  if (prod?.image) return prod.image;
  const firstMedia = prod?.media?.[0]?.original_url;
  if (firstMedia) return firstMedia;
  return "/api/placeholder/80/80";
};

export const getStatusColor = (status: Order["status"]): string => {
  switch (status) {
    case "delivered":
      return "text-green-600 bg-green-50";
    case "shipped":
      return "text-blue-600 bg-blue-50";
    case "processing":
      return "text-yellow-600 bg-yellow-50";
    case "pending":
      return "text-orange-600 bg-orange-50";
    case "cancelled":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export const getStatusText = (status: Order["status"]): string => {
  switch (status) {
    case "delivered":
      return "Diterima";
    case "shipped":
      return "Dikirim";
    case "processing":
      return "Diproses";
    case "pending":
      return "Menunggu";
    case "cancelled":
      return "Dibatalkan";
    default:
      return status;
  }
};

export const DEFAULT_AVATAR =
  "https://8nc5ppykod.ufs.sh/f/H265ZJJzf6brRRAfCOa62KGLnZzEJ8j0tpdrMSvRcPXiYUsh";

export const normalizeUrl = (u?: string): string => {
  if (!u) return "";
  try {
    return encodeURI(u);
  } catch {
    return u;
  }
};