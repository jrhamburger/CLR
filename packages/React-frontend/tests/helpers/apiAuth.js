import { expect } from "@playwright/test";
import { requiredEnv } from "./environment.js";

export async function getAccessToken(request) {
  // Use the same public key as the browser. No admin/secret key is needed.
  const supabaseUrl = process.env.TEST_SUPABASE_URL || requiredEnv("VITE_SUPABASE_URL");
  const publicKey = process.env.TEST_SUPABASE_PUBLISHABLE_KEY
    || requiredEnv("VITE_SUPABASE_PUBLISHABLE_KEY");

  const response = await request.post(
    `${supabaseUrl.replace(/\/$/, "")}/auth/v1/token?grant_type=password`,
    {
      headers: { apikey: publicKey },
      data: {
        email: requiredEnv("TEST_USER_EMAIL"),
        password: requiredEnv("TEST_USER_PASSWORD"),
      },
    }
  );

  expect(response.status(), "The test account must be able to sign in to Supabase.")
    .toBe(200);
  const session = await response.json();
  expect(typeof session.access_token).toBe("string");
  expect(session.access_token.length).toBeGreaterThan(0);
  return session.access_token;
}
