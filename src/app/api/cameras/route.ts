import { NextResponse } from "next/server";

// Camera enumeration must happen client-side (requires MediaDevices API in browser).
// This endpoint returns a hint to the client to enumerate cameras.
export async function GET() {
  return NextResponse.json({
    data: {
      message: "Camera enumeration is performed client-side via navigator.mediaDevices.enumerateDevices()",
    },
  });
}
