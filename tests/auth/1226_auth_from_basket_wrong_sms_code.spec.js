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

test('1226. authorization from basket with wrong sms code', async ({ page }) => {
  await test.step('Open catalog page and add first product to basket', async () => {
    await openBasketAuthModal(page, baseUrl);
  });

  await test.step('Request SMS and verify wrong code error', async () => {
    await page.locator('#tel').click();
    await fillQuickOrderPhoneAndRequestSms(page, '1111111111');

    const codeInput = page.locator('.dialog .code-dialog__code-box input').first();
    await expect(codeInput).toBeVisible({ timeout: 45000 });
    await codeInput.click();
    await page.keyboard.type('11111');

    await expect(page.locator('.dialog .indicator__error-text')).toContainText('Неверный код', {
      timeout: 15000,
    });
  });
});
