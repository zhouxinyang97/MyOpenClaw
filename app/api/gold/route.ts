import { NextResponse } from "next/server";

type MetalsLiveSpot = [string, number][];

export async function GET() {
  try {
    const res = await fetch("https://api.metals.live/v1/spot", {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "failed_to_fetch" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as MetalsLiveSpot;
    const gold = data.find((item) => item[0] === "gold");

    if (!gold) {
      return NextResponse.json({ error: "no_gold" }, { status: 502 });
    }

    return NextResponse.json({
      symbol: "XAU",
      price: gold[1],
      currency: "USD/oz",
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "request_failed" }, { status: 502 });
  }
}
