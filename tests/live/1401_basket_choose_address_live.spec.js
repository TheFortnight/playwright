const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1401. basket choose address live', async ({ page }) => {
  await test.step('Open catalog and add one product to basket', async () => {
    await page.goto(`${baseUrl}omsk/catalog/zheludochno-kishechnye-sredstva`, {
      waitUntil: 'load',
      timeout: 45000,
    });

    await dismissOverlays(page);

    await expect(page.locator('body .card').first()).toBeVisible({ timeout: 35000 });

    const firstBasketButton = page.locator('.card .basket-btn').first();
    await expect(firstBasketButton).toBeVisible({ timeout: 20000 });

    const basketButtonBox = await firstBasketButton.boundingBox();
    expect(basketButtonBox).toBeTruthy();

    const addToBasketResponse = page.waitForResponse((response) => {
      return response.request().method() === 'POST' && /\/api\/v2\/carts\/[^/]+\/goods(?:\?.*)?$/.test(response.url());
    });

    await page.mouse.click(
      basketButtonBox.x + basketButtonBox.width / 2,
      basketButtonBox.y + basketButtonBox.height / 2,
    );

    await addToBasketResponse;

    await expect.poll(async () => page.evaluate(() => {
      return document.querySelector('.header-top-right .basket__count')?.textContent?.trim()
        || document.querySelector('.basket-btn__container .item-counter__wrapper')?.textContent?.trim()
        || '';
    }), { timeout: 25000 }).toBe('1');
  });

  await test.step('Open basket and verify one item in quantity 1', async () => {
    await page.locator('.header-top-right a.mini-basket__label').click({ timeout: 15000 });
    await page.waitForURL(/\/basket(?:$|[?#])/, { timeout: 30000 });

    await expect(page).toHaveURL(/\/basket(?:$|[?#])/, { timeout: 30000 });
    await expect(page.locator('body')).toContainText('Корзина', { timeout: 20000 });
    await expect(page.locator('.basket-items')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.basket-items .basket-item-desktop__body').first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('body')).toContainText('В вашем заказе 1 товар', { timeout: 20000 });
    await expect(page.locator('.basket-items .basket-item-desktop__body .item-counter__wrapper').first()).toHaveText('1', { timeout: 20000 });

    const choosePharmacyButton = page.locator('.basket-order__order-block .order-block__btn').first();
    await expect(choosePharmacyButton).toBeVisible({ timeout: 15000 });
    await expect(choosePharmacyButton).toBeEnabled({ timeout: 30000 });
    await choosePharmacyButton.click();

    await expect(page).toHaveURL(/\/checkout\/basket\/.*\/select-pharmacy(?:$|[?#])/, { timeout: 30000 });
    await expect(page.locator('.pharmacy-offer__title')).toContainText('В какой аптеке вы заберете заказ?', { timeout: 20000 });
    await expect(page.locator('body .location__change')).toContainText('указать', { timeout: 15000 });
  });

  await test.step('Open address modal, click map, and choose address', async () => {
    await page.locator('body .location__change').first().click({ timeout: 15000 });

    await expect(page.locator('body .location-modal')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .location-modal')).toContainText('Ваше местоположение', { timeout: 15000 });

    const locationMapModal = page.locator('#location-map-modal').first();
    await expect(locationMapModal).toBeVisible({ timeout: 15000 });
    await locationMapModal.click({ timeout: 15000 });

    await page.locator('body .location-modal__choose-btn').click({ timeout: 15000 });

    await expect(page.locator('body .location-modal')).toHaveCount(0, { timeout: 15000 });
    await expect(page.locator('body .location__change')).toContainText('изменить адрес', { timeout: 15000 });
  });
});
