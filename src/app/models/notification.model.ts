export interface Notification {
  id: number;
  user_id: number;   // receptor
  type: string;
  message: string;
  read: boolean;
  created_at: string;

  sender?: {
    id: number;
    username: string;
    image: string | null;
  };
}
