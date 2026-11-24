import { test, expect } from "@playwright/test";
import { appUrl, requiredEnv } from "./helpers/environment.js";

test.use({ storageState: { cookies: [], origins: [] } });

test("user can sign in with valid credentials", async ({
  page
}) => {
  await page.goto(appUrl);

  await page
    .getByPlaceholder("Email/Username")
    .fill(requiredEnv("TEST_USER_EMAIL"));

  await page
    .getByPlaceholder("Password")
    .fill(requiredEnv("TEST_USER_PASSWORD"));

  await page
    .getByRole("main")
    .getByRole("button", {
      name: "Sign In",
      exact: true
    })
    .click();

  await expect(
    page.getByRole("heading", { name: "Home" })
  ).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("button", { name: "Sign out", exact: true }))
    .toBeVisible();
});

test("invalid credentials show an error and keep the user signed out", async ({ page }) => {
  await page.goto(appUrl);

  const signIn = page.getByRole("main");
  const password = requiredEnv("TEST_USER_PASSWORD");
  // Change the first character so this always differs from the valid password.
  const wrongPassword = password[0] === "x"
    ? `y${password.slice(1)}`
    : `x${password.slice(1)}`;

  await signIn.getByPlaceholder("Email/Username").fill(requiredEnv("TEST_USER_EMAIL"));
  await signIn.getByPlaceholder("Password").fill(wrongPassword);
  await signIn.getByRole("button", { name: "Sign In", exact: true }).click();

  await expect(signIn.getByText(/invalid login credentials/i))
    .toBeVisible({ timeout: 15000 });
  await expect(signIn.getByRole("heading", { name: "Sign in", exact: true }))
    .toBeVisible();
  await expect(page.getByRole("heading", { name: "Home", exact: true }))
    .toHaveCount(0);
  await expect(page.getByRole("button", { name: "Sign out", exact: true }))
    .toHaveCount(0);
});


