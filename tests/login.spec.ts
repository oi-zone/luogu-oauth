import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
});

test.describe("login with client id", () => {
  test.describe("form validation", () => {
    test("uid", async ({ page }) => {
      const uidInput = page.getByLabel("用户 ID");
      const submit = page.getByRole("button", { name: "登录" });

      await submit.click();
      await expect(uidInput).toHaveAccessibleErrorMessage(/.+/);

      await uidInput.fill("0");
      await submit.click();
      await expect(uidInput).toHaveAccessibleErrorMessage(/.+/);

      await uidInput.fill("1");
      await submit.click();
      await expect(uidInput).toHaveAccessibleErrorMessage("");
    });

    test("client id", async ({ page }) => {
      const clientIdInput = page.getByLabel("Client ID");
      const submit = page.getByRole("button", { name: "登录" });

      await submit.click();
      await expect(clientIdInput).toHaveAccessibleErrorMessage(/.+/);

      await clientIdInput.fill("0");
      await submit.click();
      await expect(clientIdInput).toHaveAccessibleErrorMessage(/.+/);

      await clientIdInput.fill("0".repeat(40));
      await submit.click();
      await expect(clientIdInput).toHaveAccessibleErrorMessage("");
    });
  });
});
