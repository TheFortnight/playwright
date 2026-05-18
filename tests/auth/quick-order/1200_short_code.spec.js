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

test('1200. insert short sms code', async ({ page }) => {
  await test.step('Open quick order booking modal from product page', async () => {
    await openQuickOrderBookingModalFromProductPage(page, { baseUrl });
  });

  await test.step('Enter short SMS code and verify no auth state', async () => {
    await page.locator('#tel').click();
    await fillQuickOrderPhoneAndRequestSms(page, '0000000000');

    const codeInput = page.locator('.dialog .code-dialog__code-box input').first();
    await expect(codeInput).toBeVisible({ timeout: 45000 });
    await codeInput.click();
    await page.keyboard.type('0000');

    await expect(codeInput).toHaveValue(/0/, { timeout: 15000 });
    await expect(page.locator('.dialog .quick-order-modal__btn:nth-child(2)')).toHaveCount(0);
    await expect(page.locator('.dialog .indicator__error-text')).toHaveCount(0);
  });
});
