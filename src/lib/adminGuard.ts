import crypto from "crypto";
import { NextRequest } from "next/server";
import { getCurrentUser } from "./auth";

export async function isAdminAuthorized(req: NextRequest): Promise<boolean> {
  const session = await getCurrentUser();
  if (session?.role === "ADMIN") return true;

  const expected = process.env.ADMIN_API_SECRET;
  const provided = req.headers.get("x-admin-secret");
  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
