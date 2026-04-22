const { test, expect } = require('@playwright/test');
const { dismissOverlays } = require('../support/utils/overlays');
const { loginWithSms } = require('../support/flows/auth');

const TEL = '0000000000';

async function startPortal(page) {
  await page.goto('/omsk', { waitUntil: 'load', timeout: 30000 });
  await expect(page.locator('body .statistics')).toBeVisible({ timeout: 10000 });
  await dismissOverlays(page);
}

async function openProfilePopover(page) {
  await page.evaluate(() => {
    const dropdown = document.querySelector('body .header-top-right .dropdown');
    if (dropdown) dropdown.style.display = 'block';
  });
  await expect(page.locator('body .header-top-right .menu__link--promo-event')).toBeVisible({ timeout: 5000 });
}

test('5660. Точки входа', async ({ page }) => {
  await test.step('Step 1. Banner in header', async () => {
    await startPortal(page);
    await dismissOverlays(page);

    const headerPromo = page.locator('body .header-nav .menu__item').first();
    await expect(headerPromo).toHaveText('Акции');
    await page.waitForTimeout(1500);
    await dismissOverlays(page);
    await expect(headerPromo).toHaveScreenshot('5660-promo-entry-point-header.png', {
      maxDiffPixelRatio: 0.1,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  await test.step('Step 2. Promo in popover', async () => {
    await loginWithSms(page, TEL);
    await openProfilePopover(page);

    const popoverPromo = page.locator('body .header-top-right .menu__link--promo-event');
    await expect(popoverPromo.locator('span')).toHaveText('Акции');
    await expect(popoverPromo).toHaveScreenshot('5660-promo-entry-point-popover-menu.png', {
      maxDiffPixelRatio: 0.1,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  await test.step('Step 3. Popover order', async () => {
    const items = await page.locator('body .header-top-right .dropdown .menu__item').allTextContents();
    const normalized = items.map(text => text.trim());
    const notificationIndex = normalized.findIndex(text => text.includes('Настройки уведомлений'));
    const promotionsIndex = normalized.findIndex(text => text.includes('Акции'));
    const referralIndex = normalized.findIndex(text => text.includes('Приглашайте друзей'));

    expect(notificationIndex).toBeGreaterThan(-1);
    expect(promotionsIndex).toBeGreaterThan(-1);
    expect(referralIndex).toBeGreaterThan(-1);
    expect(notificationIndex).toBeLessThan(promotionsIndex);
    expect(promotionsIndex).toBeLessThan(referralIndex);
  });

  await test.step('Step 4. Promo in profile menu', async () => {
    await page.goto('/profile', { waitUntil: 'load', timeout: 30000 });
    const profilePromo = page.locator('body .profile-sidebar .menu__link--promo-event');
    await expect(profilePromo).toBeVisible({ timeout: 15000 });
    await expect(profilePromo).toHaveScreenshot('5660-promo-entry-point-profile-menu.png', {
      maxDiffPixelRatio: 0.1,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  await test.step('Step 5. Profile order', async () => {
    const items = await page.locator('body .profile-sidebar .menu__item').allTextContents();
    const normalized = items.map(text => text.trim());
    const notificationIndex = normalized.findIndex(text => text.includes('Настройки уведомлений'));
    const promotionsIndex = normalized.findIndex(text => text.includes('Акции'));
    const referralIndex = normalized.findIndex(text => text.includes('Приглашайте друзей'));

    expect(notificationIndex).toBeGreaterThan(-1);
    expect(promotionsIndex).toBeGreaterThan(-1);
    expect(referralIndex).toBeGreaterThan(-1);
    expect(notificationIndex).toBeLessThan(promotionsIndex);
    expect(promotionsIndex).toBeLessThan(referralIndex);
  });
});
