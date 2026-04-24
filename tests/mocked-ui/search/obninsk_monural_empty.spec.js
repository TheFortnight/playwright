const { test, expect } = require('@playwright/test');

const EMPTY_SEARCH_RESPONSE = {
  pagination: {
    count: 1,
    total_count: 1,
    page: 1,
    total_pages: 3,
    next_page: {
      page: 2,
      take: 1,
      skip: 1,
    },
  },
  elements: [],
};

const AGGLOMERATION_ID = 'af0e05e9-e7b8-4764-8f98-4993a20d6541';
const CITY_ID = 'cf15cdfb-7200-42b0-8c0e-4a856ed61d7a';

function matchesSearchRequest(url, onlyAvailable, take, needElements, needPagination) {
  const parsed = new URL(url);
  return parsed.pathname === '/api/v2/catalog/goods/small/search'
    && parsed.searchParams.get('q') === 'монурал'
    && parsed.searchParams.get('only_available') === String(onlyAvailable)
    && parsed.searchParams.get('take') === String(take)
    && parsed.searchParams.get('need_elements') === String(needElements)
    && parsed.searchParams.get('need_pagination') === String(needPagination)
    && parsed.searchParams.get('agglomeration_id') === AGGLOMERATION_ID
    && parsed.searchParams.get('city_id') === CITY_ID;
}

test('obninsk search dropdown stays empty for монурал', async ({ page }) => {
  await page.route('**/api/v2/catalog/goods/small/search**', async route => {
    const url = route.request().url();
    const isFirstRequest = matchesSearchRequest(url, false, 1, false, false);
    const isSecondRequest = matchesSearchRequest(url, true, 5, true, true);

    if (!isFirstRequest && !isSecondRequest) {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(EMPTY_SEARCH_RESPONSE),
    });
  });

  await page.goto('/obninsk', { waitUntil: 'load', timeout: 30000 });

  const searchInput = page.getByRole('search', { name: 'Поиск лекарств десктоп' });
  await expect(searchInput).toBeVisible();
  await searchInput.click();
  await searchInput.fill('монурал');

  await expect(page.locator('.show-all-btn')).toBeVisible();
  await expect(page.locator('.search-dropdown .good-card')).toHaveCount(0);
  await expect(page.locator('.search-dropdown .nothing-found-block__text')).toHaveCount(0);
});
