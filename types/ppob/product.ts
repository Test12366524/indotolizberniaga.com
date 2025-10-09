export interface Product {
  id: number;
  ppob_category_id: number;
  category_title?: string | null;
  parent_category_title?: string | null;
  name: string;
  sku: string;
  description: string;
  buy_price: number;
  sell_price: number;
  slug?: string;
  status: boolean | number;
  image: File | string | null;
}