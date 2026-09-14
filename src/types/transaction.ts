export type TransactionStatus = "stored" | "signed" | "syncing" | "synced";

export interface TransactionRecord {
  id: string;
  offlineId: string;
  amount: number;
  account: string;
  status: TransactionStatus;
  cipherText: string;
  hash: string;
  signature: string | null;
  syncedAt: string | null;
  createdAt: string;
}
