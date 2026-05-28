import { render, screen } from "@testing-library/react";
import ProductCard from "@/app/components/ProductCard";
import { ProductType } from "@/app/types/types";

const product: ProductType = {
  id: "1",
  title: "Product 1",
  price: 100,
  content: "Content 1",
  image: { url: "https://example.com/cat-can.jpg", height: 150, width: 150 },
  createdAt: "2021-01-01",
  updatedAt: "2021-01-01",
  publishedAt: "2021-01-01",
  revisedAt: "2021-01-01",
};

const isPurchased = false;

describe("ProductCard", () => {
  test("ProductCard が正常にレンダリングされる", () => {
    render(<ProductCard product={product} isPurchased={isPurchased} />);
    expect(screen.getByText(product.title)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
    expect(screen.getByText(product.content)).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: product.title }),
    ).toBeInTheDocument();
  });

  test("isPurchased が true のとき「過去に購入済み」が表示される", () => {
    render(<ProductCard product={product} isPurchased={true} />);
    expect(screen.getByText("過去に購入済み")).toBeInTheDocument();
  });

  test("isPurchased が false のとき「過去に購入済み」が表示されない", () => {
    render(<ProductCard product={product} isPurchased={false} />);
    expect(screen.queryByText("過去に購入済み")).not.toBeInTheDocument();
  });

  const longContent = "あ".repeat(51);
  const expected = "あ".repeat(50) + "...";
  test("商品本文が50文字を超えると省略される", () => {
    render(
      <ProductCard
        product={{ ...product, content: longContent }}
        isPurchased={false}
      />,
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  test("商品詳細ページへのリンクになっている", () => {
    render(<ProductCard product={product} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/product/${product.id}`);
  });

  test("商品画像がないときは画像なしメッセージが表示される", () => {
    render(<ProductCard product={{ ...product, image: undefined }} />);
    expect(screen.getByText("画像なし")).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: product.title }),
    ).not.toBeInTheDocument();
  });
});
