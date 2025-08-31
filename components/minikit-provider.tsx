"use client";

import { MiniKitProvider as Provider } from "@worldcoin/minikit-react";

export function MiniKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      config={{
        appId: process.env.NEXT_PUBLIC_WORLDID_ACTION || "simply-vpn-access",
      }}
    >
      {children}
    </Provider>
  );
}
