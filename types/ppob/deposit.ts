export interface Deposit {
  id: number;
  bank: string;
  owner_name: string;
  amount: number;
  payment_method?: string | null;
  account_number?: number | null;
  notes?: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface DepositResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Deposit[];
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

export interface CreateDepositRequest {
  bank: string;
  owner_name: string;
  amount: number;
  payment_method?: string | null;
  account_number?: number | null;
  notes?: string | null;
  status: number;
}

export interface UpdateDepositRequest {
  bank?: string;
  owner_name?: string;
  amount?: number;
  payment_method?: string | null;
  account_number?: number | null;
  notes?: string | null;
  status?: number;
}
