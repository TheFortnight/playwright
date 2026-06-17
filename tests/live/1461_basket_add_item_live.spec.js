const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1461. basket add item live', async ({ page, browserName }) => {
  await test.step('Open subcatalog and add the first product to basket', async () => {
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

    if (browserName === 'webkit') {
      await firstBasketButton.click({ timeout: 20000 });
    } else {
      await page.mouse.click(
        basketButtonBox.x + basketButtonBox.width / 2,
        basketButtonBox.y + basketButtonBox.height / 2,
      );
    }

    await addToBasketResponse;

    await page.waitForResponse((response) => {
      return response.request().method() === 'GET' && /\/api\/v2\/carts\/actual(?:\?.*)?$/.test(response.url());
    });
  });

  await test.step('Open basket directly and verify the item exists', async () => {
    await page.goto(`${baseUrl}basket`, {
      waitUntil: 'load',
      timeout: 30000,
    });

    await expect(page).toHaveURL(/\/basket(?:$|[?#])/, { timeout: 30000 });
    await expect(page.locator('body')).toContainText('Корзина', { timeout: 20000 });
    await expect(page.locator('.basket-items')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.basket-items .basket-item-desktop__body')).toHaveCount(1, { timeout: 30000 });
    await expect(page.locator('.basket-items .basket-item-desktop__body').first()).toBeVisible({ timeout: 20000 });
  });
});
