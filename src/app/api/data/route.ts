import { NextResponse } from "next/server";
import { getAppData, saveAppData } from "@/lib/kv";
import { buildDefaultAppData } from "@/lib/constants";
import type { AppData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = (await getAppData()) ?? buildDefaultAppData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(buildDefaultAppData());
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AppData;
    if (!body?.scenarios) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const dataToSave: AppData = {
      ...body,
      lastSaved: new Date().toISOString(),
    };
    await saveAppData(dataToSave);
    return NextResponse.json({ ok: true, lastSaved: dataToSave.lastSaved });
  } catch (err) {
    console.error("Save error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
