"use client";

import { useMiniKit } from "@worldcoin/minikit-react";

export default function VerifyPage() {
  const { commandsAsync } = useMiniKit();

  const handleVerify = async () => {
    try {
      const result = await commandsAsync.verify({
        action: process.env.NEXT_PUBLIC_WORLDID_ACTION || "simply-vpn-access",
      });

      console.log("Verification success:", result);

      // Enviar proof para o backend
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/worldid/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      alert("Verificação concluída!");
    } catch (err) {
      console.error("Erro na verificação:", err);
      alert("Falhou a verificação.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Verificar Identidade</h1>
      <button
        onClick={handleVerify}
        className="px-4 py-2 bg-black text-white rounded-lg"
      >
        Verify with World ID
      </button>
    </main>
  );
}
