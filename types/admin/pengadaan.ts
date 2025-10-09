export interface PurchaseOrderDetail {
  id?: number;
  product_id: number;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  total: number;
  product?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface PurchaseOrder {
  id: number;
  user_id: number;
  shop_id: number;
  supplier: string;
  supplier_id: number;
  supplier_name: string;
  date: string;
  notes: string;
  total: number;
  paid: number;
  due: number;
  status: boolean;
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
  details: PurchaseOrderDetail[];
}

export interface CreatePurchaseOrderRequest {
  user_id: number;
  shop_id: number;
  supplier_id: number;
  date: string;
  notes: string;
  total: number;
  paid: number;
  due: number;
  status: boolean;
  details: Omit<PurchaseOrderDetail, 'id'>[];
}

export interface UpdatePurchaseOrderRequest extends Partial<CreatePurchaseOrderRequest> {
  id: number;
}
