import { type NextRequest, NextResponse } from "next/server"

const backendUrl = process.env.BACKEND_URL || "http://141.144.246.4:3000"
const apiKey = process.env.API_KEY || "your-super-secure-api-key-change-this-now"

export async function POST(request: NextRequest) {
  try {
    const { serverId } = await request.json()

    if (!serverId) {
      return NextResponse.json({ error: "Server ID is required" }, { status: 400 })
    }

    const resp = await fetch(`${backendUrl}/api/generate-config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ serverId }),
      // don’t cache configs
      cache: "no-store",
    })

    const text = await resp.text()

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Backend server error: ${resp.status} - ${text}` },
        { status: resp.status }
      )
    }

    // Make the browser download as a file
    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="simply-vpn-${serverId}.conf"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (err: any) {
    console.error("[/api/generate-config] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
