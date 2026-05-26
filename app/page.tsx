import { getServerSession } from "next-auth";
import ProductCard from "@/app/components/ProductCard";
import { getAllProducts } from "./lib/microcms/client";
import { ProductType, Purchase, User } from "./types/types";
import { nextAuthOptions } from "./lib/next-auth/options";
import Image from "next/image";

// ビルド時に空の一覧が焼き付くのを防ぐ（microCMS はリクエストごとに取得）
export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(nextAuthOptions);
  const user = session?.user as User;
  const productsData = await getAllProducts();
  const contents = productsData?.contents ?? [];

  if (process.env.NODE_ENV === "development") {
    console.log("[microCMS]", {
      totalCount: productsData.totalCount,
      contentsLength: contents.length,
    });
  }

  let purchasesData = [];
  let purchasedIds: string[] = [];

  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (user?.id && apiOrigin) {
    const base = apiOrigin.replace(/\/$/, "");
    const purchasesPath =
      base.endsWith("/api")
        ? `${base}/purchases/${user.id}`
        : `${base}/api/purchases/${user.id}`;
    const response = await fetch(purchasesPath);

    if (response.ok) {
      purchasesData = await response.json();
      purchasedIds = purchasesData.map((purchase: Purchase) => purchase.bookId);
    }
  }

  return (
    <>
      <div className="relative w-full h-64 md:h-96">
        <Image
          src="/28480621_l.jpg"
          alt="Header Image"
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 p-4">
          <h1 className="text-white text-4xl md:text-5xl font-bold">
            - 全ての肉球に届け -
          </h1>
        </div>
      </div>

      <main className="flex flex-wrap justify-center items-center md:mt-16 mt-10">
        <h2 className="text-center w-full font-bold text-3xl mb-2">猫缶一覧</h2>
        {contents.length === 0 ? (
          <p className="text-gray-600">
            商品がありません。microCMS
            で公開済みのコンテンツがあるか確認してください。
          </p>
        ) : (
          contents.map((product: ProductType) => (
            <ProductCard
              key={product.id}
              product={product}
              isPurchased={purchasedIds.includes(product.id)}
            />
          ))
        )}
      </main>
    </>
  );
}
