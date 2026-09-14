import { randomUUID } from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { TransactionModel, type TransactionDocument } from "@/models/Transaction";
import { encryptPayload, generateOfflineId, signTransaction } from "@/lib/crypto";
import type { TransactionRecord } from "@/types/transaction";

// --- In-memory fallback (used when MONGODB_URI is not set) --------------
// Kept module-scoped so it survives across requests in the same server
// process, purely for demo purposes.
type MemoryRecord = TransactionDocument & { id: string };
const memoryStore: Map<string, MemoryRecord> = (global as unknown as {
  _aiBridgeMemoryStore?: Map<string, MemoryRecord>;
})._aiBridgeMemoryStore || new Map();
(global as unknown as { _aiBridgeMemoryStore?: Map<string, MemoryRecord> })._aiBridgeMemoryStore =
  memoryStore;

function toRecord(doc: MemoryRecord | (TransactionDocument & { _id: unknown })): TransactionRecord {
  const id = "id" in doc ? doc.id : String((doc as { _id: unknown })._id);
  return {
    id,
    offlineId: doc.offlineId,
    amount: doc.amount,
    account: doc.account,
    status: doc.status,
    cipherText: doc.cipherText,
    hash: doc.hash,
    signature: doc.signature,
    syncedAt: doc.syncedAt ? new Date(doc.syncedAt).toISOString() : null,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

/** Phase 1 + 2 — Initiate a transaction and encrypt it for local storage. */
export async function createTransaction(input: {
  amount: number;
  account: string;
}): Promise<TransactionRecord> {
  const offlineId = generateOfflineId();
  const { cipherText, hash } = encryptPayload({ ...input, offlineId });

  const db = await connectToDatabase();

  if (db) {
    const created = await TransactionModel.create({
      offlineId,
      amount: input.amount,
      account: input.account,
      status: "stored",
      cipherText,
      hash,
    });
    return toRecord(created.toObject() as TransactionDocument & { _id: unknown });
  }

  const record: MemoryRecord = {
    id: randomUUID(),
    offlineId,
    amount: input.amount,
    account: input.account,
    status: "stored",
    cipherText,
    hash,
    signature: null,
    syncedAt: null,
    createdAt: new Date(),
  };
  memoryStore.set(record.id, record);
  return toRecord(record);
}

export async function listTransactions(): Promise<TransactionRecord[]> {
  const db = await connectToDatabase();

  if (db) {
    const docs = await TransactionModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((doc) => toRecord(doc as TransactionDocument & { _id: unknown }));
  }

  return Array.from(memoryStore.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(toRecord);
}

/** Phase 3 — Generate the cryptographic signature for a stored transaction. */
export async function signTransactionById(id: string): Promise<TransactionRecord | null> {
  const db = await connectToDatabase();

  if (db) {
    const doc = await TransactionModel.findById(id);
    if (!doc) return null;
    doc.signature = signTransaction(doc.hash, doc.offlineId);
    doc.status = "signed";
    await doc.save();
    return toRecord(doc.toObject() as TransactionDocument & { _id: unknown });
  }

  const record = memoryStore.get(id);
  if (!record) return null;
  record.signature = signTransaction(record.hash, record.offlineId);
  record.status = "signed";
  memoryStore.set(id, record);
  return toRecord(record);
}

/** Phase 4 — Simulate the sync engine pushing the signed transaction to the cloud. */
export async function syncTransactionById(id: string): Promise<TransactionRecord | null> {
  const db = await connectToDatabase();

  if (db) {
    const doc = await TransactionModel.findById(id);
    if (!doc || !doc.signature) return null;
    doc.status = "synced";
    doc.syncedAt = new Date();
    await doc.save();
    return toRecord(doc.toObject() as TransactionDocument & { _id: unknown });
  }

  const record = memoryStore.get(id);
  if (!record || !record.signature) return null;
  record.status = "synced";
  record.syncedAt = new Date();
  memoryStore.set(id, record);
  return toRecord(record);
}
