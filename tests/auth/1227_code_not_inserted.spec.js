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

test('1227. authorization from basket keeps sms code input empty after request', async ({ page }) => {
  await test.step('Open catalog page and add first product to basket', async () => {
    await openBasketAuthModal(page, baseUrl);
  });

  await test.step('Request SMS and verify code input stays empty', async () => {
    await page.locator('#tel').click();
    await fillQuickOrderPhoneAndRequestSms(page, '1111111111');

    const codeInput = page.locator('.dialog .code-dialog__code-box input').first();
    await expect(codeInput).toBeVisible({ timeout: 45000 });
    await expect(codeInput).toHaveValue('');
  });
});
