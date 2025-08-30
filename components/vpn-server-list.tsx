"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Wifi, WifiOff } from "lucide-react"

interface VpnServer {
  id: string
  country: string
  flag: string
  city: string
  status: "online" | "offline"
  ping: number
  load: number
}

const servers: VpnServer[] = [
  {
    id: "fi-1",
    country: "Finland",
    flag: "🇫🇮",
    city: "Helsinki",
    status: "online",
    ping: 45,
    load: 23,
  },
  {
    id: "hk-1",
    country: "Hong Kong",
    flag: "🇭🇰",
    city: "Central",
    status: "online",
    ping: 120,
    load: 67,
  },
  {
    id: "de-1",
    country: "Germany",
    flag: "🇩🇪",
    city: "Frankfurt",
    status: "online",
    ping: 32,
    load: 45,
  },
  {
    id: "ru-1",
    country: "Russia",
    flag: "🇷🇺",
    city: "Moscow",
    status: "offline",
    ping: 89,
    load: 0,
  },
]

export function VpnServerList() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (serverId: string, country: string) => {
    setDownloading(serverId)

    // Simulate download process
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Create and download the config file
    const configContent = `[Interface]
PrivateKey = YOUR_PRIVATE_KEY
Address = 10.0.0.2/32
DNS = 1.1.1.1

[Peer]
PublicKey = SERVER_PUBLIC_KEY_${serverId.toUpperCase()}
Endpoint = ${serverId}.vpn.example.com:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`

    const blob = new Blob([configContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${country.toLowerCase()}-${serverId}.conf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setDownloading(null)
  }

  return (
    <div className="space-y-4">
      {servers.map((server) => (
        <Card key={server.id} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{server.flag}</span>
                <div>
                  <h3 className="font-semibold text-card-foreground">{server.country}</h3>
                  <p className="text-sm text-muted-foreground">{server.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {server.status === "online" ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={server.status === "online" ? "default" : "destructive"} className="text-xs">
                  {server.status}
                </Badge>
              </div>
            </div>

            {server.status === "online" && (
              <div className="flex justify-between text-xs text-muted-foreground mb-4">
                <span>Ping: {server.ping}ms</span>
                <span>Load: {server.load}%</span>
              </div>
            )}

            <Button
              onClick={() => handleDownload(server.id, server.country)}
              disabled={server.status === "offline" || downloading === server.id}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              size="sm"
            >
              {downloading === server.id ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Downloading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Config
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
