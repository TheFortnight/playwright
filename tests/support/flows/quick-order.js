const { expect } = require('@playwright/test');
const { dismissOverlays } = require('../utils/overlays');

const DEFAULT_PRODUCT_PATH = 'omsk/products/omez-20-mg-kapsuly-kishechnorastvorimye-30-sht-61149';

async function openQuickOrderBookingModalFromProductPage(page, {
  baseUrl,
  productPath = DEFAULT_PRODUCT_PATH,
  productTitle = /омез/i,
} = {}) {
  await page.goto(`${baseUrl}${productPath}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await dismissOverlays(page);

  const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
  if (await confirmCityButton.count()) {
    await confirmCityButton.click();
  }

  await expect(page.locator('body .good-card__title')).toHaveText(productTitle, {
    timeout: 30000,
  });
  await page.waitForLoadState('load', {
    timeout: 30000,
  });

  await page.waitForTimeout(1000);
  const listViewLink = page.locator('body .tab-switcher__button').last();
  await expect(listViewLink).toBeAttached({
    timeout: 30000,
  });
  await listViewLink.scrollIntoViewIfNeeded();
  await listViewLink.hover();
  await listViewLink.click();

  await expect(page.locator('body .search-result__card').first()).toBeVisible({
    timeout: 65000,
  });

  const bookButton = page.locator('body .order-btn').first();
  await expect(bookButton).toBeVisible({
    timeout: 30000,
  });
  await bookButton.scrollIntoViewIfNeeded();
  await bookButton.click();

  await expect(page.locator('.dialog .modal-container')).toBeVisible({
    timeout: 15000,
  });
}

async function fillQuickOrderPhoneAndRequestSms(page, phone) {
  await page.locator('#tel').fill(phone);
  await page.locator('body .agreement-wrapper .agreement-item:nth-child(2) .custom-checkbox').click();
  await page.locator('body .agreement-wrapper .agreement-item:nth-child(3) .custom-checkbox').click();
  await page.locator('.dialog .auth-form__code-btn').click();
}

module.exports = {
  DEFAULT_PRODUCT_PATH,
  fillQuickOrderPhoneAndRequestSms,
  openQuickOrderBookingModalFromProductPage,
};
