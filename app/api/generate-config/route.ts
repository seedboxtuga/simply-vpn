import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { serverId } = await request.json()

    if (!serverId) {
      return NextResponse.json({ error: "Server ID is required" }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://141.144.246.4:3000"
    const apiKey = process.env.API_KEY || "your-super-secure-api-key-change-this-now"

    console.log("[v0] Server: Making API request to:", `${backendUrl}/api/generate-config`)
    console.log("[v0] Server: Server ID:", serverId)

    const response = await fetch(`${backendUrl}/api/generate-config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ serverId }),
    })

    console.log("[v0] Server: API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Server: API error response:", errorText)
      return NextResponse.json(
        { error: `Backend server error: ${response.status} - ${errorText}` },
        { status: response.status },
      )
    }

    const config = await response.text()
    console.log("[v0] Server: Received config length:", config.length)

    return new NextResponse(config, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    console.error("[v0] Server: Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
