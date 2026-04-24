const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../../support/utils/env');
const mockBody = require('../../support/network/fixtures/bundles_card.js');
const baseUrl = getBaseUrl();

test.use({
  serviceWorkers: 'block',
});

test('mock catalog card', async ({ page }) => {
  await page.route('**/api/v2/catalog/goods/medium/search**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockBody),
    });
  });

  await page.route('**/api/api_276/marketing/cashback/from_manufacturers/terms/by_goods**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{
        "good_id": 42313,
        "good_slug": "dr-aqua-sol-dlya-vann-morskaya-prirodnaya-sol-dlya-vann-1-kg-1-sht-103289",
        "has_cashback": true,
        "cashback_type": "fixed_reward",
        "fixed_reward": {
          "value": 55000
        },
        "percentage_reward": null
      }]),
    });
  });

  await page.goto(`${baseUrl}omsk/catalog`, {
    waitUntil: 'load',
    timeout: 30000,
  });
  const dermatologyLink = page.getByRole('link', {
    name: 'Дерматология',
  });
  await expect(dermatologyLink).toBeVisible();
  await dermatologyLink.click();

  const cards = page.locator('body .card');
  await expect(cards.first()).toBeVisible();
  await expect(page.locator('body .manufacturer-cashback').first()).toHaveText('Кэшбэк 550 ₽');
});
