import { NextResponse } from "next/server";
import { syncTransactionById } from "@/lib/store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const transaction = await syncTransactionById(id);

  if (!transaction) {
    return NextResponse.json(
      { error: "Transaction must be signed before it can sync" },
      { status: 409 }
    );
  }

  return NextResponse.json({ transaction });
}
