import React from "react";
import Image from "next/image";
import prisma from "../lib/prisma";
import { getDetailProduct } from "../lib/microcms/server";
import { ProductType, User } from "../types/types";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "../lib/next-auth/options";
import ProductCard from "../components/ProductCard";

export default async function ProfilePage() {
  const session = await getServerSession(nextAuthOptions);
  const user = session?.user as User | undefined;

  const purchases = user?.id
    ? await prisma.purchase.findMany({
        where: { userId: user.id },
      })
    : [];

  // microCMS が 404 でもページ全体が落ちないよう、一件ずつキャッチして取り込む
  const detailProducts = (
    await Promise.all(
      purchases.map(async (purchase) => {
        try {
          return await getDetailProduct(purchase.bookId);
        } catch {
          return null;
        }
      }),
    )
  ).filter((p): p is ProductType => p != null);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">プロフィール</h1>

      <div className="bg-white shadow-md rounded p-4">
        <div className="flex items-center">
          <Image
            priority
            src={user?.image || "/default_icon.png"}
            alt="user profile_icon"
            width={60}
            height={60}
            className="rounded-t-md"
          />
          <h2 className="text-lg ml-4 font-semibold">お名前：{user?.name}</h2>
        </div>
      </div>

      <span className="font-medium text-lg mb-4 mt-4 block">
        過去に購入した猫缶
      </span>
      {detailProducts.length === 0 ? (
        <p className="text-slate-600">
          まだ購入履歴がありません。商品を購入するとここに表示されます。
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-6">
          {detailProducts.map((detailProduct) => (
            <ProductCard key={detailProduct.id} product={detailProduct} />
          ))}
        </div>
      )}
    </div>
  );
}
