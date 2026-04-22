const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');
const { loginWithSms } = require('../support/flows/auth');

const baseUrl = getBaseUrl();

test('1342. counter changes in quick order modal', async ({ page }) => {
  await page.goto(`${baseUrl}moscow/products/tetratsiklin-100-mg-tabletki-pokrytye-obolochkoy-20-sht-73297`, {
    waitUntil: 'load',
    timeout: 30000,
  });
  await dismissOverlays(page);

  await expect(page.locator('body .good-card__title')).toBeVisible();
  await loginWithSms(page);
  await page.getByRole('button', { name: 'Списком' }).click();
  const bookButton = page.getByRole('button', { name: 'В корзину' }).first();
  await bookButton.scrollIntoViewIfNeeded();
  await bookButton.click({ force: true });

  const dialog = page.locator('body .quick-order-modal');
  await expect(dialog).toBeVisible();
  await expect(page.locator('.dialog .item-counter__change:last-child')).not.toHaveClass(/disabled/);

  const fullPrice = page.locator('body .medicines-item__price--full');
  const initialPriceText = await fullPrice.textContent();
  const initialPrice = parseFloat((initialPriceText || '').replace(/[^\d.,]/g, '').replace(',', '.'));

  await page.locator('.dialog .item-counter__change:last-child').click();
  await expect(page.locator('.dialog .item-counter__wrapper')).toHaveText('2');

  const summaryPriceText = await page.locator('body .summary__price').textContent();
  const summaryPrice = parseFloat((summaryPriceText || '').replace(/[^\d.,]/g, '').replace(',', '.'));
  expect(summaryPrice).toBeCloseTo(initialPrice * 2, 0);
});
