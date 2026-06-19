const {
  test,
  expect,
  getBaseUrl,
  dismissOverlays,
  getSmsCode,
} = require('../../support/fixtures');
const {
  DEFAULT_PRODUCT_PATH,
  fillQuickOrderPhoneAndRequestSms,
} = require('../../support/flows/quick-order');

const baseUrl = getBaseUrl();

function parsePrice(text) {
  return Number.parseFloat(String(text || '').replace(/[^\d,.-]/g, '').replace(',', '.'));
}

test.use({
  serviceWorkers: 'block',
});

test('1553. counter plus live', async ({ page, browserName }) => {
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
  await page.waitForLoadState('load', {
    timeout: 30000,
  });

  await test.step('Open booking dialog from the derived offer', async () => {
    const listTab = page.locator('body .tab-switcher__button').last();

    await page.waitForLoadState('load', {
      timeout: 30000,
    });
    await expect(listTab).toBeVisible({ timeout: 30000 });
    await listTab.hover();
    await page.waitForTimeout(1000);
    await listTab.click({ force: browserName === 'webkit' });

    await expect(page.locator('body .tab-switcher__tab.active, body .tab-switcher__button.active').last())
      .toBeVisible({ timeout: 15000 });

    await expect(page.locator('body .search-result__card').first()).toBeVisible({ timeout: 65000 });

    const offersResponse = await offersResponsePromise;
    const offersData = await offersResponse.json();
    const offerIndex = offersData.elements.findIndex(({ offer }) => Number(offer?.total_quantity) > 1);

    expect(offerIndex, 'Expected an offer with total_quantity > 1').toBeGreaterThan(-1);

    const offerNumber = offerIndex + 1;

    const offerButton = page.locator(`body phrm-goods-offers-list-view-card:nth-child(${offerNumber}) button`).first();
    await expect(offerButton).toBeVisible({ timeout: 30000 });
    await offerButton.scrollIntoViewIfNeeded();
    await offerButton.click({ force: browserName === 'firefox' });

    await expect(page.locator('.dialog .modal-container')).toBeVisible({ timeout: 15000 });
  });

  await test.step('Authorize by phone and SMS code', async () => {
    await page.locator('#tel').click();
    await fillQuickOrderPhoneAndRequestSms(page, '0000000000');

    const codeInput = page.locator('.dialog .code-dialog__code-box input').first();
    await expect(codeInput).toBeVisible({ timeout: 45000 });
    await codeInput.click();
    await page.keyboard.type(getSmsCode());
  });

  await test.step('Increase quantity and verify total price', async () => {
    const counter = page.locator('body .item-counter__wrapper');
    const summaryPrice = page.locator('body .summary__price').first();
    const plusButton = page.locator('.dialog .item-counter__change').last();

    await expect(counter).toHaveText('1', { timeout: 45000 });
    await expect(summaryPrice).toBeVisible({ timeout: 15000 });

    const price1 = parsePrice(await summaryPrice.innerText());

    await expect(plusButton).toBeEnabled({ timeout: 15000 });
    await plusButton.click();

    await expect(counter).toHaveText('2', { timeout: 15000 });
    await expect.poll(async () => parsePrice(await summaryPrice.innerText()), { timeout: 15000 })
      .toBeGreaterThan(price1 * 2 - 1);
    await expect.poll(async () => parsePrice(await summaryPrice.innerText()), { timeout: 15000 })
      .toBeLessThan(price1 * 2 + 1);
  });
});
