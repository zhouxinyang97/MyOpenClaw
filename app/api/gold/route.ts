import { NextResponse } from "next/server";

type GoldApiResponse = {
  price: number;
  timestamp?: number;
};

export async function GET() {
  try {
    const token = process.env.GOLDAPI_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "missing_token" },
        { status: 500 }
      );
    }

    const res = await fetch("https://www.goldapi.io/api/XAU/USD", {
      headers: {
        "x-access-token": token,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "failed_to_fetch" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as GoldApiResponse;

    if (!data?.price) {
      return NextResponse.json({ error: "no_gold" }, { status: 502 });
    }

    return NextResponse.json({
      symbol: "XAU",
      price: data.price,
      currency: "USD/oz",
      updatedAt: data.timestamp
        ? new Date(data.timestamp * 1000).toISOString()
        : new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "request_failed" }, { status: 502 });
  }
}
