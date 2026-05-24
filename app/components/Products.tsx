"use client"

import Image from "next/image";
import { ProductType } from "../types/types";
import Link from "next/link";

type ProductProps = {
  product: ProductType;
  isPurchased?: boolean;
};

const Product = ({ product, isPurchased }: ProductProps) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    } else {
      return text;
    }
  };

  const formattedPrice = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(product.price);

  return (
    <>
      {/* アニメーションスタイル */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .modal {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      <div className="flex flex-col items-center m-4 w-96">
        <Link
          href={`/product/${product.id}`}
          className="cursor-pointer shadow-2xl duration-300 hover:translate-y-1 hover:shadow-none"
        >
          <div className="relative w-96 h-64">
            <Image
              priority
              src={product.thumbnail.url}
              alt={product.title}
              layout="fill"
              objectFit="cover"
              className="rounded-t-md"
            />
          </div>
          <div className="px-4 py-4 bg-slate-100 rounded-b-md h-full">
            <h2 className="text-xl font-semibold">{product.title}</h2>
            {product.tag && (
              <div className="mt-2">
                {product.tag.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-yellow-400 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2 text-lg text-slate-600">
              {truncateText(product.content, 50)}
            </p>
            <div className="flex justify-between items-center mt-3">
              {isPurchased ? (
                <span className="bg-green-500 text-white px-2 py-1 text-xs rounded">
                  過去に購入済み
                </span>
              ) : (
                <span className="flex-grow"></span>
              )}
              <p className="text-md text-slate-700 text-right">
                {formattedPrice}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default Product;

