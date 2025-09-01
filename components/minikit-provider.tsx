"use client";

import { useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

export function MiniKitProvider({ children }: { children: React.ReactNode }) {
  // Instala o MiniKit quando a app monta (apenas em ambiente World App; fora dele, ignora)
  useEffect(() => {
    try {
      // Isto prepara o MiniKit no WebView do World App
      // Fora do World App, pode lançar warning (normal)
      // @ts-ignore - algumas versões não tipam install()
      MiniKit.install?.();
    } catch (e) {
      console.warn("MiniKit.install() não disponível fora do World App:", e);
    }
  }, []);

  return <>{children}</>;
}
