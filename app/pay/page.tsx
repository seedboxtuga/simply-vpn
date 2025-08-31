"use client";

import { useMiniKit } from "@worldcoin/minikit-react";

export default function PayPage() {
  const { commandsAsync } = useMiniKit();

  const handlePay = async () => {
    try {
      // pede ao backend para iniciar pagamento
      const initRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/billing/initiate`,
        { method: "POST" }
      );
      const { amount } = await initRes.json();

      const result = await commandsAsync.pay({
        to: process.env.NEXT_PUBLIC_MERCHANT_WALLET!,
        tokens: [
          {
            id: "usdc",
            amount: amount || process.env.NEXT_PUBLIC_PRICE_USDC || "10",
          },
        ],
      });

      console.log("Pagamento enviado:", result);

      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/payments/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      alert("Pagamento concluído!");
    } catch (err) {
      console.error("Erro no pagamento:", err);
      alert("Falhou o pagamento.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Pagamento</h1>
      <button
        onClick={handlePay}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Pagar Subscrição
      </button>
    </main>
  );
}
