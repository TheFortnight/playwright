const { expect } = require('@playwright/test');
const { getSmsCode } = require('../utils/sms-code');

async function loginWithSms(page, phone = '0000000000') {
  const signInButton = page.getByRole('button', { name: 'Войти' }).first();
  await expect(signInButton).toBeVisible({ timeout: 15000 });
  await signInButton.click();
  await expect(page.locator('body .dialog')).toBeVisible({ timeout: 35000 });
  await page.locator('#tel').fill(phone);
  await page.locator('body .agreement-wrapper .agreement-item:nth-child(2) .custom-checkbox').click();
  await page.locator('body .agreement-wrapper .agreement-item:nth-child(3) .custom-checkbox').click();
  await page.locator('.dialog .auth-form__code-btn').click();
  const codeInput = page.locator('.dialog .code-dialog__code-box input').first();
  await expect(codeInput).toBeVisible({ timeout: 45000 });
  await codeInput.click();
  await page.keyboard.type(getSmsCode());
  await expect(page.locator('body .dialog')).toBeHidden({ timeout: 45000 });
}

module.exports = { loginWithSms };
