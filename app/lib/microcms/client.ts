import { ProductType } from "@/app/types/types";
import { createClient } from "microcms-js-sdk";

function getClient() {
  const serviceDomain = process.env.NEXT_PUBLIC_SERVICE_DOMAIN;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  if (!serviceDomain || !apiKey) {
    throw new Error(
      "microCMS: .env.local に NEXT_PUBLIC_SERVICE_DOMAIN と NEXT_PUBLIC_API_KEY を設定してください",
    );
  }

  return createClient({ serviceDomain, apiKey });
}

// 開発中の空キャッシュや、リスト形式に変える前の古いレスポンスを避ける
const requestInit = {
  cache: "no-store" as const,
};

export const getAllProducts = async () => {
  const list = await getClient().getList<ProductType>({
    endpoint: "nekokan",
    customRequestInit: requestInit,
  });

  const contents = list.contents ?? [];

  return {
    contents,
    totalCount: list.totalCount ?? contents.length,
    offset: list.offset ?? 0,
    limit: list.limit ?? contents.length,
  };
};

export const getDetailProduct = async (contentId: string) => {
  return getClient().getListDetail<ProductType>({
    endpoint: "nekokan",
    contentId,
    customRequestInit: requestInit,
  });
};
