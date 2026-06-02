const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

function getCurrentHourUtcPlus(utc = 3) {
  const currentHour = new Date().getUTCHours() + utc;
  return currentHour >= 24 ? currentHour - 24 : currentHour;
}

function isScheduleOpenAtCurrentHour(scheduleText, currentHour) {
  const text = String(scheduleText || '').trim();

  if (!text) {
    return false;
  }

  if (text.includes('Круглосуточно')) {
    return true;
  }

  const chars = text.split('');
  const firstTime = chars.findIndex((char) => char === ':');
  const lastTime = chars.findLastIndex((char) => char === ':');

  if (firstTime === -1 || lastTime === -1 || firstTime < 1 || lastTime < 1) {
    return false;
  }

  const openingHour = Number.isNaN(+chars[firstTime - 2]) || +chars[firstTime - 2] === 0
    ? +chars[firstTime - 1]
    : +(chars[firstTime - 2] + chars[firstTime - 1]);
  const closingHour = +(chars[lastTime - 2] + chars[lastTime - 1]);

  return currentHour >= openingHour && currentHour <= closingHour;
}

async function openPharmacyList(page, browserName) {
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

  await expect.poll(async () => page.evaluate(() => {
    return document.querySelector('.header-top-right .basket__count')?.textContent?.trim()
      || document.querySelector('.basket-btn__container .item-counter__wrapper')?.textContent?.trim()
      || '';
  }), { timeout: 25000 }).toBe('1');

  await page.locator('.header-top-right a.mini-basket__label').click({ timeout: 15000 });
  await page.waitForURL(/\/basket(?:$|[?#])/, { timeout: 30000 });

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
  await expect(page.locator('body .pharmacy-filters__switch')).toBeVisible({ timeout: 45000 });

  const legacyListTab = page.locator('body .tab-switcher__tab:last-child');
  const currentListTab = page.locator('body .tab-switcher__button').last();
  const listTab = (await legacyListTab.count()) ? legacyListTab : currentListTab;

  await expect(listTab).toBeVisible({ timeout: 30000 });
  await listTab.hover();
  await listTab.click();

  await expect(page.locator('body .search-result__pharmacy').first()).toBeVisible({ timeout: 65000 });
}

test('1407. basket filter open live', async ({ page }) => {
  const browserName = test.info().project.use.browserName;

  await test.step('Open pharmacy list view', async () => {
    await openPharmacyList(page, browserName);
  });

  await test.step('Apply the open filter and verify the list', async () => {
    const openFilter = page.getByRole('button', { name: 'Открытые' }).first();
    await expect(openFilter).toBeVisible({ timeout: 30000 });
    await openFilter.click({ timeout: 15000 });

    await expect(openFilter).toHaveClass(/active/, { timeout: 15000 });

    await expect(page.locator('body .search-result__pharmacy').first()).toBeVisible({ timeout: 30000 });

    const currentHour = getCurrentHourUtcPlus(3);

    // Legacy Nightwatch checkFilterOpen(3) used the current UTC+3 hour against each opening-hours string.
    // Here we keep that contract and additionally fail when no pharmacies are shown.
    await expect.poll(async () => {
      const pharmacies = page.locator('body .search-result__pharmacy');
      const count = await pharmacies.count();

      if (!count) {
        return false;
      }

      const schedules = await pharmacies.locator('.opening-hours').allTextContents();
      return schedules.length > 0 && schedules.every((text) => isScheduleOpenAtCurrentHour(text, currentHour));
    }, { timeout: 20000 }).toBe(true);
  });
});
