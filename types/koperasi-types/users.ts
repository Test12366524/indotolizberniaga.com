export interface Users{
  id: number;
  role_id: number;
  name: string;
  email: string;
  phone: string;
  status: number;
  roles: { id: number; name: string }[];
}