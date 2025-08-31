"use client";

import { useMiniKit } from "@worldcoin/minikit-react";

export default function ConnectPage() {
  const { commandsAsync } = useMiniKit();

  const handleConnect = async () => {
    try {
      const result = await commandsAsync.walletAuth({
        statement: "Ligação de carteira ao SimplyVPN",
      });

      console.log("Wallet connected:", result);

      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/link-wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      alert("Carteira ligada com sucesso!");
    } catch (err) {
      console.error("Erro na ligação da carteira:", err);
      alert("Falhou a ligação da carteira.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Ligar Carteira</h1>
      <button
        onClick={handleConnect}
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        Ligar Wallet
      </button>
    </main>
  );
}
