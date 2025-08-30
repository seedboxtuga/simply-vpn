import { VpnServerList } from "@/components/vpn-server-list"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">VPN Servers</h1>
          <p className="text-muted-foreground text-sm">Download Wireguard configurations</p>
        </div>
        <VpnServerList />
      </div>
    </main>
  )
}
