const {
  test,
  expect,
  getBaseUrl,
  openBasketAuthModal,
} = require('../support/fixtures');

const baseUrl = getBaseUrl();

test('1249. authorization from basket with shorter phone number', async ({ page }) => {
  await openBasketAuthModal(page, baseUrl);

  await page.locator('#tel').click();
  await page.locator('#tel').fill('913');
  await page.locator('body .agreement-wrapper .agreement-item:nth-child(2) .custom-checkbox').click();
  await page.locator('body .agreement-wrapper .agreement-item:nth-child(3) .custom-checkbox').click();
  await page.locator('.dialog .auth-form__code-btn').click();

  await expect(page.locator('.dialog .form-group__label')).toHaveText('Введите номер полностью', {
    timeout: 5000,
  });
});
