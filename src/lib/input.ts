import { MAX_RUB_PER_SEC } from "./config";

/** 초당 문지름 제한. 1초치(12번)까지 모아 둘 수 있는 토큰 통. */
export type RubBucket = { tokens: number; at: number };

export function newBucket(now: number): RubBucket {
  return { tokens: MAX_RUB_PER_SEC, at: now };
}

/** want번 문지르려 할 때 실제로 인정되는 횟수. bucket은 제자리에서 갱신된다. */
export function takeRubs(bucket: RubBucket, want: number, now: number): number {
  const elapsed = Math.max(0, now - bucket.at) / 1000;
  bucket.tokens = Math.min(MAX_RUB_PER_SEC, bucket.tokens + elapsed * MAX_RUB_PER_SEC);
  bucket.at = now;
  const n = Math.min(want, Math.floor(bucket.tokens));
  bucket.tokens -= n;
  return n;
}
