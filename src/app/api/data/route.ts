import { NextResponse } from "next/server";
import { getAppData, getAllSessionsData, saveAllSessionsData } from "@/lib/kv";
import { buildDefaultAllSessionsData, migrateToAllSessionsData } from "@/lib/constants";
import type { AllSessionsData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Try new multi-session key first
    const sessions = await getAllSessionsData();
    if (sessions?.sessions) {
      return NextResponse.json(sessions);
    }
    // Fall back to old single-session key and migrate
    const legacy = await getAppData();
    if (legacy) {
      return NextResponse.json(migrateToAllSessionsData(legacy));
    }
    return NextResponse.json(buildDefaultAllSessionsData());
  } catch {
    return NextResponse.json(buildDefaultAllSessionsData());
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AllSessionsData;
    if (!Array.isArray(body?.sessions)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const dataToSave: AllSessionsData = {
      ...body,
      lastSaved: new Date().toISOString(),
    };
    await saveAllSessionsData(dataToSave);
    return NextResponse.json({ ok: true, lastSaved: dataToSave.lastSaved });
  } catch (err) {
    console.error("Save error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
