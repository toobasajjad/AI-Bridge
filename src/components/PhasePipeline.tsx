import type { TransactionRecord, TransactionStatus } from "@/types/transaction";

const PHASES: {
  key: TransactionStatus;
  label: string;
  detail: (t: TransactionRecord) => string;
}[] = [
  {
    key: "stored",
    label: "Secure Initiation & Local Storage",
    detail: (t) => `AES-256 · hash ${t.hash}`,
  },
  {
    key: "signed",
    label: "Cryptographic Signature",
    detail: (t) => (t.signature ? `Signed ${t.signature}` : "Awaiting signature"),
  },
  {
    key: "syncing",
    label: "Sync Engine",
    detail: () => "Bridging to cloud database",
  },
  {
    key: "synced",
    label: "Cloud Restoration",
    detail: (t) =>
      t.syncedAt ? `Confirmed ${new Date(t.syncedAt).toLocaleTimeString()}` : "Not yet synced",
  },
];

const ORDER: TransactionStatus[] = ["stored", "signed", "syncing", "synced"];

export function PhasePipeline({ transaction }: { transaction: TransactionRecord | null }) {
  const currentIndex = transaction ? ORDER.indexOf(transaction.status) : -1;

  return (
    <div className="rounded-lg border border-ink-600 bg-ink-800 p-5">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-signal-500">
        Pipeline
      </h2>
      <p className="mt-1 text-sm text-mist-500">
        {transaction
          ? `Tracking ${transaction.offlineId}`
          : "Select a transaction from the ledger to trace it through the pipeline."}
      </p>

      <ol className="mt-5 space-y-0">
        {PHASES.map((phase, i) => {
          const isComplete = currentIndex > i || (currentIndex === i && phase.key === "synced");
          const isActive = currentIndex === i && !isComplete;
          const isPending = currentIndex < i;

          return (
            <li key={phase.key} className="relative flex gap-4 pb-8 last:pb-0">
              {i < PHASES.length - 1 && (
                <span
                  className={`absolute left-[15px] top-8 h-full w-px ${
                    isComplete ? "bg-signal-500" : "bg-ink-600"
                  }`}
                />
              )}
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${
                  isComplete
                    ? "border-signal-500 bg-signal-500/10 text-signal-400"
                    : isActive
                    ? "border-signal-500 text-signal-500"
                    : "border-ink-600 text-mist-500"
                }`}
              >
                {i + 1}
              </span>
              <div>
                <p
                  className={`font-display text-sm font-medium ${
                    isPending ? "text-mist-500" : "text-mist-200"
                  }`}
                >
                  {phase.label}
                </p>
                <p className="mt-0.5 font-mono text-xs text-mist-500">
                  {transaction && !isPending ? phase.detail(transaction) : "—"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
