"use client";

import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";

export default function VerifyPage() {
  const handleVerify = async () => {
    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: process.env.NEXT_PUBLIC_WORLDID_ACTION || "simply-vpn-access",
        verification_level: VerificationLevel.Device, // mude para Orb se quiser obrigar Orb
      });

      if (!finalPayload || finalPayload.status !== "success") {
        alert("Verificação não concluída.");
        return;
      }

      // Enviar o proof ao backend (server-side verification)
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth/worldid/verify`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: process.env.NEXT_PUBLIC_WORLDID_ACTION || "simply-vpn-access",
            proof_payload: finalPayload,
          }),
        }
      );

      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        alert("Falha na verificação server-side: " + (e?.error || r.status));
        return;
      }

      const data = await r.json();
      if (data?.token) localStorage.setItem("simplyvpn_token", data.token);
      if (data?.nonce) localStorage.setItem("simplyvpn_nonce", data.nonce);

      alert("✅ Verificado! Agora liga a tua carteira.");
      location.assign("/connect");
    } catch (err) {
      console.error(err);
      alert("Erro durante verificação.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Verificar com World ID</h1>
      <button
        onClick={handleVerify}
        className="px-4 py-2 bg-black text-white rounded-lg"
      >
        Verify with World ID
      </button>
    </main>
  );
}
