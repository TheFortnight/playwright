const {
  test,
  expect,
  getBaseUrl,
  dismissOverlays,
  getSmsCode,
  fillQuickOrderPhoneAndRequestSms,
  skipOnProductionForTags,
} = require('../support/fixtures');

const baseUrl = getBaseUrl();
const tags = ['test', 'vrt'];

skipOnProductionForTags(tags);

function parsePrice(text) {
  return Number.parseFloat(String(text || '').replace(/[^\d,.-]/g, '').replace(',', '.'));
}

async function closeCookieToastIfPresent(page) {
  const closeButton = page.locator('.toast-message .phrm-shape-rectangle').first();

  if (await closeButton.count()) {
    await closeButton.click({ force: true });
  }
}

async function startProductCard(page) {
  await page.setViewportSize({ width: 1440, height: 780 });
  await page.goto(`${baseUrl}novosibirsk/products/nimulid-100-mg-tabletki-20-sht-62728`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await dismissOverlays(page);

  const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
  if (await confirmCityButton.count()) {
    await confirmCityButton.click();
  }

  await expect(page.locator('body .good-card__title')).toContainText('Нимулид', { timeout: 30000 });
  await page.waitForLoadState('load', { timeout: 30000 });
  await closeCookieToastIfPresent(page);
}

async function clickFirstOffer(page, browserName) {
  const pharmacyCountButton = page.getByRole('button', { name: /аптеках/ }).first();
  const legacyListTab = page.locator('body .tab-switcher__tab:last-child');
  const currentListTab = page.locator('body .tab-switcher__button').last();
  const listTab = (await legacyListTab.count()) ? legacyListTab : currentListTab;

  await expect(pharmacyCountButton).toBeVisible({ timeout: 30000 });
  await pharmacyCountButton.click();

  await expect(page.locator('body .pharmacy-offer__inner')).toBeVisible({ timeout: 30000 });
  await expect(listTab).toBeVisible({ timeout: 30000 });
  await listTab.hover();
  await listTab.click({ force: browserName === 'webkit' });

  await expect(page.locator('body .search-result__card').first()).toBeVisible({ timeout: 65000 });

  const firstOfferButton = page.locator('body .order-btn').first();
  await expect(firstOfferButton).toBeVisible({ timeout: 30000 });
  await firstOfferButton.scrollIntoViewIfNeeded();
  await firstOfferButton.click({ force: browserName === 'firefox' || browserName === 'webkit' });

  await expect(page.locator('.dialog .modal-container')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#tel')).toBeVisible({ timeout: 45000 });
}

test('1560. layout vrt. test pharmacies', async ({ page, browserName }) => {
  await test.step('Open product card and choose the first offer', async () => {
    await startProductCard(page);
    await clickFirstOffer(page, browserName);
  });

  await test.step('Authorize in the quick-order modal', async () => {
    await fillQuickOrderPhoneAndRequestSms(page, '0000000000');

    const codeInput = page.locator('.dialog .code-dialog__code-box input').first();
    await expect(codeInput).toBeVisible({ timeout: 45000 });
    await codeInput.click();
    await page.keyboard.type(getSmsCode(), { delay: browserName === 'firefox' ? 100 : 0 });

    await expect(page.locator('body .quick-order-modal__profile-data')).not.toHaveText('', { timeout: 45000 });
    await expect(page.locator('body .selected-pharmacy-title')).not.toHaveText('', { timeout: 45000 });
  });

  await test.step('Verify counter and price relation', async () => {
    const modal = page.locator('.dialog .quick-order-modal');
    const counter = page.locator('body .item-counter__wrapper');
    const plusButton = page.locator('.dialog .item-counter__change').last();
    const fullPrice = page.locator('body .medicines-item__price--full').first();
    const summaryPrice = page.locator('body .summary__price').first();

    await expect(counter).toHaveText('1', { timeout: 45000 });
    await expect(plusButton).toBeEnabled({ timeout: 15000 });
    await expect(fullPrice).toBeVisible({ timeout: 15000 });
    await expect(summaryPrice).toBeVisible({ timeout: 15000 });

    const initialPrice = parsePrice(await fullPrice.innerText());

    await plusButton.click();

    await expect(counter).toHaveText('2', { timeout: 15000 });
    await expect.poll(async () => parsePrice(await summaryPrice.innerText()), { timeout: 15000 })
      .toBeGreaterThan(initialPrice * 2 - 1);
    await expect.poll(async () => parsePrice(await summaryPrice.innerText()), { timeout: 15000 })
      .toBeLessThan(initialPrice * 2 + 1);

    await expect(modal).toHaveScreenshot('1560_layout_modal.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.15,
    });
  });

  await test.step('Capture pharmacy and order layouts', async () => {
    const modalBody = page.locator('.dialog .quick-order-modal__body');

    await modalBody.locator('.selected-pharmacy').click({ force: browserName === 'webkit' });
    await expect(modalBody).toHaveScreenshot('1560_layout_pharmacy.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.15,
    });

    await modalBody.locator('.medicines-item__info').click();
    await expect(modalBody).toHaveScreenshot('1560_layout_order.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.15,
    });
  });
});
