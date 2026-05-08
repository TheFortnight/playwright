const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../../support/utils/env');
const { dismissOverlays } = require('../../support/utils/overlays');
const { skipOnProductionForTags } = require('../../support/utils/production-guard');
const { fillQuickOrderPhoneAndRequestSms } = require('../../support/flows/quick-order');

const baseUrl = getBaseUrl();
const tags = ['express'];

skipOnProductionForTags(tags);

test('1199. quick order invalid code', async ({ page }) => {
  await test.step('Open product page and reach list view', async () => {
    await page.goto(`${baseUrl}omsk/products/omez-20-mg-kapsuly-kishechnorastvorimye-30-sht-61149`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await dismissOverlays(page);

    await expect(page.locator('body .good-card__title')).toHaveText(/омез/i, { timeout: 30000 });
    await page.waitForLoadState('load', { timeout: 30000 });
  });

  await test.step('Switch to list view and open quick order', async () => {
    await page.waitForTimeout(1000);
    const listViewLink = page.locator('body .tab-switcher__button').last();
    await expect(listViewLink).toBeAttached({ timeout: 30000 });
    await listViewLink.scrollIntoViewIfNeeded();
    await listViewLink.hover();
    await listViewLink.click();
    await expect(page.locator('body .search-result__card').first()).toBeVisible({ timeout: 65000 });

    const bookButton = page.locator('body .order-btn').first();
    await expect(bookButton).toBeVisible({ timeout: 30000 });
    await bookButton.scrollIntoViewIfNeeded();
    await bookButton.click();

    await expect(page.locator('.dialog .modal-container')).toBeVisible({ timeout: 15000 });
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
