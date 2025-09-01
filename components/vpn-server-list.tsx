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

const DEMO_SERVERS: VpnServer[] = [
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
    ping: 78,
    load: 67,
  },
  {
    id: "de-1",
    country: "Germany",
    flag: "🇩🇪",
    city: "Frankfurt",
    status: "online",
    ping: 32,
    load: 41,
  },
  {
    id: "ru-1",
    country: "Russia",
    flag: "🇷🇺",
    city: "Moscow",
    status: "offline",
    ping: 0,
    load: 0,
  },
]

export function VpnServerList() {
  const [servers] = useState<VpnServer[]>(DEMO_SERVERS)
  const [downloading, setDownloading] = useState<string | null>(null)

  const generateDemoConfig = (server: VpnServer) => {
    return `[Interface]
PrivateKey = ${generateRandomKey()}
Address = 10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 2}/32
DNS = 1.1.1.1, 8.8.8.8

[Peer]
PublicKey = ${generateRandomKey()}
Endpoint = ${server.city.toLowerCase()}.vpn.example.com:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25

# Generated for ${server.country} - ${server.city}
# Server ID: ${server.id}
# Status: Demo configuration`
  }

  const generateRandomKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    let result = ""
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleDownload = async (serverId: string, country: string) => {
    setDownloading(serverId)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const server = servers.find((s) => s.id === serverId)
      if (!server) throw new Error("Server not found")

      const config = generateDemoConfig(server)
      const filename = `${country.toLowerCase()}-${serverId}.conf`

      // Create and download the config file
      const blob = new Blob([config], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download error:", err)
      alert(`Failed to download config: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setDownloading(null)
    }
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
