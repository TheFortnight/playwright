const {
    test,
    expect
} = require('@playwright/test');
const {
    getBaseUrl
} = require('../../support/utils/env');
const {
    dismissOverlays
} = require('../../support/utils/overlays');
const {
    skipOnProductionForTags
} = require('../../support/utils/production-guard');

const baseUrl = getBaseUrl();
const tags = ['express'];

skipOnProductionForTags(tags);

test('1198. quick order short phone number', async ({
    page
}) => {
    await test.step('Search for a product and open the first card', async () => {
        await page.goto(`${baseUrl}omsk/catalog`, {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
        });

        await dismissOverlays(page);

        const locationAlert = page.locator('body .location-alert, #location-alert');
        const confirmCityButton = page.getByRole('button', {
            name: 'Да, я здесь'
        }).first();
        await expect(confirmCityButton).toBeVisible({ timeout: 15000 });
        await confirmCityButton.click();
        await expect(locationAlert).toBeHidden({ timeout: 15000 });

        const searchInput = page.locator('body .input-block');
        await expect(searchInput).toBeVisible({
            timeout: 15000
        });
        await searchInput.click();
        await searchInput.fill('но-шпа');
        await page.getByRole('button', { name: 'Найти' }).first().click();
        await expect(page.locator('body .card').first()).toBeVisible({
            timeout: 30000
        });

        const offersLink = page.getByRole('link', { name: /в \d+ аптеках/i }).first();
        await expect(offersLink).toBeVisible({
            timeout: 25000
        });
        await offersLink.scrollIntoViewIfNeeded();
        await offersLink.click();

    });

    await test.step('Switch to list view and open quick order', async () => {
        await expect(page.locator('body .tab-switcher__button').last()).toBeVisible({
            timeout: 65000
        });
        await listViewLink.click();
        await expect(page.locator('body .search-result__card').first()).toBeVisible({
            timeout: 65000
        });

        const bookButton = page.locator('body .order-btn').first();
        await expect(bookButton).toBeVisible({
            timeout: 30000
        });
        await bookButton.scrollIntoViewIfNeeded();
        await bookButton.click();

        await expect(page.locator('.dialog .modal-container')).toBeVisible({
            timeout: 15000
        });
    });

    await test.step('Validate short phone error and active input', async () => {
        await page.locator('#tel').click();
        await page.locator('#tel').fill('00000000');
        await expect(page.locator('#tel')).toBeFocused();
        await expect.poll(async () => page.locator('#tel').evaluate((input) => input.selectionStart)).toBe(15);
        await expect.poll(async () => page.locator('#tel').evaluate((input) => input.selectionEnd)).toBe(15);

        await page.locator('body .agreement-wrapper .agreement-item:nth-child(2) .custom-checkbox').click();
        await page.locator('body .agreement-wrapper .agreement-item:nth-child(3) .custom-checkbox').click();
        await page.locator('.dialog .auth-form__code-btn').click();

        const phoneError = page.locator('.dialog .form-group__label');
        await expect(phoneError).toHaveText('Введите номер полностью', {
            timeout: 5000
        });
    });
});