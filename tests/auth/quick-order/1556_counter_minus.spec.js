const {
  test,
  expect,
  getBaseUrl,
  dismissOverlays,
  getSmsCode,
  fillQuickOrderPhoneAndRequestSms,
} = require('../../support/fixtures');

const baseUrl = getBaseUrl();

function parsePrice(text) {
  return Number.parseFloat(String(text || '').replace(/[^\d,.-]/g, '').replace(',', '.'));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractHtmlValue(html, pattern, label) {
  const match = html.match(pattern);

  if (!match) {
    throw new Error(`Unable to extract ${label} from product page HTML`);
  }

  return match[1];
}

function extractRegionIdsFromHtml(html) {
  const match = html.match(/estimates-agglomeration_id=([^&"]+)&city_id=([^&"]+)&good_id=/);

  if (match) {
    return {
      agglomerationId: match[1],
      cityId: match[2],
    };
  }

  return {
    agglomerationId: extractHtmlValue(html, /"agglomeration_id"\s*:\s*"([^"]+)"/, 'agglomeration_id'),
    cityId: extractHtmlValue(html, /"city_id"\s*:\s*"([^"]+)"/, 'city_id'),
  };
}

function extractGoodIdFromHtml(html, slug) {
  const patterns = [
    new RegExp(`"good_slug"\\s*:\\s*"${escapeRegExp(slug)}"[\\s\\S]{0,1000}?"good_id"\\s*:\\s*(\\d+)`),
    new RegExp(`"goodSlug"\\s*:\\s*"${escapeRegExp(slug)}"[\\s\\S]{0,1000}?"goodId"\\s*:\\s*(\\d+)`),
    new RegExp(`"good_slug"\\s*:\\s*"${escapeRegExp(slug)}"[\\s\\S]{0,1000}?"goodId"\\s*:\\s*(\\d+)`),
    new RegExp(`"goodSlug"\\s*:\\s*"${escapeRegExp(slug)}"[\\s\\S]{0,1000}?"good_id"\\s*:\\s*(\\d+)`),
    new RegExp(`"slug"\\s*:\\s*"${escapeRegExp(slug)}"[\\s\\S]{0,1000}?"good_id"\\s*:\\s*(\\d+)`),
    new RegExp(`"slug"\\s*:\\s*"${escapeRegExp(slug)}"[\\s\\S]{0,1000}?"goodId"\\s*:\\s*(\\d+)`),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match) {
      return match[1];
    }
  }

  throw new Error(`Unable to extract good_id for slug ${slug} from product page HTML`);
}

test.use({
  serviceWorkers: 'block',
});

test('1556. counter minus live', async ({ page, browserName }) => {
  await page.goto(`${baseUrl}omsk/products/omez-20-mg-kapsuly-kishechnorastvorimye-30-sht-61149`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await dismissOverlays(page);

  const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
  if (await confirmCityButton.count()) {
    await confirmCityButton.click();
  }

  await expect(page.locator('body .good-card__title')).toBeVisible({ timeout: 30000 });
  await page.waitForLoadState('load', { timeout: 30000 });
  await page.waitForTimeout(1000); // wait for potential additional content to load after 'load' event

  const pageHtml = await page.content();
  const currentSlug = new URL(page.url()).pathname.split('/').filter(Boolean).pop();
  const { cityId, agglomerationId } = extractRegionIdsFromHtml(pageHtml);
  const goodId = extractGoodIdFromHtml(pageHtml, currentSlug);

  const estimatesUrl = new URL('api/v2/partners/offers/estimates', baseUrl);
  estimatesUrl.searchParams.set('city_id', cityId);
  estimatesUrl.searchParams.set('agglomeration_id', agglomerationId);
  estimatesUrl.searchParams.set('good_id', goodId);

  const estimatesResponse = await page.context().request.get(estimatesUrl.toString());
  expect(estimatesResponse.ok()).toBeTruthy();

  const estimatesData = await estimatesResponse.json();
  const estimateItem = Array.isArray(estimatesData)
    ? estimatesData.find(({ good_id }) => String(good_id) === String(goodId)) ?? estimatesData[0]
    : estimatesData;
  const availablePharmacies = Number(estimateItem?.count_of_pharmacies_with_offer ?? 0);

  expect(availablePharmacies, 'Expected at least 2 available pharmacies with offer').toBeGreaterThanOrEqual(2);

  const pharmacyCountButton = page.getByRole('button', { name: /аптеках/ }).first();
  const listTab = page.locator('body .tab-switcher__button').last();

  await expect(pharmacyCountButton).toBeVisible({ timeout: 30000 });
  await pharmacyCountButton.click();

  await expect(page.locator('body .pharmacy-offer__inner')).toBeVisible({ timeout: 30000 });

  await expect(listTab).toBeVisible({ timeout: 30000 });
  await listTab.hover();
  await page.waitForTimeout(1000);
  await listTab.click();

  await page.waitForLoadState('networkidle', { timeout: 30000 });
  await expect(page.locator('body .search-result__card').first()).toBeVisible({ timeout: 65000 });

  const offerButton = page.locator('body .order-btn').first();

  await expect(offerButton).toBeVisible({ timeout: 65000 });
  await offerButton.scrollIntoViewIfNeeded();
  await offerButton.click();

  await expect(page.locator('.dialog .modal-container')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#tel')).toBeVisible({ timeout: 45000 });

  await page.locator('#tel').click();
  await fillQuickOrderPhoneAndRequestSms(page, '0000000000');

  const codeInput = page.locator('.dialog .code-dialog__code-box input').first();
  await expect(codeInput).toBeVisible({ timeout: 45000 });
  await codeInput.click();
  await page.keyboard.type(getSmsCode(), { delay: browserName === 'firefox' ? 100 : 0 });

  const counter = page.locator('body .item-counter__wrapper');
  const initialPrice = page.locator('body .medicines-item__price--full').first();
  const summaryPrice = page.locator('body .summary__price').first();
  const plusButton = page.locator('.dialog .item-counter__change').last();
  const minusButton = page.locator('.dialog .item-counter__change').first();

  await expect(counter).toHaveText('1', { timeout: 45000 });
  await expect(plusButton).toBeEnabled({ timeout: 15000 });
  await expect(minusButton).toHaveClass(/disabled/);
  await expect(initialPrice).toBeVisible({ timeout: 15000 });
  await expect(summaryPrice).toBeVisible({ timeout: 15000 });

  const price1 = parsePrice(await initialPrice.innerText());

  await plusButton.click();

  await expect(counter).toHaveText('2', { timeout: 15000 });
  await expect(minusButton).not.toHaveClass(/disabled/);
  await expect.poll(async () => parsePrice(await summaryPrice.innerText()), { timeout: 15000 })
    .toBeGreaterThan(price1 * 2 - 1);
  await expect.poll(async () => parsePrice(await summaryPrice.innerText()), { timeout: 15000 })
    .toBeLessThan(price1 * 2 + 1);

  await expect(minusButton).toBeEnabled({ timeout: 15000 });
  await minusButton.click();

  await expect(counter).toHaveText('1', { timeout: 15000 });
  await expect.poll(async () => parsePrice(await summaryPrice.innerText()), { timeout: 15000 })
    .toBeGreaterThan(price1 - 1);
  await expect.poll(async () => parsePrice(await summaryPrice.innerText()), { timeout: 15000 })
    .toBeLessThan(price1 + 1);
});
