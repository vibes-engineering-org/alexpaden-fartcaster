import { NextResponse } from "next/server";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://localhost:3000";
  
  const accountAssociation = {
    header: "eyJmaWQiOjg2OTk5OSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDc2ZDUwQjBFMTQ3OWE5QmEyYkQ5MzVGMUU5YTI3QzBjNjQ5QzhDMTIifQ",
    payload: "eyJkb21haW4iOiJhbGV4cGFkZW4tZmFydGNhc3Rlci52ZXJjZWwuYXBwIn0",
    signature: "MHhjYzA3NDlhZWZlMzA5YzFmNWM2NzZhZDZiNDVlMDhkZjg1MjIyOGUxYTMwYWI4NWY2ZTAxN2ViNGZhNDkyMWMxMmJhNzNkYTgyODk5ZTQ3ZjUxNmU3MDRlMTRiM2NlOGUyMWZjYWIyYzgxMDIyY2Q2NjRmZTZiN2ZjYmI0ZDI5YjFj"
  };

  const frame = {
    version: "1",
    name: "FartCaster",
    iconUrl: `${appUrl}/icon.png`,
    homeUrl: appUrl,
    imageUrl: `${appUrl}/og.png`,
    buttonTitle: "Open",
    webhookUrl: `${appUrl}/api/webhook`,
    splashImageUrl: `${appUrl}/splash.png`,
    splashBackgroundColor: "#555555",
    primaryCategory: "entertainment" as const,
    tags: ["fart", "fun", "social", "memes", "prank"]
  };

  return NextResponse.json({
    accountAssociation,
    frame
  });
}