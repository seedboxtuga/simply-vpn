"use client";

import { MiniKit } from "@worldcoin/minikit-js";

export default function ConnectPage() {
  const handleConnect = async () => {
    try {
      const token = localStorage.getItem("simplyvpn_token");
      const nonce = localStorage.getItem("simplyvpn_nonce");
      if (!token || !nonce) {
        alert("Sessão inválida. Verifica com World ID primeiro.");
        location.assign("/verify");
        return;
      }

      // walletAuth (SIWE-like) com nonce gerado no backend
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        statement: "Ligar carteira ao SimplyVPN",
      });

      if (!finalPayload) {
        alert("Ligação da carteira não concluída.");
        return;
      }

      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth/link-wallet`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ walletAuthPayload: finalPayload }),
        }
      );

      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        alert("Falha ao ligar carteira: " + (e?.error || r.status));
        return;
      }

      alert("✅ Carteira ligada!");
      location.assign("/pay");
    } catch (err) {
      console.error(err);
      alert("Erro a ligar carteira.");
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
