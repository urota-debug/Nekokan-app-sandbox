import Product from "@/app/components/Product";
import Image from "next/image";

type ProductType = {
  id: number;
  title: string;
  price: number;
  content: string;
  thumbnail: { url: string };
  createdAt: string;
  updatedAt: string;
  tag: [];
};

// 疑似データ
const product = [
  {
    id: 1,
    title: "猫缶01",
    thumbnail: "/thumbnails/01.png",
    price: 2980,
    content: "猫缶01の詳細情報です",
    tag: ["ジャンボ缶", "多頭飼", "魚介類", "まとめ買い", "全猫種用", "お徳用"],
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
  },
  {
    id: 2,
    title: "猫缶02",
    thumbnail: "/thumbnails/02.png",
    price: 1980,
    content: "猫缶02の詳細情報です",
    tag: ["魚介類", "まとめ買い", "全猫種用", "お徳用"],
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
  },
  {
    id: 3,
    title: "猫缶03",
    price: 4980,
    thumbnail: "/thumbnails/03.png",
    content: "猫缶03の詳細情報です",
    tag: ["魚介類", "まとめ買い", "全猫種用"],
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
  },
];

export default async function Home() {
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
        {/* {contents.map((book: BookType) => (
          <Product
            key={book.id}
            book={book}
          />
        ))} */}
      </main>
    </>
  );
}
