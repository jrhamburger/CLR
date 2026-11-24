import { test, expect } from "@playwright/test";

test("user can sign in with valid credentials", async ({
  page
}) => {
  await page.goto("http://localhost:5173");

  await page
    .getByPlaceholder("Email/Username")
    .fill(process.env.TEST_USER_EMAIL);

  await page
    .getByPlaceholder("Password")
    .fill(process.env.TEST_USER_PASSWORD);

  await page
    .getByRole("main")
    .getByRole("button", {
      name: "Sign In",
      exact: true
    })
    .click();

  await expect(
    page.getByRole("heading", { name: "Home" })
  ).toBeVisible();
});


