const {
  test,
  expect,
  getBaseUrl,
  getSmsCode,
  skipOnProductionForTags,
} = require('../../support/fixtures');
const {
  fillQuickOrderPhoneAndRequestSms,
  openQuickOrderBookingModalFromProductPage,
} = require('../../support/flows/quick-order');

const baseUrl = getBaseUrl();
const tags = ['express', 'test'];

skipOnProductionForTags(tags);

test.use({
  serviceWorkers: 'block',
});

test('1558. successfull order close', async ({ page, browserName }) => {
  await test.step('Open quick order booking modal', async () => {
    await openQuickOrderBookingModalFromProductPage(page, { baseUrl });
  });

  await test.step('Authorize by phone and SMS code', async () => {
    await page.locator('#tel').click();
    await fillQuickOrderPhoneAndRequestSms(page, '1111111111');

    const codeInput = page.locator('.dialog .code-dialog__code-box input').first();
    await expect(codeInput).toBeVisible({ timeout: 45000 });
    await codeInput.click();
    await page.keyboard.type(getSmsCode(), { delay: browserName === 'firefox' ? 100 : 0 });
  });

  await test.step('Submit order, close success toast, and verify it disappears', async () => {
    const bookButton = page.locator('.dialog .quick-order-modal__footer button').first();

    await expect(bookButton).toBeVisible({ timeout: 45000 });
    await bookButton.click();

    await expect(page.locator('body .spin-circle')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.dialog .modal-container')).not.toBeVisible({ timeout: 15000 });

    const toast = page.locator('body .toast-message');
    await expect(toast).toBeVisible({ timeout: 15000 });
    await expect(toast).toContainText('Ваш заказ принят в работу', {
      timeout: 15000,
    });

    await page.locator('body .toast-message .close-btn').click();
    await expect(toast).not.toBeVisible({ timeout: 10000 });
  });
});
