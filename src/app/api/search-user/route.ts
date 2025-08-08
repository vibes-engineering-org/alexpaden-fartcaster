import { NextRequest, NextResponse } from "next/server";

export type FarcasterUser = {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  follower_count: number;
  following_count: number;
  power_badge?: boolean;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/search?q=${encodeURIComponent(username)}&limit=5`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          api_key: apiKey,
        },
      },
    );

    if (!response.ok) {
      console.error(`Neynar API error: ${response.status}`);
      return NextResponse.json(
        { error: "Failed to search user" },
        { status: response.status },
      );
    }

    const data = await response.json();
    const users: FarcasterUser[] = data.result?.users || [];

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find exact match or return the first result
    const exactMatch = users.find(
      (user: FarcasterUser) =>
        user.username.toLowerCase() === username.toLowerCase(),
    );

    const selectedUser = exactMatch || users[0];

    // Cache successful responses for 1 day on Vercel Edge
    const cachedResponse = NextResponse.json({ user: selectedUser });
    cachedResponse.headers.set(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=60",
    );
    return cachedResponse;
  } catch (error) {
    console.error("Error in search-user API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
