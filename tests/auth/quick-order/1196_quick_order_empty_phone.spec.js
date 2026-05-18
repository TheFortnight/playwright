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

test('1196. quick order empty phone number', async ({
  page
}) => {
  await test.step('Open quick order booking modal from product page', async () => {
    await openQuickOrderBookingModalFromProductPage(page, { baseUrl });
  });

  await test.step('Validate empty phone error', async () => {
    await fillQuickOrderPhoneAndRequestSms(page, '');

    const phoneError = page.locator('.dialog .form-group__label');
    await expect(phoneError).toHaveText('Введите номер телефона', {
      timeout: 5000
    });

    await page.locator('#tel').click();
    await expect(phoneError).toContainText('Номер телефона');
  });
});
