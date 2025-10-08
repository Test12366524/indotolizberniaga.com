export interface Supplier {
  id: number;
  shop_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Supplier[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface CreateSupplierRequest {
  shop_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: number;
}

export interface UpdateSupplierRequest {
  shop_id?: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: number;
}
