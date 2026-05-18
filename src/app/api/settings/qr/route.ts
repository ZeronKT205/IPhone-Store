import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, access } from "fs/promises";
import path from "path";

const QR_PATH = path.join(process.cwd(), "public", "qr-bank.png");
const QR_URL = "/qr-bank.png";

export async function GET() {
  try {
    await access(QR_PATH);
    return NextResponse.json({ success: true, exists: true, url: QR_URL });
  } catch {
    return NextResponse.json({ success: true, exists: false, url: null });
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ success: false, error: "Không tìm thấy file" }, { status: 400 });
  }

  const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ success: false, error: "Chỉ hỗ trợ PNG, JPG, WebP" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: "File tối đa 5MB" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  await writeFile(QR_PATH, Buffer.from(bytes));

  return NextResponse.json({ success: true, url: QR_URL });
}

export async function DELETE() {
  try {
    await unlink(QR_PATH);
  } catch {
    // File không tồn tại, bỏ qua
  }
  return NextResponse.json({ success: true });
}
