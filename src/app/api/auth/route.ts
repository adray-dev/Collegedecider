import { NextResponse } from "next/server";
import { createHash } from "crypto";

const AUTH_COOKIE = "auth-token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function computeToken(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { password?: string };
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword || body.password !== sitePassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, computeToken(sitePassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}
