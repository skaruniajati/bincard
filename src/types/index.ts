export type UserRole = "ADMIN" | "PETUGAS";

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BinCard {
  id: string;
  materialId: string;
  qrToken: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  materialCode: string;
  description: string;
  category: string;
  uom: string;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number | null;
  storageLocation: string;
  isActive: boolean;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
  binCard?: BinCard | null;
}

export type TransactionType = "GR" | "GI";

export interface Transaction {
  id: string;
  transactionNumber: string;
  materialId: string;
  material?: Material;
  transactionType: TransactionType;
  quantity: number;
  previousBalance: number;
  newBalance: number;
  transactionDate: string;
  referenceNumber?: string | null;
  remarks?: string | null;
  userId: string;
  user?: {
    id: string;
    name: string;
    username: string;
    role: string;
  };
  createdAt: string;
}

export interface StockMovement {
  id: string;
  materialId: string;
  material?: Material;
  transactionId: string;
  transaction?: Transaction;
  movementType: "IN" | "OUT";
  quantityIn: number;
  quantityOut: number;
  balance: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: {
    name: string;
    username: string;
  } | null;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  totalMaterials: number;
  totalStockUnits: number;
  totalReceiptsCount: number;
  totalIssuesCount: number;
  totalReceiptsQty: number;
  totalIssuesQty: number;
  lowStockCount: number;
  outOfStockCount: number;
  stockComposition: {
    status: string;
    count: number;
    color: string;
  }[];
  movementTrends: {
    period: string;
    masuk: number;
    keluar: number;
  }[];
  recentTransactions: Transaction[];
  alertMaterials: Material[];
}
