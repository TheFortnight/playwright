const {
  test,
  expect,
  getBaseUrl,
  openBasketAuthModal,
  fillQuickOrderPhoneAndRequestSms,
} = require('../support/fixtures');

const baseUrl = getBaseUrl();

test('1282. change phone number from basket and resend sms', async ({ page }) => {
  await test.step('Open basket auth modal', async () => {
    await openBasketAuthModal(page, baseUrl);
  });

  await test.step('Request SMS and show the code screen', async () => {
    await page.locator('#tel').click();
    await fillQuickOrderPhoneAndRequestSms(page, '0000000000');

    await expect(page.locator('.dialog .code-dialog__code-box input').first()).toBeVisible({ timeout: 45000 });
    await expect(page.locator('.dialog .code-dialog__time-text')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.dialog .code-dialog__time-text')).toContainText('Получить код еще раз', {
      timeout: 10000,
    });
  });

  await test.step('Return to the phone form and request SMS again', async () => {
    await expect(page.locator('body .code-dialog__change-phone')).toBeVisible({ timeout: 15000 });
    await page.locator('body .code-dialog__change-phone').click();

    const phoneInput = page.locator('#tel');
    const sendSmsButton = page.locator('.dialog .auth-form__code-btn');

    await expect(phoneInput).toBeVisible({ timeout: 15000 });
    await expect(phoneInput).toHaveValue('+7 (000) 000-00-00', { timeout: 15000 });
    await expect(sendSmsButton).toBeVisible({ timeout: 15000 });
    await expect(sendSmsButton).toBeEnabled({ timeout: 15000 });

    await phoneInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await phoneInput.fill('0000000000');
    await page.waitForTimeout(1000);
    await sendSmsButton.click({ force: true });

    await expect(page.locator('.dialog .code-dialog__code-box input').first()).toBeVisible({ timeout: 45000 });
    await expect(page.locator('.dialog .code-dialog__code-box input').first()).toHaveValue('', { timeout: 15000 });
    await expect(page.locator('.dialog .code-dialog__time-text')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.dialog .code-dialog__time-text')).toContainText('Получить код еще раз', {
      timeout: 10000,
    });
  });
});
