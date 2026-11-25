"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function PaymentVerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [refId, setRefId] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const authority = params.get("Authority");
    const zarinStatus = params.get("Status");

    if (zarinStatus !== "OK" || !orderId || !authority) {
      setStatus("failed");
      return;
    }

    fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, authority }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setRefId(d.refId);
          setStatus("success");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, []);

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-[2rem] p-8 text-center space-y-4 shadow-xl">
        {status === "loading" && <p className="font-bold">در حال تایید تراکنش بانکی...</p>}
        {status === "success" && (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-black">✓</div>
            <h1 className="text-xl font-black">پرداخت با موفقیت انجام شد</h1>
            <p className="text-xs text-muted">کد رهگیری تراکنش: <strong className="text-charcoal">{refId}</strong></p>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-2xl font-black">✕</div>
            <h1 className="text-xl font-black">پرداخت ناموفق بود یا لغو شد</h1>
            <p className="text-xs text-muted">در صورت کسر وجه، مبلغ ظرف ۷۲ ساعت به حساب شما بازمی‌گردد.</p>
          </>
        )}
        <Link href="/" className="inline-block bg-charcoal text-cream px-6 py-3 rounded-full text-xs font-bold">
          بازگشت به فروشگاه
        </Link>
      </div>
    </div>
  );
}
