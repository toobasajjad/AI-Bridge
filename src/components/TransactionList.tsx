"use client";

import { useState } from "react";
import type { TransactionRecord, TransactionStatus } from "@/types/transaction";

const STATUS_LABEL: Record<TransactionStatus, string> = {
  stored: "Stored offline",
  signed: "Signed",
  syncing: "Syncing",
  synced: "Synced",
};

export function TransactionList({
  transactions,
  selectedId,
  onSelect,
  onUpdate,
}: {
  transactions: TransactionRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (transaction: TransactionRecord) => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function advance(t: TransactionRecord) {
    const nextAction = t.status === "stored" ? "sign" : t.status === "signed" ? "sync" : null;
    if (!nextAction) return;

    setBusyId(t.id);
    try {
      const res = await fetch(`/api/transactions/${t.id}/${nextAction}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        onUpdate(data.transaction as TransactionRecord);
      }
    } finally {
      setBusyId(null);
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink-600 p-8 text-center text-sm text-mist-500">
        No transactions yet. Initiate one above to see it move through the pipeline.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink-600 bg-ink-800">
      <div className="border-b border-ink-600 px-5 py-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-signal-500">
          Ledger
        </h2>
      </div>
      <ul className="divide-y divide-ink-600">
        {transactions.map((t) => {
          const isSelected = t.id === selectedId;
          const actionLabel =
            t.status === "stored" ? "Sign" : t.status === "signed" ? "Sync" : null;

          return (
            <li
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`flex cursor-pointer items-center justify-between px-5 py-3 transition ${
                isSelected ? "bg-ink-700" : "hover:bg-ink-700/50"
              }`}
            >
              <div>
                <p className="font-mono text-sm text-mist-200">{t.offlineId}</p>
                <p className="text-xs text-mist-500">
                  ${t.amount.toFixed(2)} → {t.account}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    t.status === "synced"
                      ? "bg-signal-500/10 text-signal-400"
                      : "bg-ink-600 text-mist-400"
                  }`}
                >
                  {STATUS_LABEL[t.status]}
                </span>
                {actionLabel && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      advance(t);
                    }}
                    disabled={busyId === t.id}
                    className="rounded-md border border-signal-600 px-2.5 py-1 text-xs font-medium text-signal-400 transition hover:bg-signal-500/10 disabled:opacity-50"
                  >
                    {busyId === t.id ? "Working…" : actionLabel}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
