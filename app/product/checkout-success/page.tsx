"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="container mx-auto max-w-lg p-8 mt-16 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ご購入ありがとうございます
      </h1>
      <p className="text-gray-600 mb-6">
        決済が完了しました。猫缶のお届けをお待ちください。
      </p>
      {sessionId && (
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
