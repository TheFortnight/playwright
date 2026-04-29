const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../../support/utils/env');
const { dismissOverlays } = require('../../support/utils/overlays');
const { getSmsCode } = require('../../support/utils/sms-code');
const { skipOnProductionForTags } = require('../../support/utils/production-guard');

const baseUrl = getBaseUrl();
const tags = ['express', 'test'];

skipOnProductionForTags(tags);

test('1195. quick order auth success', async ({ page }) => {
  await test.step('Open subcatalog and navigate through the first card offers', async () => {
    await page.goto(`${baseUrl}omsk/catalog/zheludochno-kishechnye-sredstva`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await dismissOverlays(page);

    const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
    if (await confirmCityButton.count()) {
      await confirmCityButton.click();
    }

    const firstCard = page.locator('body .card').first();
    await expect(firstCard).toBeVisible({ timeout: 30000 });

    const offersLink = page.locator('[id="0"] .card__pharmacy-wrapper a').first();
    await expect(offersLink).toBeVisible({ timeout: 30000 });
    await offersLink.hover();
    await offersLink.click();
    await expect(page.getByRole('heading', { name: 'Церукал, 10 мг, таблетки, 50 шт.' })).toBeVisible({ timeout: 30000 });
  });

  await test.step('Switch to list view and book from pharmacy list', async () => {
    const listTab = page.locator('body .tab-switcher__button').last();
    await expect(listTab).toBeVisible({ timeout: 30000 });
    await listTab.hover();
    await listTab.click();
    await expect(page.locator('body .search-result__card')).toBeVisible({ timeout: 65000 });

    const bookButton = page.locator('body .order-btn').first();
    await expect(bookButton).toBeVisible({ timeout: 30000 });
    await bookButton.scrollIntoViewIfNeeded();
    await bookButton.click();

    await expect(page.locator('.dialog .modal-container')).toBeVisible({ timeout: 15000 });
  });

  await test.step('Authorize by phone and SMS code', async () => {
    await page.locator('#tel').fill('0000000000');
    await page.locator('body .agreement-wrapper .agreement-item:nth-child(2) .custom-checkbox').click();
    await page.locator('body .agreement-wrapper .agreement-item:nth-child(3) .custom-checkbox').click();
    await page.locator('.dialog .auth-form__code-btn').click();

    const codeInput = page.locator('.dialog .code-dialog__code-box input').first();
    await expect(codeInput).toBeVisible({ timeout: 45000 });
    await codeInput.click();
    await page.keyboard.type(getSmsCode());
  });

  await test.step('Quick order modal shows authorized product and pharmacy data', async () => {
    await expect(page.locator('body .quick-order-modal__profile-data')).not.toHaveText('', { timeout: 45000 });
    await expect(page.locator('body .selected-pharmacy-title')).not.toHaveText('', { timeout: 45000 });
    await expect(page.locator('.quick-order-modal__body .selected-pharmacy phrm-image')).toBeVisible({ timeout: 45000 });
    await expect(page.locator('.quick-order-modal__body .selected-pharmacy .selected-pharmacy__name span')).not.toHaveText('', { timeout: 45000 });
    await expect(page.locator('.quick-order-modal__body .selected-pharmacy .selected-pharmacy__address')).not.toHaveText('', { timeout: 45000 });
    await expect(page.locator('.quick-order-modal__body .selected-pharmacy .selected-pharmacy__text')).not.toHaveText('', { timeout: 45000 });
    await expect(page.locator('.quick-order-modal__body .selected-pharmacy .selected-pharmacy__payment')).not.toHaveText('', { timeout: 45000 });

    await expect(page.locator('.quick-order-modal__body .structure-order__title')).not.toHaveText('', { timeout: 45000 });
    await expect(page.locator('.medicines-item__image .loaded')).toBeVisible({ timeout: 45000 });
    await expect(page.locator('.quick-order-modal__body .medicines-item__name')).not.toHaveText('', { timeout: 45000 });
    await expect(page.locator('.quick-order-modal__body .medicines-item__inn')).not.toHaveText('', { timeout: 45000 });
    await expect(page.locator('.quick-order-modal__body .medicines-item__manufacturer')).not.toHaveText('', { timeout: 45000 });
    await expect(page.locator('body .item-counter__wrapper')).toHaveText('1', { timeout: 45000 });
  });
});
