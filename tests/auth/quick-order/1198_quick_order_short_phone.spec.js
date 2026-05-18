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

test('1198. quick order short phone number', async ({
  page
}) => {
  await test.step('Open quick order booking modal from product page', async () => {
    await openQuickOrderBookingModalFromProductPage(page, { baseUrl });
  });

  await test.step('Validate short phone error and active input', async () => {
    await page.locator('#tel').click();
    await page.locator('#tel').fill('00000000');
    await expect(page.locator('#tel')).toBeFocused();
    await expect.poll(async () => page.locator('#tel').evaluate((input) => input.selectionStart)).toBe(15);
    await expect.poll(async () => page.locator('#tel').evaluate((input) => input.selectionEnd)).toBe(15);

    await fillQuickOrderPhoneAndRequestSms(page, '00000000');

    const phoneError = page.locator('.dialog .form-group__label');
    await expect(phoneError).toHaveText('Введите номер полностью', {
      timeout: 5000
    });
  });
});
