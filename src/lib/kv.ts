import { Redis } from "@upstash/redis";
import type { AppData, AllSessionsData } from "./types";

const KV_KEY = "college-decider:app-data";

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function getAppData(): Promise<AppData | null> {
  try {
    const redis = getRedis();
    return await redis.get<AppData>(KV_KEY);
  } catch {
    return null;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  const redis = getRedis();
  await redis.set(KV_KEY, data);
}

const SESSIONS_KEY = "college-decider:sessions";

export async function getAllSessionsData(): Promise<AllSessionsData | null> {
  try {
    const redis = getRedis();
    return await redis.get<AllSessionsData>(SESSIONS_KEY);
  } catch {
    return null;
  }
}

export async function saveAllSessionsData(data: AllSessionsData): Promise<void> {
  const redis = getRedis();
  await redis.set(SESSIONS_KEY, data);
}
