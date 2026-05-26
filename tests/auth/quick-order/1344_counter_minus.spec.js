const { test, expect, getBaseUrl, dismissOverlays, getSmsCode } = require('../../support/fixtures');
const { DEFAULT_PRODUCT_PATH } = require('../../support/flows/quick-order');

const baseUrl = getBaseUrl();
const tags = ['express'];

function parsePrice(text) {
  return Number.parseFloat(String(text || '').replace(/[^\d,.-]/g, '').replace(',', '.'));
}

async function loginByApi(page, phone = '1111111111') {
  const sessionId = (await page.context().cookies()).find(({ name }) => name === 'sessionId')?.value;
  const deviceId = await page.evaluate(() => localStorage.getItem('deviceId'));

  const headers = { 'X-Platform': 'Mobile' };

  if (sessionId) {
    headers['Session-Id'] = sessionId;
  }

  if (deviceId) {
    headers['Device-Id'] = deviceId;
  }

  const authPhone = Number(`7${phone}`);

  const authRequestResponse = await page.context().request.post(`${baseUrl}api/v2/auth/phone/code/request`, {
    data: {
      phone: authPhone,
      smart_captcha_token: null,
    },
    headers,
  });

  expect(authRequestResponse.ok()).toBeTruthy();

  const { verification_id: verificationId } = await authRequestResponse.json();
  expect(verificationId).toBeTruthy();

  const authCompleteResponse = await page.context().request.post(`${baseUrl}api/v2/auth/phone/code/complete`, {
    data: {
      verification_id: verificationId,
      code: getSmsCode(),
    },
    headers,
  });

  expect(authCompleteResponse.ok()).toBeTruthy();

  const authCompleteData = await authCompleteResponse.json();

  await page.evaluate(value => {
    localStorage.setItem('token', JSON.stringify(value));
  }, {
    access: authCompleteData.access,
    refresh: authCompleteData.refresh,
  });

  await page.goto(page.url(), {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
}

test.use({
  serviceWorkers: 'block',
});

test.describe('1344 Counter, reduce number of goods. Auth', () => {
  test('1344. counter minus live', async ({ page }) => {
    const offersResponsePromise = page.waitForResponse(response => {
      const url = response.url();

      return response.request().method() === 'GET'
        && url.includes('/api/v2/partners/offers/goods')
        && url.includes('take=100')
        && response.ok();
    }, { timeout: 60000 });

    await page.goto(`${baseUrl}${DEFAULT_PRODUCT_PATH}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await dismissOverlays(page);

    const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
    if (await confirmCityButton.count()) {
      await confirmCityButton.click();
    }

    await expect(page.locator('body .good-card__title')).toBeVisible({ timeout: 30000 });

    const offersResponse = await offersResponsePromise;
    const offersData = await offersResponse.json();

    const offerIndex = offersData.elements.findIndex(({ offer }) => Number(offer?.total_quantity) > 1);
    expect(offerIndex, 'Expected an offer with total_quantity > 1').toBeGreaterThan(-1);

    const offerNumber = offerIndex + 1;

    await loginByApi(page);

    await dismissOverlays(page);

    const listTab = page.locator('body .tab-switcher__button').last();
    await expect(listTab).toBeVisible({ timeout: 30000 });
    await listTab.hover();
    await listTab.click();

    await expect(page.locator('body .search-result__card').first()).toBeVisible({ timeout: 65000 });

    const offerButton = page.locator(`body phrm-goods-offers-list-view-card:nth-child(${offerNumber}) button`).first();
    await expect(offerButton).toBeVisible({ timeout: 30000 });
    await offerButton.scrollIntoViewIfNeeded();
    await offerButton.click();

    await expect(page.locator('.dialog')).toBeVisible({ timeout: 15000 });

    const counter = page.locator('body .item-counter__wrapper');
    const initialPrice = page.locator('body .medicines-item__price--full').first();
    const summaryPrice = page.locator('body .summary__price').first();
    const plusButton = page.locator('.dialog .item-counter__change').last();
    const minusButton = page.locator('.dialog .item-counter__change').first();

    await expect(counter).toHaveText('1', { timeout: 45000 });
    await expect(initialPrice).toBeVisible({ timeout: 15000 });
    await expect(summaryPrice).toBeVisible({ timeout: 15000 });

    const price1 = parsePrice(await initialPrice.innerText());

    await expect(plusButton).toBeVisible({ timeout: 15000 });
    await plusButton.click();

    await expect(counter).toHaveText('2', { timeout: 15000 });
    await expect.poll(async () => parsePrice(await summaryPrice.innerText()), { timeout: 15000 })
      .toBeGreaterThan(price1 * 2 - 1);
    await expect.poll(async () => parsePrice(await summaryPrice.innerText()), { timeout: 15000 })
      .toBeLessThan(price1 * 2 + 1);

    await expect(minusButton).toBeVisible({ timeout: 15000 });
    await minusButton.click();

    await expect(counter).toHaveText('1', { timeout: 15000 });
    await expect.poll(async () => parsePrice(await summaryPrice.innerText()), { timeout: 15000 })
      .toBeGreaterThan(price1 - 1);
    await expect.poll(async () => parsePrice(await summaryPrice.innerText()), { timeout: 15000 })
      .toBeLessThan(price1 + 1);
  });
});
