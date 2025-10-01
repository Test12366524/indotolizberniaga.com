export interface SimpananCategory {
  id: number;
  code: string;
  name: string;
  description: string;
  nominal: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface SimpananCategoryResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: SimpananCategory[];
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

export interface CreateSimpananCategoryRequest {
  code: string;
  name: string;
  description: string;
  nominal: number;
  status: number;
}

export interface UpdateSimpananCategoryRequest {
  code?: string;
  name?: string;
  description?: string;
  nominal?: number;
  status?: number;
}
