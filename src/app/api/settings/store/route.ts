import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SETTINGS_PATH = path.join(process.cwd(), "data", "settings.json");

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
  } catch {
    return { storeName: "", storePhone: "", storeAddress: "", storeHours: "8:00 – 22:00 mỗi ngày", lowStockThreshold: 5 };
  }
}

export async function GET() {
  return NextResponse.json({ success: true, data: readSettings() });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const current = readSettings();
  const updated = { ...current, ...body };
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(updated, null, 2), "utf-8");
  return NextResponse.json({ success: true, data: updated });
}
