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

test('1196. quick order empty phone number', async ({
  page
}) => {
  await test.step('Search for a product and open offers link', async () => {
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
