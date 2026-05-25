import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { sessionId } = await request.json();

  if (!sessionId) {
    return NextResponse.json(
      { message: "sessionId は必須です" },
      { status: 400 },
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { message: "STRIPE_SECRET_KEY が設定されていません" },
      { status: 500 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { message: "決済が完了していません" },
        { status: 400 },
      );
    }

    const userId = session.client_reference_id;
    const bookId = session.metadata?.productId;

    if (!userId || !bookId) {
      return NextResponse.json(
        { message: "購入情報（userId / productId）が不足しています" },
        { status: 400 },
      );
    }

    const existing = await prisma.purchase.findFirst({
      where: { userId, bookId },
    });

    if (existing) {
      return NextResponse.json({ purchase: existing });
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId,
        bookId,
      },
    });

    return NextResponse.json({ purchase });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "購入履歴の保存に失敗しました";
    return NextResponse.json({ message }, { status: 500 });
  }
}
