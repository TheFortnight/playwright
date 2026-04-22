const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();
const SEARCH_PATH = '/goods/medium/search?group_id=15968';

test('5697. subcategory filter updates goods list', async ({ page }) => {
  await page.goto(`${baseUrl}catalog/bad`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await dismissOverlays(page);

  const productCards = page.locator('body .card');
  await expect(productCards.first()).toBeVisible();
  await page.waitForLoadState('networkidle');

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
    return request.method() === 'GET' && request.url().includes(SEARCH_PATH);
  });
  await selectedFilterTextLocator.click();

  await expect(checkboxInput).toBeChecked();

  const request = await requestPromise;
  expect(request.method()).toBe('GET');
  expect(request.url()).toContain(SEARCH_PATH);

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
