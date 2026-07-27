export interface Bill {
  id: string;
  identifier: string;
  title: string;
  summary: string;
  latest_action?: string;
}