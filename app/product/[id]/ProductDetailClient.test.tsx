import { ProductType } from "@/app/types/types";
import { render, screen, within, waitFor } from "@testing-library/react";
import ProductDetailClient from "./ProductDetailClient";
import { userEvent, type UserEvent } from "@testing-library/user-event";
import type { Session } from "next-auth";
import { beforeEach, vi } from "vitest";

const MODAL_TITLE = "この猫缶を購入しますか？";

function getPurchaseModal() {
  const dialog = screen.getByRole("heading", {
    name: MODAL_TITLE,
  }).parentElement!;
  return within(dialog);
}

async function openPurchaseModal(user: UserEvent) {
  await user.click(screen.getByRole("button", { name: "購入する" }));
  return getPurchaseModal();
}

async function clickModalPurchaseConfirm(user: UserEvent) {
  const modal = await openPurchaseModal(user);
  await user.click(modal.getByRole("button", { name: "購入する" }));
}

const mockUseSession = vi.fn((): { data: MockSessionData } => ({ data: null }));
beforeEach(() => {
  mockUseSession.mockReturnValue({ data: null });
  mockFetch.mockClear();
});

const mockPush = vi.fn();
const mockSignIn = vi.fn();
type MockSessionData = { user: Session["user"] } | null;

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

describe("ProductDetailClient", () => {
  test("商品タイトルと購入ボタンが表示される", () => {
    render(<ProductDetailClient product={product} />);
    expect(
      screen.getByRole("heading", { name: product.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "購入する" }),
    ).toBeInTheDocument();
  });

  test("購入するを押すと確認モーダルが表示される", async () => {
    const user = userEvent.setup();
    render(<ProductDetailClient product={product} />);
    await openPurchaseModal(user);
    expect(
      screen.getByRole("heading", { name: MODAL_TITLE }),
    ).toBeInTheDocument();
  });

  test("確認モーダルのキャンセルボタンを押すとモーダルが非表示になる", async () => {
    const user = userEvent.setup();
    render(<ProductDetailClient product={product} />);
    const modal = await openPurchaseModal(user);
    await user.click(modal.getByRole("button", { name: "キャンセル" }));
    expect(
      screen.queryByRole("heading", { name: MODAL_TITLE }),
    ).not.toBeInTheDocument();
  });

  test("未ログインでモーダル内の購入するを押すと signIn が callbackUrl 付きで呼ばれる", async () => {
    const user = userEvent.setup();
    render(<ProductDetailClient product={product} />);
    await clickModalPurchaseConfirm(user);

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
    await clickModalPurchaseConfirm(user);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          title: product.title,
          price: 600, // product.price + SHIPPING_FEE
          userId: "1",
        }),
      });
    });
  });
});
