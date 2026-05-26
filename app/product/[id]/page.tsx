import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  if (!id) notFound();

  return <ProductDetailClient id={id} />;
}
