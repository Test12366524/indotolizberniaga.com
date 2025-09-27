export interface Shop {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  latitude: string;
  longitude: string;
  rating: string;
  total_reviews: number;
  rajaongkir_province_id: number;
  rajaongkir_city_id: number;
  rajaongkir_district_id: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  name: string;
  phone: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  anggota: {
    id: number;
    user_id: number;
    reference: string;
    ref_number: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    gender: string;
    birth_date: string;
    birth_place: string;
    nik: string;
    npwp: string;
    status: number;
    created_at: string;
    updated_at: string;
  };
  roles: {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot: {
      model_type: string;
      model_id: number;
      role_id: number;
    };
  }[];
  default_address: any;
  shop: Shop;
}
