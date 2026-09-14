import crypto from "crypto";

/**
 * Phase 2 — Encrypted Local Storage
 * Simulates the on-device AES-256 encryption step. In a real mobile client
 * this key would live in the device keystore/secure enclave; here we derive
 * a demo key from SIGNING_SECRET so the flow is reproducible.
 */
const ALGORITHM = "aes-256-cbc";

function getDemoKey(): Buffer {
  const secret = process.env.SIGNING_SECRET || "ai-bridge-hackathon-demo-secret";
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptPayload(payload: Record<string, unknown>): {
  cipherText: string;
  iv: string;
  hash: string;
} {
  const key = getDemoKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);

  const hash = crypto.createHash("sha256").update(json).digest("hex").slice(0, 12).toUpperCase();

  return {
    cipherText: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    hash: `XY${hash}`,
  };
}

/**
 * Phase 3 — Cryptographic Signature
 * Simulates signing the transaction hash with a device-held key, producing
 * a verifiable signature the sync engine can check before accepting data.
 */
export function signTransaction(hash: string, offlineId: string): string {
  const key = getDemoKey();
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(`${hash}:${offlineId}`);
  return `SK-${hmac.digest("hex").slice(0, 6).toUpperCase()}`;
}

export function generateOfflineId(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `OFFLINE-PAY-${n}`;
}
