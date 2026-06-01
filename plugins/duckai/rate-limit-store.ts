export interface RateLimitData {
  requestTimestamps: number[];
  lastRequestTime: number;
  isLimited: boolean;
  retryAfter?: number;
  lastUpdated: number;
}

export class RateLimitStore {
  constructor(private storage: any) {} // Degoog's ctx.storage

  async read(): Promise<RateLimitData | null> {
    try {
      const data = await this.storage.get("duckai_rate_limit");
      if (!data) return null;

      if (Date.now() - (data.lastUpdated || 0) > 5 * 60 * 1000) {
        return null; // Stale
      }

      return {
        requestTimestamps: data.requestTimestamps || [],
        lastRequestTime: data.lastRequestTime || 0,
        isLimited: data.isLimited || false,
        retryAfter: data.retryAfter,
        lastUpdated: data.lastUpdated || 0,
      };
    } catch (error) {
      return null;
    }
  }

  async write(data: Omit<RateLimitData, "lastUpdated">): Promise<void> {
    const storeData: RateLimitData = {
      ...data,
      lastUpdated: Date.now(),
    };
    await this.storage.set("duckai_rate_limit", storeData);
  }

  async clear(): Promise<void> {
    await this.storage.delete("duckai_rate_limit");
  }
}
