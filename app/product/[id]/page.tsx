import { getDetailProduct } from "@/app/lib/microcms/server";
import { ProductType } from "@/app/types/types";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  if (!id) notFound();

  let product: ProductType;
  try {
    product = await getDetailProduct(id);
  } catch {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
