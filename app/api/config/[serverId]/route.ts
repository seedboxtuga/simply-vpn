import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { serverId: string } }) {
  try {
    const { serverId } = params

    // Get backend server URL from environment variable
    const backendUrl = process.env.BACKEND_SERVER_URL
    const apiKey = process.env.BACKEND_API_KEY

    // Check if environment variables are configured
    if (!backendUrl || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Backend server not configured. Please contact administrator.",
        },
        { status: 503 },
      )
    }

    console.log(`[v0] Generating config for server: ${serverId}`)

    // Call your backend server to generate the config with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`${backendUrl}/api/generate-config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        serverId,
        timestamp: Date.now(),
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend server error: ${response.status} - ${errorText}`)
      throw new Error(`Backend server responded with status: ${response.status}`)
    }

    const configData = await response.json()
    console.log(`[v0] Successfully generated config for ${serverId}`)

    return NextResponse.json({
      success: true,
      config: configData.config,
      filename: configData.filename || `${serverId}.conf`,
    })
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Config generation request timed out")
      return NextResponse.json(
        {
          success: false,
          error: "Request timed out. Please try again.",
        },
        { status: 408 },
      )
    }

    console.error("Config generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Backend server unavailable. Please try again later.",
      },
      { status: 503 },
    )
  }
}
