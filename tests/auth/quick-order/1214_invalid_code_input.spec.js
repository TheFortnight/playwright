const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../../support/utils/env');
const { skipOnProductionForTags } = require('../../support/utils/production-guard');
const { openQuickOrderBookingModalFromProductPage } = require('../../support/flows/quick-order');
const { fillQuickOrderPhoneAndRequestSms } = require('../../support/flows/quick-order');

const baseUrl = getBaseUrl();
const tags = ['express'];

skipOnProductionForTags(tags);

test('1214. quick order invalid code input', async ({ page }) => {
  await test.step('Open quick order booking modal from product page', async () => {
    await openQuickOrderBookingModalFromProductPage(page, { baseUrl });
  });

  await test.step('Request SMS code and type invalid symbols', async () => {
    const phoneInput = page.locator('#tel');
    await phoneInput.click();
    await fillQuickOrderPhoneAndRequestSms(page, '0000000000');

    const codeInput = page.locator('.dialog .code-dialog__code-box input').first();
    await expect(codeInput).toBeVisible({ timeout: 45000 });
    await codeInput.click();
    await page.keyboard.type('ы;%=,?DF');

    await expect(codeInput).toHaveValue('', { timeout: 15000 });
    await expect(page.locator('.dialog .indicator__error-text')).toHaveCount(0);
  });
});
