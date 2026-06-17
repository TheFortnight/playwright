const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');
const { createDraftAPI } = require('../support/flows/basket');
const { getSmsCode } = require('../support/utils/sms-code');

const baseUrl = getBaseUrl();

async function readTrimmedText(locator) {
  return (await locator.innerText()).replace(/\s+/g, ' ').trim();
}

test('1416. basket map pharmacy choose compare info live', async ({ page }) => {
  test.setTimeout(120000);
  let draftId;

  await test.step('Seed basket and open choose-pharmacy page', async () => {
    await page.addInitScript(() => {
      localStorage.setItem('region', JSON.stringify({
        id: '5bc02d11-88d6-41eb-80e2-c909ed0d9711',
        status: 'core',
        slug: 'omsk',
        name: 'Омск',
        is_active: true,
        longitude: 73.368221,
        latitude: 54.989347,
        timezone: 'Asia/Omsk',
        pharmacies_count: 323,
        name_cases: {
          name_i: 'Омск',
          name_r: 'Омска',
          name_d: 'Омску',
          name_v: 'Омск',
          name_t: 'Омском',
          name_p: 'Омске',
        },
        agglomeration: {
          id: '9517677c-d447-4511-8482-f8c5d22bdd72',
          slug: 'omsk-agglomeration',
          name: 'Омск',
          is_active: true,
          name_cases: {
            name_i: 'Омск',
            name_r: 'Омска',
            name_d: 'Омску',
            name_v: 'Омск',
            name_t: 'Омском',
            name_p: 'Омске',
          },
        },
      }));
    });

    await page.goto(`${baseUrl}omsk/catalog/zheludochno-kishechnye-sredstva`, {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });

    await dismissOverlays(page);

    const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
    if (await confirmCityButton.count()) {
      await confirmCityButton.click();
    }

    draftId = await createDraftAPI(page, { baseUrl, prodId: 38960 });

    await page.goto(`${baseUrl}checkout/basket/${draftId}/select-pharmacy`, {
      waitUntil: 'load',
      timeout: 30000,
    });

    await dismissOverlays(page);

    await expect(page).toHaveURL(/\/checkout\/basket\/.*\/select-pharmacy(?:$|[?#])/, { timeout: 30000 });
    await expect(page.locator('.pharmacy-offer__title')).toContainText('В какой аптеке вы заберете заказ?', { timeout: 20000 });
    await expect(page.locator('#map')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .pharmacy-filters__switch')).toBeVisible({ timeout: 45000 });
  });

  await test.step('Open the first map offer and capture pharmacy data', async () => {
    const selectFirstOrderBtn = page.locator('#selectFirstOrderBtn');
    const popupNameLocator = page.locator('body .drug-store-map-popup__name');

    await expect(selectFirstOrderBtn).toBeAttached({ timeout: 30000 });
    await expect(page.locator('body .zoom__plus-btn')).toBeVisible({ timeout: 15000 });

    let popupOpened = false;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      if (await page.locator('body .loading-container').count()) {
        await page.locator('body .loading-container').evaluate((node) => node.remove());
      }

      await selectFirstOrderBtn.evaluate((node) => node.click());

      await expect(page.locator('body .popup')).toBeAttached({ timeout: 20000 });

      try {
        await expect(popupNameLocator).toBeVisible({ timeout: 20000 });
        popupOpened = true;
        break;
      } catch (error) {
        if (attempt === 3) {
          throw error;
        }
      }
    }

    expect(popupOpened).toBeTruthy();

    const popupName = await readTrimmedText(page.locator('body .drug-store-map-popup__name'));
    const popupAddress = await readTrimmedText(page.locator('body .drug-store-map-popup__adress'));
    const popupSchedule = await readTrimmedText(page.locator('body .drug-store-map-popup__schedule'));
    const popupPrice = await readTrimmedText(page.locator('body .drug-store-map-popup-price'));

    expect(popupName).not.toBe('');
    expect(popupAddress).not.toBe('');
    expect(popupSchedule).not.toBe('');
    expect(popupPrice).not.toBe('');

    await page.locator('body .appToBasket').click({ timeout: 15000 });
    await expect(page.locator('#tel')).toBeVisible({ timeout: 15000 });
    await page.locator('#tel').fill('0000000000');
    await page.locator('body .agreement-wrapper .agreement-item:nth-child(2) .custom-checkbox').click();
    await page.locator('body .agreement-wrapper .agreement-item:nth-child(3) .custom-checkbox').click();
    await page.locator('.dialog .auth-form__code-btn').click();

    const codeInput = page.locator('.dialog .code-dialog__code-box input').first();
    await expect(codeInput).toBeVisible({ timeout: 45000 });
    await codeInput.click();
    await page.keyboard.type(getSmsCode(), { delay: 100 });
    await expect(page.locator('body .dialog')).toBeHidden({ timeout: 45000 });

    await expect(page.locator('body .order-step--third').first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('body .selected-pharmacy__name')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .selected-pharmacy__address')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .selected-pharmacy__schedule')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .selected-pharmacy__payment')).not.toHaveText('', { timeout: 15000 });
    await expect(page.locator('body .summary__price')).toBeVisible({ timeout: 15000 });

    expect(await readTrimmedText(page.locator('body .selected-pharmacy__name'))).toBe(popupName);
    expect(await readTrimmedText(page.locator('body .selected-pharmacy__address'))).toBe(popupAddress);
    expect(await readTrimmedText(page.locator('body .selected-pharmacy__schedule'))).toBe(popupSchedule);
    expect(await readTrimmedText(page.locator('body .summary__price'))).toBe(popupPrice);
  });
});
