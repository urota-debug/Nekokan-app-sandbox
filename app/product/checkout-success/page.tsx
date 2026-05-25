"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId =
    searchParams.get("session_id") ??
    (typeof window !== "undefined"
      ? sessionStorage.getItem("stripeSessionId")
      : null);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setErrorMessage("セッション ID が見つかりません");
      return;
    }

    const savePurchase = async () => {
      try {
        const response = await fetch("/api/checkout/success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setErrorMessage(data.message ?? "購入履歴の保存に失敗しました");
          return;
        }

        sessionStorage.removeItem("stripeSessionId");
        setStatus("success");
      } catch {
        setStatus("error");
        setErrorMessage("購入履歴の保存中にエラーが発生しました");
      }
    };

    savePurchase();
  }, [sessionId]);

  return (
    <div className="container mx-auto max-w-lg p-8 mt-16 text-center">
      {status === "loading" && (
        <p className="text-gray-600">購入情報を保存しています...</p>
      )}

      {status === "success" && (
        <>
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            ご購入ありがとうございます
          </h1>
          <p className="text-gray-600 mb-6">
            決済が完了しました。猫缶のお届けをお待ちください。
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            エラーが発生しました
          </h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
        </>
      )}

      {sessionId && status !== "loading" && (
        <p className="text-sm text-gray-400 mb-6 break-all">
          セッション ID: {sessionId}
        </p>
      )}

      <Link
        href="/"
        className="inline-block bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded"
      >
        トップへ戻る
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">読み込み中...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
