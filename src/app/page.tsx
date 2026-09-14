"use client";

import { useEffect, useState } from "react";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { PhasePipeline } from "@/components/PhasePipeline";
import type { TransactionRecord } from "@/types/transaction";

export default function Home() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/transactions")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Failed to load transactions");
        }
        setTransactions(data.transactions || []);
        setLoaded(true);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : "Failed to load transactions");
        setLoaded(true);
      });
  }, []);

  function upsert(transaction: TransactionRecord) {
    setTransactions((prev) => {
      const exists = prev.some((t) => t.id === transaction.id);
      if (exists) {
        return prev.map((t) => (t.id === transaction.id ? transaction : t));
      }
      return [transaction, ...prev];
    });
    setSelectedId(transaction.id);
  }

  const selected = transactions.find((t) => t.id === selectedId) || null;

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-signal-500">AI-Bridge</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-mist-200 sm:text-4xl">
          Offline-first transaction architecture
        </h1>
        <p className="mt-3 max-w-2xl text-mist-400">
          A working demo of the four-phase pipeline: transactions are initiated and
          encrypted on-device, cryptographically signed, then handed to the sync
          engine for cloud restoration once connectivity returns.
        </p>
      </header>

      <main className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <TransactionForm onCreated={upsert} />
          {loadError && (
            <p className="rounded-md border border-alert/40 bg-alert/10 px-4 py-3 text-sm text-alert">
              {loadError}
            </p>
          )}
          {loaded && !loadError && (
            <TransactionList
              transactions={transactions}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdate={upsert}
            />
          )}
        </div>

        <div className="lg:sticky lg:top-12 lg:self-start">
          <PhasePipeline transaction={selected} />
        </div>
      </main>
    </div>
  );
}
