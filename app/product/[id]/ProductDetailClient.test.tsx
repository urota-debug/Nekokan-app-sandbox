import { ProductType } from "@/app/types/types";
import { render, screen } from "@testing-library/react";
import ProductDetailClient from "./ProductDetailClient";
import { userEvent } from "@testing-library/user-event";
import { waitFor } from "@testing-library/react";
import type { Session } from "next-auth";
import { beforeEach, vi } from "vitest";

beforeEach(() => {
  mockUseSession.mockReturnValue({ data: null });
  mockFetch.mockClear();
});

const SHIPPING_FEE = 500;

const mockPush = vi.fn();
const mockSignIn = vi.fn();
type MockSessionData = { user: Session["user"] } | null;

const mockUseSession = vi.fn((): { data: MockSessionData } => ({ data: null }));

vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    checkout_url: "https://checkout.stripe.com/test",
    session_id: "sess_123",
  }),
});

vi.stubGlobal("fetch", mockFetch);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
  }),
}));

const product: ProductType = {
  id: "1",
  title: "Product 1",
  price: 100,
  content: "Content 1",
  image: { url: "https://example.com/cat-can.jpg", height: 150, width: 150 },
  createdAt: "2021-01-01",
  updatedAt: "2021-01-01",
};

test("商品タイトルと購入ボタンが表示される", () => {
  render(<ProductDetailClient product={product} />);
  expect(
    screen.getByRole("heading", { name: product.title }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "購入する" })).toBeInTheDocument();
});

test("購入するを押すと確認モーダルが表示される", async () => {
  const user = userEvent.setup();
  render(<ProductDetailClient product={product} />);
  const purchaseButtons = screen.getAllByRole("button", { name: "購入する" });
  await user.click(purchaseButtons[0]); // 一覧側の黄ボタン
  expect(screen.getByText("この猫缶を購入しますか？")).toBeInTheDocument();
});

test("確認モーダルのキャンセルボタンを押すとモーダルが非表示になる", async () => {
  const user = userEvent.setup();
  render(<ProductDetailClient product={product} />);
  const purchaseButtons = screen.getAllByRole("button", { name: "購入する" });
  await user.click(purchaseButtons[0]); // 一覧側の黄ボタン
  const cancelButton = screen.getByRole("button", { name: "キャンセル" });
  await user.click(cancelButton);
  expect(
    screen.queryByText("この猫缶を購入しますか？"),
  ).not.toBeInTheDocument();
});

test("未ログインでモーダル内の購入するを押すと signIn が callbackUrl 付きで呼ばれる", async () => {
  const user = userEvent.setup();
  render(<ProductDetailClient product={product} />);

  await user.click(screen.getByRole("button", { name: "購入する" }));

  const purchaseButtons = screen.getAllByRole("button", { name: "購入する" });
  await user.click(purchaseButtons[1]);

  expect(mockSignIn).toHaveBeenCalledWith(undefined, {
    callbackUrl: "/product/1",
  });
});

test("ログイン中でモーダル内の購入するを押すと決済が開始される", async () => {
  mockUseSession.mockReturnValue({
    data: { user: { id: "1", name: "Test" } },
  });

  const user = userEvent.setup();
  render(<ProductDetailClient product={product} />);

  await user.click(screen.getByRole("button", { name: "購入する" }));
  const confirmButtons = screen.getAllByRole("button", { name: "購入する" });
  await user.click(confirmButtons[1]);

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        title: product.title,
        price: product.price + SHIPPING_FEE,
        userId: "1",
      }),
    });
  });
});
