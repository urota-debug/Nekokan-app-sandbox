import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// 購入履歴検索API
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers#dynamic-route-segments
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId } = await context.params;

  try {
    const purchase = await prisma.purchase.findMany({
      where: { userId: userId },
    });

    return NextResponse.json(purchase);
  } catch {
    return NextResponse.json(
      { message: "購入履歴の取得に失敗しました" },
      { status: 500 },
    );
  }
}
