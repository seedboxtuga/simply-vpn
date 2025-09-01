"use client";

import { MiniKit, Tokens, tokenToDecimals } from "@worldcoin/minikit-js";

export default function PayPage() {
  const handlePay = async () => {
    try {
      const token = localStorage.getItem("simplyvpn_token");
      if (!token) {
        alert("Sessão inválida. Verifica e liga a carteira primeiro.");
        location.assign("/verify");
        return;
      }

      const amountStr =
        (process.env.NEXT_PUBLIC_PRICE_USDC as string) || "10";

      // inicia ordem no backend (opcional, para referência de pedido/price)
      const initRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/billing/initiate`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: amountStr, token: "USDC" }),
        }
      );
      if (!initRes.ok) throw new Error("Falhou a iniciar pagamento");
      const { id } = await initRes.json();

      // abre UI de pagamento no World App
      const { finalPayload } = await MiniKit.commandsAsync.pay({
        reference: id, // referência opcional, útil para conciliação
        to: process.env.NEXT_PUBLIC_MERCHANT_WALLET!,
        tokens: [
          {
            symbol: Tokens.USDC,
            token_amount: tokenToDecimals(Number(amountStr), Tokens.USDC).toString(),
          },
        ],
        description: `SimplyVPN access - ${id}`,
      });

      // envia txHash ao backend para validação on-chain
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/payments/confirm`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reference: id,
          token: "USDC",
          txHash: (finalPayload as any)?.txHash || (finalPayload as any)?.transactionHash,
        }),
      });

      alert("✅ Pagamento enviado! A subscrição será ativada após confirmação.");
      location.assign("/servers"); // quando implementares esta página
    } catch (err) {
      console.error(err);
      alert("Erro no pagamento.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Pagamento</h1>
      <p className="mb-2">Plano: <b>{process.env.NEXT_PUBLIC_PRICE_USDC || "10"} USDC</b></p>
      <button
        onClick={handlePay}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Pagar Subscrição
      </button>
    </main>
  );
}
