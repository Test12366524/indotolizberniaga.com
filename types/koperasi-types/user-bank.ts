export interface UserBank {
  id: number;
  user_id: number;
  bank: string;
  account_name: string;
  account_number: string;
  description: string;
  is_primary: boolean | number;
  created_at: string;
  updated_at: string;
  user_name: string;
}