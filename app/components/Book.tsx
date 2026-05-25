"use client";

import Image from "next/image";
import { normalizeImageUrl } from "@/app/lib/image";
import { BookType } from "@/app/types/types";
import Link from "next/link";

type BookProps = {
  book: BookType;
  isPurchased?: boolean;
};

const Book = ({ book, isPurchased }: BookProps) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    } else {
      return text;
    }
  };

  const imageSrc = normalizeImageUrl(book.image?.url);

  const formattedPrice = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(book.price);

  return (
    <div className="flex flex-col items-center m-4 w-96">
        <Link
          href={`/product/${book.id}`}
          className="cursor-pointer shadow-2xl duration-300 hover:translate-y-1 hover:shadow-none"
        >
          <div className="relative w-96 h-64">
            {imageSrc ? (
              <Image
                priority
                src={imageSrc}
                alt={book.title}
                fill
                sizes="384px"
                className="rounded-t-md object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-t-md bg-slate-200 text-slate-500">
                画像なし
              </div>
            )}
          </div>
          <div className="px-4 py-4 bg-slate-100 rounded-b-md h-full">
            <h2 className="text-xl font-semibold">{book.title}</h2>
            {/* {book.tag && (
              <div className="mt-2">
                {book.tag.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-yellow-400 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )} */}
            <p className="mt-2 text-lg text-slate-600">
              {truncateText(book.content, 50)}
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
  );
};

export default Book;
