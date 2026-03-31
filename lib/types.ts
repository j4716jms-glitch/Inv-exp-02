export interface UploadedFile {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  contentType?: string;
}

export type InventoryItem = Record<string, string | number | null>;

export interface ParsedSheet {
  sheetName: string;
  rows: InventoryItem[];
}

export interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  categories: number;
}
