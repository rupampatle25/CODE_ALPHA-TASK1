import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("file:./dev.db"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters long").default("bhashasetu-local-dev-secret-key-at-least-32-chars-long!"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  TRANSLATION_PROVIDER: z.enum(["mymemory", "google", "mock"]).default("mymemory"),
  GOOGLE_TRANSLATE_API_KEY: z.string().optional().default(""),
  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(""),
  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
});

export const env = envSchema.parse(process.env);
