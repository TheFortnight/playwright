const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1399. basket choose pharmacy skeleton live', async ({ page }) => {
  await page.goto(`${baseUrl}omsk/catalog/zheludochno-kishechnye-sredstva`, {
    waitUntil: 'load',
    timeout: 45000,
  });

  await dismissOverlays(page);

  const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
  if (await confirmCityButton.count()) {
    await confirmCityButton.click();
  }

  await expect(page.locator('body .card').first()).toBeVisible({ timeout: 35000 });

  const firstBasketButton = page.locator('.card .basket-btn').first();
  await expect(firstBasketButton).toBeVisible({ timeout: 20000 });
  const basketButtonBox = await firstBasketButton.boundingBox();
  expect(basketButtonBox).toBeTruthy();
  await page.mouse.click(
    basketButtonBox.x + basketButtonBox.width / 2,
    basketButtonBox.y + basketButtonBox.height / 2,
  );

  await expect.poll(async () => page.evaluate(() => {
    return document.querySelector('.header-top-right .basket__count')?.textContent?.trim()
      || document.querySelector('.basket-btn__container .item-counter__wrapper')?.textContent?.trim()
      || '';
  }), { timeout: 25000 }).toBe('1');

  await page.goto(`${baseUrl}basket`, {
    waitUntil: 'load',
    timeout: 30000,
  });

  await expect(page).toHaveURL(/\/basket(?:$|[?#])/, { timeout: 30000 });
  await expect(page.locator('body')).toContainText('Корзина', { timeout: 20000 });
  await expect(page.locator('.basket-items')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.basket-items .basket-item-desktop__body').first()).toBeVisible({ timeout: 20000 });

  const choosePharmacyButton = page.locator('.basket-order__order-block .order-block__btn').first();
  await expect(choosePharmacyButton).toBeVisible({ timeout: 15000 });
  await expect(choosePharmacyButton).toBeEnabled({ timeout: 30000 });
  await choosePharmacyButton.click();

  await expect(page).toHaveURL(/\/checkout\/basket\/.*\/select-pharmacy(?:$|[?#])/, { timeout: 30000 });
  await expect(page.locator('.pharmacy-offer__title')).toContainText('В какой аптеке вы заберете заказ?', { timeout: 20000 });
  await expect(page.locator('body .lottie-loader .loaded')).toBeVisible({ timeout: 45000 });
});
