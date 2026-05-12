const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');
const { skipOnProductionForTags } = require('../support/utils/production-guard');

const baseUrl = getBaseUrl();
const tags = ['express'];

skipOnProductionForTags(tags);

test('1229. authorization from basket can resend sms code', async ({ page }) => {
  await test.step('Open catalog page and add first product to basket', async () => {
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
  });

  await test.step('Open basket and choose pharmacy', async () => {
    await page.locator('.header-top-right a.mini-basket__label').click();
    await page.waitForURL(/\/basket(?:$|[?#])/, { timeout: 30000 });

    await expect(page.locator('.basket-items')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.basket-items .basket-item-desktop__body').first()).toBeVisible({ timeout: 20000 });

    const choosePharmacyButton = page.locator('.basket-order__order-block .order-block__btn').first();
    await expect(choosePharmacyButton).toBeVisible({ timeout: 15000 });
    await expect(choosePharmacyButton).toBeEnabled({ timeout: 30000 });
    await choosePharmacyButton.click();
    await page.waitForURL(/\/checkout\/basket\/.*\/select-pharmacy(?:$|[?#])/, { timeout: 30000 });

    await expect(page.locator('.pharmacy-offer__title')).toContainText('В какой аптеке вы заберете заказ?', {
      timeout: 20000,
    });

    await expect(page.locator('body .pharmacy-filters__switch')).toBeVisible({ timeout: 45000 });
    const legacyListTab = page.locator('body .tab-switcher__tab:last-child');
    const currentListTab = page.locator('body .tab-switcher__button').last();
    const listTab = (await legacyListTab.count()) ? legacyListTab : currentListTab;
    await listTab.hover();
    await listTab.click();

    await expect(page.locator('body .search-result__card').first()).toBeVisible({ timeout: 65000 });
  });

  await test.step('Request SMS, return to phone form, and request SMS again', async () => {
    const choosePharmacyFromList = page.getByRole('button', { name: 'Выбрать' }).first();
    await expect(choosePharmacyFromList).toBeVisible({ timeout: 45000 });
    await choosePharmacyFromList.click();

    await expect(page.locator('.dialog .modal-container')).toBeVisible({ timeout: 45000 });
    await expect(page.locator('#tel')).toBeVisible({ timeout: 45000 });
    await page.locator('#tel').click();
    await page.locator('#tel').fill('1111111111');
    await page.locator('body .agreement-wrapper .agreement-item:nth-child(2) .custom-checkbox').click();
    await page.locator('body .agreement-wrapper .agreement-item:nth-child(3) .custom-checkbox').click();
    await page.locator('.dialog .auth-form__code-btn').click();

    await expect(page.locator('.dialog .code-dialog__time-text')).toContainText('Получить код еще раз', {
      timeout: 10000,
    });

    await expect(page.locator('body .code-dialog__change-phone')).toBeVisible({ timeout: 15000 });
    await page.locator('body .code-dialog__change-phone').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('#tel')).toBeVisible({ timeout: 15000 });
    await page.locator('#tel').fill('1111111111');
    await page.locator('.dialog .auth-form__code-btn').click();

    await expect(page.locator('.dialog .code-dialog__time-text')).toContainText('Получить код еще раз', {
      timeout: 10000,
    });
  });
});
