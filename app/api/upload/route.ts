import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
    }
    if (!allowed.has(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG and WebP images are allowed." }, { status: 415 });
    }
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be 4 MB or smaller." }, { status: 413 });
    }
    const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
    const blob = await put(`worker-photos/${crypto.randomUUID()}.${ext}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Worker photo upload failed", error);
    return NextResponse.json({ error: "Photo upload is unavailable. Check the Vercel Blob connection." }, { status: 500 });
  }
}
