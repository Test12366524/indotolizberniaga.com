export interface Product {
  id: number;
  category?:{
    id: number;
    name: string;
    slug: string;
  };
  merk?:{
    id: number;
    name: string;
    slug: string;
  };
  shop_id: number;
  product_category_id: number;
  product_merk_id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  weight: string;
  length: string;
  width: string;
  height: string;
  diameter: string;
  rating: number;
  total_reviews: number;
  status: number;
  created_at: string;
  updated_at: string;
  category_name: string;
  category_slug: string;
  merk_name: string;
  merk_slug: string;
  image: string | File;
  image_2: string | File;
  image_3: string | File;
  image_4: string | File;
  image_5: string | File;
  image_6: string | File;
  image_7: string | File;
  media: {
    id: number;
    model_type: string;
    model_id: number;
    uuid: string;
    collection_name: string;
    name: string;
    file_name: string;
    mime_type: string;
    disk: string;
    conversions_disk: string;
    size: number;
    order_column: number;
    created_at: string;
    updated_at: string;
    original_url: string;
    preview_url: string;
  }[];
}

export interface ProductListResponse {
  current_page: number;
  data: Product[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}