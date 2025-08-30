import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get backend server URL from environment variable
    const backendUrl = process.env.BACKEND_SERVER_URL
    const apiKey = process.env.BACKEND_API_KEY

    // Check if environment variables are configured
    if (!backendUrl) {
      console.warn("BACKEND_SERVER_URL not configured, using fallback data")
      return getFallbackServers()
    }

    if (!apiKey) {
      console.warn("BACKEND_API_KEY not configured, using fallback data")
      return getFallbackServers()
    }

    console.log(`[v0] Attempting to connect to backend: ${backendUrl}`)

    // Fetch server status from your backend with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`${backendUrl}/api/servers/status`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      // Cache for 30 seconds to avoid overwhelming backend
      next: { revalidate: 30 },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`Backend responded with status: ${response.status}`)
      return getFallbackServers()
    }

    const data = await response.json()
    console.log(`[v0] Successfully fetched ${data.servers?.length || 0} servers from backend`)

    return NextResponse.json({
      success: true,
      servers: data.servers || [],
    })
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Backend request timed out")
    } else {
      console.error("Server status fetch error:", error.message)
    }

    return getFallbackServers()
  }
}

function getFallbackServers() {
  console.log("[v0] Using fallback server data")
  return NextResponse.json({
    success: true,
    servers: [
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
    ],
  })
}
