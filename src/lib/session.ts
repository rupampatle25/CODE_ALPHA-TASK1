import { jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "bhashasetu_session";

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bhashasetu-local-dev-secret-key-at-least-32-chars-long!"
);

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Edge-compatible session token verification using jose.
 * Can be run in Next.js Middleware without Node.js dependencies.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}
