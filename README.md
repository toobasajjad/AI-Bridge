# AI-Bridge — Offline-First Transaction Architecture (Demo)

A working Next.js demo of the 4-phase pipeline for the hackathon pitch:

1. **Secure Initiation** — a transaction is created (works offline in concept; here it's an instant API call).
2. **Encrypted Local Storage** — the payload is AES-256 encrypted and hashed before it's persisted.
3. **Cryptographic Signature** — the stored transaction is signed with an HMAC-based signature.
4. **Sync Engine & Cloud Restoration** — the signed transaction is marked as synced to the cloud database.

This is a **dummy-data demo**, meant to show the flow end-to-end and get client/organization
sign-off before wiring up a real mobile client and production key management.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- MongoDB via Mongoose — **optional for the demo**
- Node's built-in `crypto` module simulates the encryption/signing steps

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 — click **Initiate transaction**, then **Sign**, then **Sync**
on a row in the ledger and watch the pipeline on the right update live.

### Running without MongoDB

If you don't set `MONGODB_URI`, the app automatically uses an in-memory store, so
the whole demo works immediately with zero setup — good for a quick hackathon run-through.

### Running with real MongoDB

1. Create a free cluster on MongoDB Atlas (or use a local `mongod`).
2. Put the connection string in `.env.local` as `MONGODB_URI`.
3. Restart `npm run dev` — transactions now persist in the `ai-bridge` database.

## Project structure

```
src/
  app/
    page.tsx                    # dashboard UI
    api/transactions/route.ts   # Phase 1 & 2 — create + list
    api/transactions/[id]/sign  # Phase 3 — sign
    api/transactions/[id]/sync  # Phase 4 — sync to cloud
  components/                   # TransactionForm, TransactionList, PhasePipeline
  lib/
    crypto.ts                   # encryption + signature simulation
    mongodb.ts                  # Mongoose connection (optional)
    store.ts                    # data layer — Mongo if configured, else in-memory
  models/Transaction.ts         # Mongoose schema
  types/transaction.ts          # shared types
```

## Next steps (post client approval)

- Move Phase 1 & 2 onto an actual mobile client with local secure storage
  (Keychain / Keystore) instead of a server-side simulation.
- Replace the demo signing key with per-device key pairs and real signature
  verification on the server.
- Add a queue + retry strategy in the sync engine for spotty connectivity.
- Add auth so transactions are scoped to a real user/account.
