import { test, expect } from "@playwright/test";
import { appUrl } from "./helpers/environment.js";

test.use({ storageState: { cookies: [], origins: [] } });

test("unauthenticated user is shown on the sign-in page", async ({ page }) => {
    await page.goto(appUrl);

    await expect(page).toHaveTitle(/AuxShare/i);
    await expect(
        page.getByRole("heading", { name: "Sign in" })
    ).toBeVisible();
});
