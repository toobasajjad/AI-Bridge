import mongoose, { Schema, type Model } from "mongoose";
import type { TransactionStatus } from "@/types/transaction";

export interface TransactionDocument {
  offlineId: string;
  amount: number;
  account: string;
  status: TransactionStatus;
  cipherText: string;
  hash: string;
  signature: string | null;
  syncedAt: Date | null;
  createdAt: Date;
}

const TransactionSchema = new Schema<TransactionDocument>({
  offlineId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  account: { type: String, required: true },
  status: {
    type: String,
    enum: ["stored", "signed", "syncing", "synced"],
    default: "stored",
  },
  cipherText: { type: String, required: true },
  hash: { type: String, required: true },
  signature: { type: String, default: null },
  syncedAt: { type: Date, default: null },
  createdAt: { type: Date, default: () => new Date() },
});

// Avoid recompiling the model on every hot-reload in dev.
export const TransactionModel: Model<TransactionDocument> =
  mongoose.models.Transaction ||
  mongoose.model<TransactionDocument>("Transaction", TransactionSchema);
