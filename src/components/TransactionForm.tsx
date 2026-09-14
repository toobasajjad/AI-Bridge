"use client";

import { useState } from "react";
import type { TransactionRecord } from "@/types/transaction";

export function TransactionForm({
  onCreated,
}: {
  onCreated: (transaction: TransactionRecord) => void;
}) {
  const [amount, setAmount] = useState("50");
  const [account, setAccount] = useState("A1B2");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), account }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not start the transaction");
      }

      onCreated(data.transaction as TransactionRecord);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-ink-600 bg-ink-800 p-5"
    >
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-signal-500">
        Phase 1 — Secure Initiation
      </h2>
      <p className="mt-1 text-sm text-mist-500">
        Start a transaction offline. No network call happens here.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm text-mist-400">
          Amount
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-md border border-ink-600 bg-ink-900 px-3 py-2 font-mono text-mist-200 outline-none focus:border-signal-500"
          />
        </label>
        <label className="text-sm text-mist-400">
          Account
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="mt-1 w-full rounded-md border border-ink-600 bg-ink-900 px-3 py-2 font-mono text-mist-200 outline-none focus:border-signal-500"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-alert">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full rounded-md bg-signal-500 py-2.5 font-display text-sm font-semibold text-ink-950 transition hover:bg-signal-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Encrypting locally…" : "Initiate transaction"}
      </button>
    </form>
  );
}
