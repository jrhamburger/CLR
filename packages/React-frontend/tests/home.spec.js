import { test, expect } from "@playwright/test";

test("unauthenticated user is shown on the sign-in page", async ({ page }) => {
    await page.goto("http://localhost:5173");

    await expect(page).toHaveTitle(/AuxShare/i);
    await expect(
        page.getByRole("heading", { name: "Sign in" })
    ).toBeVisible();
});