"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Wifi, WifiOff, AlertCircle } from "lucide-react"
import { DownloadBtn } from "./download-btn"


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
    id: "ru-1",
    country: "Russia",
    flag: "🇷🇺",
    city: "Moscow",
    status: "online",
    ping: 52,
    load: 34,
  },
]

export function VpnServerList() {
  const [servers] = useState<VpnServer[]>(DEMO_SERVERS)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async (serverId: string, country: string) => {
    setDownloading(serverId)
    setError(null)

    try {
      console.log("[v0] Making internal API request for server:", serverId)

      const response = await fetch("/api/generate-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serverId }),
      })

      console.log("[v0] Internal API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.log("[v0] Internal API error:", errorData)
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const config = await response.text()
      console.log("[v0] Received config length:", config.length)

      const filename = `simply-vpn-${serverId}.conf`

      const blob = new Blob([config], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log("[v0] Config downloaded successfully as:", filename)
    } catch (err) {
      console.error("[v0] Download error:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(`Failed to generate config: ${errorMessage}`)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
                  Generating…
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
