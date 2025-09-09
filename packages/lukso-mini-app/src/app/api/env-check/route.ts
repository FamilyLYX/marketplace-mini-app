import { NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    FIREBASE_API_KEY: !!process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: !!process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: !!process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: !!process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: !!process.env.FIREBASE_APP_ID,
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    status: "success",
    environment: envVars,
    hasAllRequired: envVars.FIREBASE_API_KEY && envVars.FIREBASE_PROJECT_ID,
  });
}
