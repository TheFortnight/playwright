const { test, expect, getBaseUrl, dismissOverlays, getSmsCode } = require('../../support/fixtures');

const baseUrl = getBaseUrl();
const PRODUCT_PATH = 'moscow/products/tetratsiklin-100-mg-tabletki-pokrytye-obolochkoy-20-sht-73297';

const offersGoodsBody = {
  pagination: {
    count: 1,
    total_count: 1,
    page: 1,
    total_pages: 1,
    next_page: {
      page: 2,
      take: 100,
      skip: 100,
    },
  },
  elements: [
    {
      offer: {
        price_per_first: 94000,
        total_quantity: 10,
        batches: [
          {
            price: 94000,
            quantity: 1,
          },
        ],
      },
      pharmacy: {
        id: 1145,
        title: 'Городская аптека',
        location: {
          full_address: 'г. Ипатово, ул. Ленинградская, 54',
          short_address: 'г. Ипатово, ул. Ленинградская, 54',
          region: 'Ставропольский край',
          area: 'Ставропольский',
          city: 'г. Ипатово',
          city_district: '',
          settlement: null,
          street: 'ул. Ленинградская',
          house: '54',
          block: '',
          entrance: '',
          floor: '',
          flat: '',
          office: '',
          metro: null,
          index: null,
          latitude: 45.7119,
          longitude: 42.9096,
        },
        schedule: {
          is_simple: true,
          timezone: 'Europe/Moscow',
          weekly: {
            is_working_only_on_weekdays: false,
            is_working_day_and_night: false,
            is_working_without_lunch: true,
            lunch_start_at: 0,
            lunch_end_at: 0,
            working_start_at: 480,
            working_end_at: 1200,
          },
          sunday: {
            is_working_day_and_night: false,
            is_working_without_lunch: true,
            is_day_off: false,
            lunch_start_at: 0,
            lunch_end_at: 0,
            working_start_at: 480,
            working_end_at: 1200,
          },
          monday: {
            is_working_day_and_night: false,
            is_working_without_lunch: true,
            is_day_off: false,
            lunch_start_at: 0,
            lunch_end_at: 0,
            working_start_at: 480,
            working_end_at: 1200,
          },
          tuesday: {
            is_working_day_and_night: false,
            is_working_without_lunch: true,
            is_day_off: false,
            lunch_start_at: 0,
            lunch_end_at: 0,
            working_start_at: 480,
            working_end_at: 1200,
          },
          wednesday: {
            is_working_day_and_night: false,
            is_working_without_lunch: true,
            is_day_off: false,
            lunch_start_at: 0,
            lunch_end_at: 0,
            working_start_at: 480,
            working_end_at: 1200,
          },
          thursday: {
            is_working_day_and_night: false,
            is_working_without_lunch: true,
            is_day_off: false,
            lunch_start_at: 0,
            lunch_end_at: 0,
            working_start_at: 480,
            working_end_at: 1200,
          },
          friday: {
            is_working_day_and_night: false,
            is_working_without_lunch: true,
            is_day_off: false,
            lunch_start_at: 0,
            lunch_end_at: 0,
            working_start_at: 480,
            working_end_at: 1200,
          },
          saturday: {
            is_working_day_and_night: false,
            is_working_without_lunch: true,
            is_day_off: false,
            lunch_start_at: 0,
            lunch_end_at: 0,
            working_start_at: 480,
            working_end_at: 1200,
          },
          days_off: [],
        },
        contacts: {
          emails: [],
          phones: [],
          links: [],
        },
        booking: {
          maximum_booking_time_in_minutes: 2160,
          maximum_booking_time_from_next_day_in_minutes: 0,
        },
        possibilities: {
          has_cash_payment: false,
          has_card_payment: false,
        },
        images: {
          main: null,
          other: [],
        },
        branding: {
          logo: 'https://cdn.phrm.tech:443/files/a78f8e3f-4c69-42f0-971e-78977bfc116d.png?file_id=13529781&hash=545BC4D368BB4A7F7305D62059912EF9&min_width=50&max_width=1740&min_height=50&max_height=1740&min_pixel_ratio=1&max_pixel_ratio=4&formats=png%2cwebp',
        },
      },
    },
  ],
};

const offersEstimatesBody = [
  {
    good_id: 22009,
    price: 29500,
    median_price: 29500,
    avg_price: 29767,
    min_price: 28600,
    max_price: 32500,
    rounded_median_price: 29500,
    rounded_avg_price: 29800,
    rounded_min_price: 28600,
    rounded_max_price: 32500,
    count_of_pharmacies_with_offer: 1,
  },
];

async function mockOffersEndpoints(page) {
  await page.route(/.*\/api\/v2\/partners\/offers\/goods(?:\?.*)?$/, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(offersGoodsBody),
    });
  });

  await page.route(/.*\/api\/v2\/partners\/offers\/estimates(?:\?.*)?$/, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(offersEstimatesBody),
    });
  });
}

async function loginByApi(page, phone = '0000000000') {
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

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });

  await expect(page.locator('body .auth-icon').first()).toBeVisible({ timeout: 25000 });
}

test.use({
  serviceWorkers: 'block',
});

test.setTimeout(120000);

test('1343. counter max mock', async ({ page }) => {
  await test.step('Mock offers endpoints before navigation', async () => {
    await mockOffersEndpoints(page);
  });

  await test.step('Open product card and authorize', async () => {
    await page.goto(`${baseUrl}${PRODUCT_PATH}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await dismissOverlays(page);

    const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
    if (await confirmCityButton.count()) {
      await confirmCityButton.click();
    }

    await expect(page.locator('body .good-card__title')).toHaveText(/тетрациклин/i, {
      timeout: 30000,
    });

    await loginByApi(page);
  });

  await test.step('Switch to list view and open booking dialog', async () => {
    await dismissOverlays(page);

    const listTab = page.locator('body .tab-switcher__button').last();
    await expect(listTab).toBeVisible({ timeout: 30000 });
    await listTab.hover();
    await listTab.click();

    const offerButton = page.locator('body phrm-goods-offers-list-view-card button, body .order-btn').first();

    await expect(offerButton).toBeVisible({ timeout: 65000 });
    await offerButton.click();

    await expect(page.locator('.dialog .modal-container, .dialog')).toBeVisible({ timeout: 15000 });
  });

  await test.step('Click plus until max tooltip appears', async () => {
    const plusButton = page.locator('.dialog .item-counter__change').last();

    await expect(plusButton).toBeVisible({ timeout: 15000 });

    for (let i = 0; i < 10; i++) {
      await plusButton.click();
    }

    await plusButton.click();

    await expect(page.locator('.dialog .phrm-tooltip__title-text')).toHaveText('Это все, что есть в выбранной аптеке', {
      timeout: 10000,
    });
  });
});
