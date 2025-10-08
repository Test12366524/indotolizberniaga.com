export interface ProductCategory {
  id: number;
  parent_id?: number | string | null;
  title: string;
  sub_title: string;
  slug?: string;
  description: string;
  status: boolean | number;
  image: File | string | null;
  digiflazz_code?: string | null;
}