// app/(admin)/kasir/ProductGrid.tsx
"use client";

import { Search, AlertCircle, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Product = {
  id: number;
  name: string;
  price: number;
  category_name: string;
};

export default function ProductGrid(props: {
  isLoading: boolean;
  products: Product[];
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (v: string) => void;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  onAdd: (p: Product) => void;
  totalVisible: number;
}) {
  const {
    isLoading,
    products,
    categories,
    selectedCategory,
    onSelectCategory,
    searchTerm,
    onSearchChange,
    onAdd,
    totalVisible,
  } = props;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600" />
          Katalog Produk
        </h2>
        <Badge variant="secondary" className="text-sm">
          {totalVisible} produk tersedia
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Cari produk atau jasa..."
            className="pl-10 h-11 text-base"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div>
          <Select value={selectedCategory} onValueChange={onSelectCategory}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500 font-medium">Memuat produk...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 font-medium">
              Tidak ada produk ditemukan
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Coba ubah kata kunci pencarian
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
                onClick={() => onAdd(product)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-2"
                      >
                        {product.category_name || "Produk"}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-3">
                      Rp {product.price?.toLocaleString("id-ID") ?? "0"}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah ke Keranjang
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}