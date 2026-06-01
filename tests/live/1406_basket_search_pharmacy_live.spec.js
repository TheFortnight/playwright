const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

function derivePharmacyQuery(text) {
  const value = String(text || '').trim();

  if (
    (value.startsWith('«') && value.endsWith('»'))
    || (value.startsWith('“') && value.endsWith('”'))
    || (value.startsWith('„') && value.endsWith('”'))
    || (value.startsWith('‹') && value.endsWith('›'))
    || (value.startsWith('"') && value.endsWith('"'))
    || (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim();
  }

  return value;
}

test('1406. basket search pharmacy live', async ({ page }) => {
  await test.step('Open catalog and add one product to basket', async () => {
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

    await page.mouse.click(
      basketButtonBox.x + basketButtonBox.width / 2,
      basketButtonBox.y + basketButtonBox.height / 2,
    );

    await addToBasketResponse;

    await page.waitForResponse((response) => {
      return response.request().method() === 'GET' && /\/api\/v2\/carts\/actual(?:\?.*)?$/.test(response.url());
    });

    const basketCount = page.locator('.header-top-right .basket__count');
    const cardCounter = page.locator('.basket-btn__container .item-counter__wrapper');
    const quantityIndicator = (await basketCount.count()) ? basketCount : cardCounter;
    await expect(quantityIndicator).toHaveText('1', { timeout: 30000 });
  });

  await test.step('Open basket and switch to pharmacy list view', async () => {
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

    await expect(page.locator('body .search-result__card').first()).toBeVisible({ timeout: 65000 });
  });

  await test.step('Search by the first visible pharmacy name', async () => {
    const firstPharmacyName = page.locator('body .search-result__pharmacy .name').first();
    await expect(firstPharmacyName).toBeVisible({ timeout: 15000 });

    const pharmacyQuery = derivePharmacyQuery(await firstPharmacyName.textContent());
    expect(pharmacyQuery).toBeTruthy();

    const searchInput = page.locator('body .pharmacy-offer__search-box input');
    await expect(searchInput).toBeVisible({ timeout: 15000 });
    await searchInput.click({ timeout: 15000 });
    await searchInput.fill(pharmacyQuery);
    await expect(searchInput).toHaveValue(pharmacyQuery, { timeout: 15000 });

    const visiblePharmacy = page.locator('body .search-result__pharmacy').first();
    await expect(visiblePharmacy).toBeVisible({ timeout: 15000 });

    await expect.poll(async () => {
      const pharmacyCards = page.locator('body .search-result__pharmacy');
      const count = await pharmacyCards.count();

      if (count === 0) {
        return false;
      }

      const names = await pharmacyCards.locator('.name').allTextContents();
      return names.length > 0 && names.every((name) => name.includes(pharmacyQuery));
    }, { timeout: 15000 }).toBe(true);
  });
});
