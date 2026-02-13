import { clerkClient } from "@clerk/express";

// Simple in-memory cache for user metadata
// Avoids calling Clerk API on every single request
// TTL = 60 seconds — after that, fresh data is fetched
const userCache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

const getCachedUser = async (userId) => {
  const cached = userCache.get(userId);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }

  // Cache miss or expired — fetch from Clerk
  const user = await clerkClient.users.getUser(userId);
  userCache.set(userId, { user, timestamp: now });
  return user;
};

// Call this after updating user metadata so stale data isn't served
export const invalidateUserCache = (userId) => {
  userCache.delete(userId);
};

export const auth = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    const user = await getCachedUser(userId);

    const hasPremiumPlan =
      user.privateMetadata?.subscription === "Premium" ||
      user.privateMetadata?.plan === "Premium";

    if (!hasPremiumPlan && user.privateMetadata?.free_usage !== undefined) {
      req.free_usage = user.privateMetadata.free_usage;
    } else if (!hasPremiumPlan) {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: 0 },
      });
      invalidateUserCache(userId);
      req.free_usage = 0;
    } else {
      req.free_usage = 0;
    }

    req.plan = hasPremiumPlan ? "Premium" : "free";
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};
