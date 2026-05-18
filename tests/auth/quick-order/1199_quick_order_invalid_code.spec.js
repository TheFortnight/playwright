const {
  test,
  expect,
  getBaseUrl,
  skipOnProductionForTags,
  openQuickOrderBookingModalFromProductPage,
  fillQuickOrderPhoneAndRequestSms,
} = require('../../support/fixtures');

const baseUrl = getBaseUrl();
const tags = ['express'];

skipOnProductionForTags(tags);

test('1199. quick order invalid code', async ({ page }) => {
  await test.step('Open quick order booking modal from product page', async () => {
    await openQuickOrderBookingModalFromProductPage(page, { baseUrl });
  });

  await test.step('Validate invalid code error', async () => {
    await page.locator('#tel').click();
    await fillQuickOrderPhoneAndRequestSms(page, '0000000000');

    const codeInput = page.locator('.dialog .code-dialog__code-box input').first();
    await expect(codeInput).toBeVisible({ timeout: 45000 });
    await codeInput.click();
    await page.keyboard.type('00000');

    await expect(page.locator('.dialog .indicator__error-text')).toHaveText('Неверный код', {
      timeout: 15000,
    });
  });
});
