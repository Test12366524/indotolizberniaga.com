export interface StockOpname {
  id: number;
  user_id: number;
  shop_id: number;
  product_id: number;
  initial_stock: number;
  counted_stock: number;
  difference: number;
  date: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  shop?: {
    id: number;
    name: string;
  };
  product?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface CreateStockOpnameRequest {
  user_id: number;
  shop_id: number;
  product_id: number;
  initial_stock: number;
  counted_stock: number;
  difference: number;
  date: string;
  notes: string;
}

export interface UpdateStockOpnameRequest extends Partial<CreateStockOpnameRequest> {
  id: number;
}
