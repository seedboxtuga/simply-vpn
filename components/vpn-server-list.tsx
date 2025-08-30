"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Wifi, WifiOff, RefreshCw } from "lucide-react"

interface VpnServer {
  id: string
  country: string
  flag: string
  city: string
  status: "online" | "offline"
  ping: number
  load: number
}

export function VpnServerList() {
  const [servers, setServers] = useState<VpnServer[]>([])
  const [downloading, setDownloading] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServers = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Fetching server data...")
      const response = await fetch("/api/servers")
      const data = await response.json()

      if (data.success) {
        setServers(data.servers)
        console.log(`[v0] Loaded ${data.servers.length} servers`)
      } else {
        throw new Error("Failed to fetch server data")
      }
    } catch (err) {
      console.error("Error fetching servers:", err)
      setError("Backend server unavailable - showing offline status")

      // Fallback to static data
      setServers([
        {
          id: "fi-1",
          country: "Finland",
          flag: "🇫🇮",
          city: "Helsinki",
          status: "offline",
          ping: 0,
          load: 0,
        },
        {
          id: "hk-1",
          country: "Hong Kong",
          flag: "🇭🇰",
          city: "Central",
          status: "offline",
          ping: 0,
          load: 0,
        },
        {
          id: "de-1",
          country: "Germany",
          flag: "🇩🇪",
          city: "Frankfurt",
          status: "offline",
          ping: 0,
          load: 0,
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
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServers()

    // Refresh server status every 60 seconds
    const interval = setInterval(fetchServers, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleDownload = async (serverId: string, country: string) => {
    setDownloading(serverId)

    try {
      console.log(`[v0] Requesting config for ${serverId}`)
      const response = await fetch(`/api/config/${serverId}`, {
        method: "POST",
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to generate config")
      }

      console.log(`[v0] Config generated successfully for ${serverId}`)

      // Create and download the config file
      const blob = new Blob([data.config], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = data.filename || `${country.toLowerCase()}-${serverId}.conf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download error:", err)
      alert(`Failed to download config: ${err.message}`)
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading servers...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={fetchServers} variant="outline" size="sm" className="h-8 bg-transparent">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
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
