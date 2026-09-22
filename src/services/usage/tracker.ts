import { db } from "@/lib/db";

export function getCurrentBillingMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export async function getUserUsageThisMonth(userId: string): Promise<number> {
  const billingMonth = getCurrentBillingMonth();
  const records = await db.usageRecord.aggregate({
    where: {
      userId,
      billingMonth,
    },
    _sum: {
      unitsUsed: true,
    },
  });

  return records._sum.unitsUsed || 0;
}

export async function checkUserQuota(
  userId: string,
  requestedChars: number
): Promise<{ allowed: boolean; currentUsage: number; limit: number; planName: string }> {
  // Find active subscription and plan
  const sub = await db.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { plan: true },
  });

  const limit = sub?.plan?.monthlyCharLimit || 5000;
  const planName = sub?.plan?.name || "Free Starter";
  const currentUsage = await getUserUsageThisMonth(userId);

  if (currentUsage + requestedChars > limit) {
    return {
      allowed: false,
      currentUsage,
      limit,
      planName,
    };
  }

  return {
    allowed: true,
    currentUsage,
    limit,
    planName,
  };
}

export async function recordUsage(
  userId: string,
  unitsUsed: number,
  operationType: "TRANSLATE" | "BUSINESS_ASSISTANT" = "TRANSLATE"
) {
  const billingMonth = getCurrentBillingMonth();
  return db.usageRecord.create({
    data: {
      userId,
      operationType,
      unitsUsed,
      billingMonth,
    },
  });
}
