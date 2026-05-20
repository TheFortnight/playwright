const { test, expect, getBaseUrl, dismissOverlays, getSmsCode } = require('../support/fixtures');

const baseUrl = getBaseUrl();

test('1242. successful auth from any page', async ({ page }) => {
  await page.goto(`${baseUrl}omsk/catalog/zheludochno-kishechnye-sredstva`, {
    waitUntil: 'load',
    timeout: 30000,
  });

  await dismissOverlays(page);

  const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
  if (await confirmCityButton.count()) {
    await confirmCityButton.click();
  }

  await expect(page.locator('body .card').first()).toBeVisible({ timeout: 25000 });

  const sessionId = (await page.context().cookies()).find(({ name }) => name === 'sessionId')?.value;
  const deviceId = await page.evaluate(() => localStorage.getItem('deviceId'));

  const headers = { 'X-Platform': 'Mobile' };

  if (sessionId) {
    headers['Session-Id'] = sessionId;
  }

  if (deviceId) {
    headers['Device-Id'] = deviceId;
  }

  const authRequestResponse = await page.context().request.post(`${baseUrl}api/v2/auth/phone/code/request`, {
    data: {
      phone: 71111111111,
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
  const token = {
    access: authCompleteData.access,
    refresh: authCompleteData.refresh,
  };

  await page.evaluate((value) => {
    localStorage.setItem('token', JSON.stringify(value));
  }, token);

  await page.reload({ waitUntil: 'load', timeout: 30000 });

  await expect(page.locator('body .auth-icon').first()).toBeVisible({ timeout: 25000 });
});
