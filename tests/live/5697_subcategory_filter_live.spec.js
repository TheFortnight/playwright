const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();
const SEARCH_REQUEST_ENDPOINT = '/api/api_281/catalog/goods/search';
const SEARCH_REQUEST_GROUP_ID = '15968';

test('5697. subcategory filter updates goods list', async ({ page }) => {
  await page.goto(`${baseUrl}omsk`, { waitUntil: 'load', timeout: 30000 });
  await dismissOverlays(page);

  await page.goto(`${baseUrl}catalog/bad`, { waitUntil: 'domcontentloaded', timeout: 45000 });

  const productCards = page.locator('body .card');
  await expect(productCards.first()).toBeVisible({ timeout: 30000 });

  const goodResult = page.locator('body .good-list__result');
  const initialProductCountText = await goodResult.textContent();
  const initialProductCount = Number((initialProductCountText ?? '').replace(/[^\d]/g, ''));

  const subcategoryGroup = page.locator('phrm-good-filter-group').filter({
    has: page.locator('.filters-group__name', { hasText: 'Подкатегория' }),
  });
  await expect(subcategoryGroup.locator('.filters-group__name')).toHaveText('Подкатегория');

  const subcategoryOption = subcategoryGroup.locator('div.filters-group__option').filter({
    hasText: 'БАД в сезон простуд',
  }).first();
  const selectedFilterTextLocator = subcategoryOption.locator('div.checkbox-text');
  const checkboxInput = subcategoryOption.locator('input.checkbox-input');

  const requestPromise = page.waitForRequest(request => {
    const requestUrl = new URL(request.url());

    return request.method() === 'GET'
      && requestUrl.pathname === SEARCH_REQUEST_ENDPOINT
      && requestUrl.searchParams.get('group_id') === SEARCH_REQUEST_GROUP_ID;
  });

  await expect(subcategoryOption.first()).toBeVisible({ timeout: 30000 });
  await page.waitForTimeout(1000);
  await subcategoryOption.click({ force: true });

  await expect(checkboxInput).toBeChecked();

  const request = await requestPromise;

  expect(request.method()).toBe('GET');
  const requestUrl = new URL(request.url());
  expect(requestUrl.pathname).toBe(SEARCH_REQUEST_ENDPOINT);
  expect(requestUrl.searchParams.get('group_id')).toBe(SEARCH_REQUEST_GROUP_ID);

  const selectedFilterText = (await selectedFilterTextLocator.textContent() ?? '').trim();
  const appliedFilterText = (await page.locator('body .gtm-pharmacy_tags').first().textContent() ?? '').trim();
  expect(appliedFilterText).toBe(selectedFilterText);

  let filteredProductCount = 0;
  await expect.poll(async () => {
    const filteredProductCountText = await goodResult.textContent();
    filteredProductCount = Number((filteredProductCountText ?? '').replace(/[^\d]/g, ''));
    return filteredProductCount;
  }).toBeLessThan(initialProductCount);

  expect(filteredProductCount).toBeLessThan(initialProductCount);
});
