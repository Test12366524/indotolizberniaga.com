export interface Product {
  id: number;
  ppob_category_id: number;
  name: string;
  sku: string;
  description: string;
  buy_price: number;
  sell_price: number;
  slug?: string;
  status: boolean | number;
  image: File | string | null;
}