const {
  test,
  expect,
  getBaseUrl,
  skipOnProductionForTags,
  openQuickOrderBookingModalFromProductPage,
} = require('../../support/fixtures');

const baseUrl = getBaseUrl();
const tags = ['express'];

skipOnProductionForTags(tags);

test('1213. quick order invalid phone input', async ({ page }) => {
  await test.step('Open quick order booking modal from product page', async () => {
    await openQuickOrderBookingModalFromProductPage(page, { baseUrl });
  });

  await test.step('Type invalid phone symbols and keep the mask unchanged', async () => {
    const phoneInput = page.locator('#tel');
    await phoneInput.click();
    await page.keyboard.type('ы;%=,?DF');

    await expect(phoneInput).toHaveValue('+7 (___) ___-__-__');
  });
});
