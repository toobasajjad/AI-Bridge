import { NextResponse } from "next/server";
import { createTransaction, listTransactions } from "@/lib/store";

export async function GET() {
  try {
    const transactions = await listTransactions();
    return NextResponse.json({ transactions });
  } catch (err) {
    console.error("GET /api/transactions failed:", err);
    return NextResponse.json(
      { error: "Could not reach the database. Check MONGODB_URI and Atlas network access." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const amount = Number(body?.amount);
  const account = String(body?.account || "").trim();

  if (!amount || amount <= 0 || !account) {
    return NextResponse.json(
      { error: "amount (number > 0) and account (string) are required" },
      { status: 400 }
    );
  }

  try {
    const transaction = await createTransaction({ amount, account });
    return NextResponse.json({ transaction }, { status: 201 });
  } catch (err) {
    console.error("POST /api/transactions failed:", err);
    return NextResponse.json(
      { error: "Could not reach the database. Check MONGODB_URI and Atlas network access." },
      { status: 500 }
    );
  }
}
