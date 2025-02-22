import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
});

test.describe("login with client id", () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole("tab", { name: "Cookie 登录" }).click();
  });

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

test.describe("login with verification code", () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole("tab", { name: "验证码登录" }).click();
  });

  test.describe("verification code", () => {
    test("refresh", async ({ page }) => {
      const refresh = page.getByRole("button", { name: "刷新" });
      const codeInput = page.getByLabel("验证码", { exact: true });

      await expect(refresh).toBeEnabled();
      const code = await codeInput.inputValue();

      await refresh.click();
      await expect(refresh).toBeDisabled();
      await expect(refresh).toBeEnabled();
      expect(await codeInput.inputValue()).not.toBe(code);
    });
  });

  test("form validation", async ({ page }) => {
    const uidInput = page.getByLabel("用户 ID");
    const submit = page.getByRole("button", { name: "检查" });

    await submit.click();
    await expect(uidInput).toHaveAccessibleErrorMessage(/.+/);

    await uidInput.fill("0");
    await submit.click();
    await expect(uidInput).toHaveAccessibleErrorMessage(/.+/);
  });
});
