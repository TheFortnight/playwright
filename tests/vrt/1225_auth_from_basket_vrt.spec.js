const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1225. authorization from basket with empty phone number', async ({ page }) => {
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
  await expect(page.locator('.basket-items .basket-item-desktop__body')).toBeVisible({ timeout: 20000 });

  const choosePharmacyButton = page.locator('.basket-order__order-block .order-block__btn').first();
  await expect(choosePharmacyButton).toBeVisible({ timeout: 15000 });
  await expect(choosePharmacyButton).toBeEnabled({ timeout: 30000 });
  await choosePharmacyButton.click();

  await expect(page.locator('#map')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('body .lottie-loader .loaded')).toBeVisible({ timeout: 45000 });
  await expect(page.locator('body .pharmacy-filters__switch')).toBeVisible({ timeout: 45000 });

  const legacyListTab = page.locator('body .tab-switcher__tab:last-child');
  const currentListTab = page.locator('body .tab-switcher__button').last();
  const listTab = (await legacyListTab.count()) ? legacyListTab : currentListTab;
  await listTab.hover();
  await listTab.click();

  await expect(page.locator('body .search-result__card').first()).toBeVisible({ timeout: 65000 });
  await expect(page.locator('.pharmacy-offer__title')).toContainText('В какой аптеке вы заберете заказ?', { timeout: 20000 });

  const orderButton = page.locator('body .order-btn').first();
  await expect(orderButton).toBeVisible({ timeout: 30000 });
  await orderButton.scrollIntoViewIfNeeded();
  await orderButton.click();

  const modal = page.locator('.dialog .modal-container');
  await expect(modal).toBeVisible({ timeout: 15000 });

  await page.locator('#tel').click();

  await expect(modal).toHaveScreenshot('1225_Booking_Form.png', {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.15,
  });
});
