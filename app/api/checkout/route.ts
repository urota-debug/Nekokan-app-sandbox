import Stripe from "stripe";
import { NextResponse } from "next/server";

// 初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(request: Request) {
  const { title, price, productId, bookId, userId } = await request.json();
  const resolvedProductId = productId ?? bookId;

  if (!title || price == null || !resolvedProductId) {
    return NextResponse.json(
      { message: "title, price, productId は必須です" },
      { status: 400 },
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { message: "STRIPE_SECRET_KEY が設定されていません" },
      { status: 500 },
    );
  }

  if (!baseUrl) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_BASE_URL が設定されていません" },
      { status: 500 },
    );
  }

  try {
    // チェックアウトセッションの作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      metadata: {
        productId: String(resolvedProductId),
      },
      client_reference_id: userId,
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: title,
            },
            unit_amount: Math.round(Number(price)),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/product/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}`,
    });
    if (!session.url) {
      return NextResponse.json(
        { message: "チェックアウト URL の取得に失敗しました" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "決済セッションの作成に失敗しました";
    return NextResponse.json({ message }, { status: 500 });
  }
}
