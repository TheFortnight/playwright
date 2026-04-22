const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('./support/utils/env');
const { dismissOverlays } = require('./support/utils/overlays');

const baseUrl = getBaseUrl();

const PRODUCT_SLUG = 'kombonefron-tabletki-pokrytye-obolochkoy-120-sht-137644';

async function getCashbackText(request, url) {
  const response = await request.get(url);
  const body = await response.json();
  const value = Array.isArray(body) ? body[0]?.fixed_reward?.value : body?.fixed_reward?.value;

  return {
    body,
    text: `Кэшбэк ${Math.round(Number(value) / 100)} ₽`,
  };
}

test('fetch and compare cashback badge', async ({ page, request }) => {
  const url = `${baseUrl}api/api_276/marketing/cashback/from_manufacturers/terms/by_goods?good_slug=${PRODUCT_SLUG}`;
  const { body, text: expectedText } = await getCashbackText(request, url);

  console.log('FETCHED CASHBACK RESPONSE', JSON.stringify(body, null, 2));
  console.log('EXPECTED BADGE TEXT', expectedText);

  await page.goto(`${baseUrl}products/${PRODUCT_SLUG}`, { waitUntil: 'commit', timeout: 30000 });
  await dismissOverlays(page);

  const badge = page.locator('body .good-card__left-block .manufacturer-cashback');
  await expect(badge).toHaveText(expectedText);
});
