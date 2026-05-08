const {
  test,
  expect
} = require('@playwright/test');
const {
  getBaseUrl
} = require('../../support/utils/env');
const {
  dismissOverlays
} = require('../../support/utils/overlays');
const {
  skipOnProductionForTags
} = require('../../support/utils/production-guard');
const { fillQuickOrderPhoneAndRequestSms } = require('../../support/flows/quick-order');

const baseUrl = getBaseUrl();
const tags = ['express'];

skipOnProductionForTags(tags);

test('1198. quick order short phone number', async ({
  page
}) => {
  await test.step('Open product page and reach list view', async () => {
    await page.goto(`${baseUrl}omsk/products/omez-20-mg-kapsuly-kishechnorastvorimye-30-sht-61149`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await dismissOverlays(page);

    await expect(page.locator('body .good-card__title')).toHaveText(/омез/i, {
      timeout: 30000
    });
    await page.waitForLoadState('load', {
      timeout: 30000
    });
  });

  await test.step('Switch to list view and open quick order', async () => {
    await page.waitForTimeout(1000);
    const listViewLink = page.locator('body .tab-switcher__button').last();
    await expect(listViewLink).toBeAttached({
      timeout: 30000
    });
    await listViewLink.scrollIntoViewIfNeeded();
    await listViewLink.hover();
    await listViewLink.click();
    await expect(page.locator('body .search-result__card').first()).toBeVisible({
      timeout: 65000
    });

    const bookButton = page.locator('body .order-btn').first();
    await expect(bookButton).toBeVisible({
      timeout: 30000
    });
    await bookButton.scrollIntoViewIfNeeded();
    await bookButton.click();

    await expect(page.locator('.dialog .modal-container')).toBeVisible({
      timeout: 15000
    });
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
