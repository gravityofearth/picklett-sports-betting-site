import { findLineById } from "@/controller/bet";
import { signLineOdds } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    const { lineId } = await params;
    const line = await findLineById(lineId)
    const odds = JSON.parse(line.odds)
    for (let num in odds) {
      const period = odds[num]
      for (let oddsName of ["money_line", "spreads", "totals", "team_total"]) {
        if (!period[oddsName]) {
          delete period[oddsName]
          continue
        }
        if (oddsName === "money_line") {
          if (period[oddsName]["draw"] || period[oddsName]["home"] < 1.8 || period[oddsName]["away"] < 1.8) delete period[oddsName]
        } else {
          for (let point in period[oddsName]) {
            if (!period[oddsName][point]) {
              delete period[oddsName][point]
              continue
            }
            const odds_key1 = oddsName.includes("total") ? "over" : "home"
            const odds_key2 = oddsName.includes("total") ? "under" : "away"
            if (point.endsWith(".25") || point.endsWith(".75") || period[oddsName][point][odds_key1] < 1.8 || period[oddsName][point][odds_key2] < 1.8) delete period[oddsName][point]
          }
          if (Object.keys(period[oddsName]).length === 0) delete period[oddsName]
        }
      }
      if (Object.keys(period).length < 2) delete odds[num]
    }
    line.odds = JSON.stringify(odds)
    signLineOdds(line)
    return NextResponse.json({ line }, { status: 200 });
  } catch (error: any) {
    console.error("Error getting line by id:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}