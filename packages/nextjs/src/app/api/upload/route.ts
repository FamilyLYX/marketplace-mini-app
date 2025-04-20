import { NextRequest, NextResponse } from "next/server";
import { uploadImageToS3 } from "@/lib/s3";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const url = await uploadImageToS3(buffer, file.name, file.type);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: "Upload failed", details: err },
      { status: 500 },
    );
  }
}
