const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1398. basket choose pharmacy layout', async ({ page }) => {
  await test.step('Open catalog and add first product to basket', async () => {
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
    const basketResponsePromise = page.waitForResponse((response) => response.request().method() === 'POST' && /\/api\/v2\/carts\/[^/]+\/goods(?:\?.*)?$/.test(response.url()));
    await page.mouse.click(
      basketButtonBox.x + basketButtonBox.width / 2,
      basketButtonBox.y + basketButtonBox.height / 2,
    );

    await basketResponsePromise;

    const cartsActualResponsePromise = page.waitForResponse((response) => response.request().method() === 'GET' && /\/api\/v2\/carts\/actual(?:\?.*)?$/.test(response.url()));
    await cartsActualResponsePromise;

    await expect.poll(async () => page.evaluate(() => {
      return document.querySelector('.header-top-right .basket__count')?.textContent?.trim()
        || document.querySelector('.basket-btn__container .item-counter__wrapper')?.textContent?.trim()
        || '';
    }), { timeout: 25000 }).toBe('1');
  });

  await test.step('Go to basket and open choose pharmacy page', async () => {
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
    await expect(page.locator('#map')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .lottie-loader .loaded')).toBeVisible({ timeout: 45000 });
    await expect(page.locator('body .pharmacy-filters__switch')).toBeVisible({ timeout: 45000 });
  });

  await test.step('Switch to list view and verify layout', async () => {
    const legacyListTab = page.locator('body .tab-switcher__tab:last-child');
    const currentListTab = page.locator('body .tab-switcher__button').last();
    const listTab = (await legacyListTab.count()) ? legacyListTab : currentListTab;
    await listTab.hover();
    await listTab.click();

    await expect(page.locator('body .search-result__card').first()).toBeVisible({ timeout: 65000 });
    await expect(page.locator('.pharmacy-offer__title')).toContainText('В какой аптеке вы заберете заказ?', { timeout: 20000 });
    await expect(page.locator('body .location__left--not-selected').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .location__change').first()).toContainText('указать', { timeout: 15000 });
    await expect(page.locator('body .search-input').first()).toHaveAttribute('placeholder', 'Введите название аптеки или адрес');
    await expect(page.locator('body .search-icon').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .tab-switcher').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .pharmacy-offer__found-result').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .pharmacy-filters__switch').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Сначала ближе').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .search-result__pharmacy-info').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .distance-label').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .price').first()).toContainText('.', { timeout: 15000 });
    await expect(page.locator('body .order-btn').first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('body .basket-order__order-step').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .done').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .basket-item__text').first()).toContainText(/\S/, { timeout: 15000 });
    await expect(page.locator('body .done .order-step__btn').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .order-step--second.active').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .order-step--third').first()).toContainText('Заполните контактные данные', { timeout: 15000 });
  });

  await test.step('Capture the main layout', async () => {
    await expect(page.locator('body .main-container')).toHaveScreenshot('1398_layout.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.1,
    });
  });
});
