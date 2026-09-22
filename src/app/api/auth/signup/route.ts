import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Get default Free plan
    const freePlan = await db.plan.findUnique({ where: { slug: "free" } });

    const newUser = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: "USER",
        subscriptions: freePlan
          ? {
              create: {
                planId: freePlan.id,
                provider: "MANUAL",
                status: "ACTIVE",
              },
            }
          : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Create session token and set cookie
    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    setSessionCookie(token);

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "Account created successfully.",
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
