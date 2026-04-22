const { test, expect } = require('@playwright/test');
const { dismissOverlays } = require('../support/utils/overlays');

test('1181. sign in form with active number input', async ({ page }) => {
  await page.goto('/omsk', { waitUntil: 'load', timeout: 30000 });

  await dismissOverlays(page);

  const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' });
  if (await confirmCityButton.count()) {
    await confirmCityButton.click();
  }

  const signInButton = page.getByRole('button', { name: 'Войти' }).first();
  await expect(signInButton).toBeVisible({ timeout: 15000 });
  await signInButton.click();

  const modal = page.locator('.dialog .modal-container');
  await expect(modal).toBeVisible({ timeout: 15000 });

  await page.locator('#tel').click();
  await expect(page.locator('#tel')).toBeFocused();

  await expect(modal).toHaveScreenshot('1181_active_input.png', {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.05,
  });
});
