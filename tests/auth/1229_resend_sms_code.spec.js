const {
  test,
  expect,
  getBaseUrl,
  openBasketAuthModal,
  skipOnProductionForTags,
  fillQuickOrderPhoneAndRequestSms,
} = require('../support/fixtures');

const baseUrl = getBaseUrl();
const tags = ['express'];

skipOnProductionForTags(tags);

test('1229. authorization from basket can resend sms code', async ({ page }) => {
  await test.step('Open catalog page and add first product to basket', async () => {
    await openBasketAuthModal(page, baseUrl);
  });

  await test.step('Request SMS, return to phone form, and request SMS again', async () => {
    await page.locator('#tel').click();
    await fillQuickOrderPhoneAndRequestSms(page, '1111111111');

    await expect(page.locator('.dialog .code-dialog__time-text')).toContainText('Получить код еще раз', {
      timeout: 10000,
    });

    await expect(page.locator('body .code-dialog__change-phone')).toBeVisible({ timeout: 15000 });
    await page.locator('body .code-dialog__change-phone').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('#tel')).toBeVisible({ timeout: 15000 });
    await page.locator('#tel').fill('1111111111');
    await page.locator('.dialog .auth-form__code-btn').click();

    await expect(page.locator('.dialog .code-dialog__time-text')).toContainText('Получить код еще раз', {
      timeout: 10000,
    });
  });
});
