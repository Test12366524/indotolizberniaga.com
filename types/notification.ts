export interface NotificationData {
  message: string;
  date: string;
  url: string;
  link: string | null;
  type: string;
}

export interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}