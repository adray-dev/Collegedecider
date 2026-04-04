import { Redis } from "@upstash/redis";
import type { AppData } from "./types";

const KV_KEY = "college-decider:app-data";

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
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
