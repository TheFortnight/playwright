const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../../support/utils/env');
const mockBody = require('../../support/network/fixtures/bundles_card.js');
const baseUrl = getBaseUrl();

test.use({
  serviceWorkers: 'block',
});

test('mock catalog card', async ({ page }) => {
  await page.route(/.*\/omsk\/catalog\/dermatologiya(?:\?.*)?$/, async route => {
    const liveResponse = await route.fetch();
    let html = await liveResponse.text();

    html = html.replace(/Акридерм/g, 'Dr Aqua');
    html = html.replace(/Кэшбэк 35&nbsp;₽/g, 'Кэшбэк 550&nbsp;₽');

    await route.fulfill({
      response: liveResponse,
      body: html,
    });
  });

  await page.route(/.*\/api\/v2\/catalog\/goods\/medium\/search\?.*need_elements=true.*/, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockBody),
    });
  });

  await page.route(/.*\/api\/v2\/catalog\/goods\/medium\/search\?.*need_elements=false.*/, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        pagination: { count: 0, total_count: 0, page: 1, total_pages: 0, next_page: null },
        elements: [],
      }),
    });
  });

  await page.route(/.*\/api\/v2\/catalog\/goods\/medium\/search\/filters\/simplified\?.*/, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        groups: [],
        names: [],
        forms: [],
        general_properties: [],
        packings: [],
        amounts: [],
        dosages: [],
        volumes: [],
        comments: [],
        manufacturers: [],
        countries: [],
        inns: [],
        assignments: [],
        diseases: [],
        target_organs: [],
        symptoms: [],
      }),
    });
  });

  await page.route(/.*\/api\/api_276\/marketing\/cashback\/from_manufacturers\/terms\/by_goods.*/, async route => {
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
