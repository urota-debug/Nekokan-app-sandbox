"use client";

import { getDetailProduct } from "@/app/lib/microcms/client";
import { normalizeImageUrl } from "@/app/lib/image";
import Loading from "@/app/loading";
import { ProductType } from "@/app/types/types";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SHIPPING_FEE = 500;

const modalStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  zIndex: 1001,
};

type Props = { id: string };

export default function ProductDetailClient({ id }: Props) {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const router = useRouter();

  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const fetchedProduct = await getDetailProduct(id);
        setProduct(fetchedProduct);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const startCheckout = async (targetProduct: ProductType) => {
    setCheckoutError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: targetProduct.id,
          title: targetProduct.title,
          price: targetProduct.price + SHIPPING_FEE,
          userId: user?.id,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setCheckoutError(
          responseData.message ?? "決済セッションの作成に失敗しました",
        );
        return;
      }

      if (responseData.checkout_url) {
        if (responseData.session_id) {
          sessionStorage.setItem("stripeSessionId", responseData.session_id);
        }
        window.location.href = responseData.checkout_url;
      } else {
        setCheckoutError("チェックアウト URL が取得できませんでした");
        console.error("Invalid response data:", responseData);
      }
    } catch (err) {
      console.error("Error in startCheckout:", err);
      setCheckoutError("決済の開始中にエラーが発生しました");
    }
  };

  const handlePurchaseConfirm = () => {
    if (!user) {
      setShowModal(false);
      router.push("/api/auth/signin");
      return;
    }

    if (!product) return;

    setShowModal(false);
    startCheckout(product);
  };

  if (loading) {
    return <Loading />;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const formattedPrice = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(product.price);

  const formatContent = (content: string) => {
    return { __html: content.replace(/\n/g, "<br>") };
  };

  const imageSrc = normalizeImageUrl(product.image?.url);

  return (
    <div className="container mx-auto p-4 mt-8 mb-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {imageSrc ? (
          <div className="relative h-80 w-full">
            <Image
              src={imageSrc}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover object-center"
            />
          </div>
        ) : (
          <div className="flex h-80 w-full items-center justify-center bg-slate-200 text-slate-500">
            画像なし
          </div>
        )}
        <div className="p-4">
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              公開日: {new Date(product.createdAt).toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">
              最終更新: {new Date(product.updatedAt).toLocaleString()}
            </span>
          </div>
          <h2 className="text-3xl font-bold mt-5">{product.title}</h2>
          <div
            className="text-gray-700 mt-10 mb-20"
            dangerouslySetInnerHTML={formatContent(product.content)}
          />

          <div className="flex justify-center items-center space-x-2">
            <p className="text-3xl text-red-600">{formattedPrice}</p>
            <p className="text-gray-400">+送料500円</p>
          </div>

          {checkoutError && (
            <p className="text-center text-red-600 mt-4">{checkoutError}</p>
          )}

          <div className="flex justify-center items-center mt-14 mb-14">
            <button
              onClick={() => router.back()}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-4 text-lg"
            >
              戻る
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded text-lg"
            >
              購入する
            </button>
          </div>

          {showModal && (
            <div style={modalStyle}>
              <div style={modalContentStyle}>
                <h3 className="text-xl mb-4">この猫缶を購入しますか？</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-4"
                >
                  キャンセル
                </button>
                <button
                  onClick={handlePurchaseConfirm}
                  className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded "
                >
                  購入する
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
