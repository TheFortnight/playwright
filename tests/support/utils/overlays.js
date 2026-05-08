async function dismissOverlays(page) {
  await page.evaluate(() => {
    document.querySelector('#toast-message-cookie')?.remove();
    document.querySelector('#cookie-popup')?.remove();
    document.querySelector('body .location-alert')?.remove();
    document.querySelector('#location-alert')?.remove();
  });

  await page.getByRole('button', { name: 'Да, я здесь' }).first().click({ timeout: 5000 }).catch(() => {});
}

module.exports = { dismissOverlays };
