export interface AnggotaKoperasi {
  id: number;
  user_id: number | null;
  reference: string;
  ref_number: 1;
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: string; // M or F
  birth_date: string;
  birth_place: string;
  nik: string;
  npwp: string |null;
  status: number; // case PENDING = 0; case APPROVED = 1; case REJECTED = 2;
  created_at: string;
  updated_at: string;
}
