const { getSmsCode } = require('../utils/sms-code');

async function createDraftAPI(page, { baseUrl, prodId = 22009, quantity = 1 } = {}) {
  const sessionId = (await page.context().cookies()).find(({ name }) => name === 'sessionId')?.value;
  const deviceId = await page.evaluate(() => localStorage.getItem('deviceId'));

  const draftBody = {
    need_clear_cart_after_close: true,
    location: {
      latitude: 54.989347,
      longitude: 73.368221,
    },
    region: {
      city_id: '5bc02d11-88d6-41eb-80e2-c909ed0d9711',
      agglomeration_id: '9517677c-d447-4511-8482-f8c5d22bdd72',
    },
    positions: [{
      good_id: prodId,
      quantity,
      id: prodId,
      slug: 'trikhopol-250-mg-tabletki-20-sht-71433',
      composite_name: 'Трихопол, 250 мг, таблетки, 20 шт.',
      group: {
        id: 24762,
        name: 'Производные имидазола',
        slug: 'proizvodnye-imidazola-1',
        need_show_children: false,
        parents_by_ascending: [{
          id: 15940,
          name: 'Антибиотики',
          slug: 'antibiotiki',
        }, {
          id: 15971,
          name: 'Лекарственные средства',
          slug: 'lekarstvennye-sredstva',
        }],
        parents_by_descending: [{
          id: 15971,
          name: 'Лекарственные средства',
          slug: 'lekarstvennye-sredstva',
        }, {
          id: 15940,
          name: 'Антибиотики',
          slug: 'antibiotiki',
        }],
      },
      images: {
        main: 'https://cdn.phrm.tech:443/files/f82c059f-3177-4627-8e45-1d70a9ada95c.jpeg?file_id=5362221&hash=17010318306D0D0CA616F9EFFC5353B8&min_width=50&max_width=700&min_height=50&max_height=700&min_pixel_ratio=1&max_pixel_ratio=4&formats=png%2cwebp%2cjpeg',
        other: ['https://cdn.phrm.tech:443/files/e11f41b8-199d-4735-bd9f-ec6b6f6a1da1.jpeg?file_id=5362226&hash=550A8C5B8194D7EE188438BB43B2DE03&min_width=50&max_width=700&min_height=50&max_height=700&min_pixel_ratio=1&max_pixel_ratio=4&formats=png%2cwebp%2cjpeg', 'https://cdn.phrm.tech:443/files/d0e1310e-d093-475d-97ce-98a958e71f84.jpeg?file_id=5362227&hash=9EC9B1C7886C2D317A8BCF4B6614DF57&min_width=50&max_width=700&min_height=50&max_height=700&min_pixel_ratio=1&max_pixel_ratio=4&formats=png%2cwebp%2cjpeg', 'https://cdn.phrm.tech:443/files/4ec1fa72-497c-4130-a3d7-12dde4030e75.jpeg?file_id=5362239&hash=5A252A343A01DCDE2CA8EB82D46CF55C&min_width=50&max_width=700&min_height=50&max_height=700&min_pixel_ratio=1&max_pixel_ratio=4&formats=png%2cwebp%2cjpeg'],
      },
      flags: {
        is_new: false,
        is_original: false,
        is_recommended: false,
        need_prescription: true,
        is_main_in_stack: true,
        is_main_in_search_stack: true,
        is_main_in_variation_stack: true,
      },
      value: {
        grade: {
          code: 1,
          slug: 'no_score',
          value: 'Нет оценки',
        },
        score: 3.2,
        indexes: {
          manufacturer_confidence: {
            code: 0,
            slug: 'no_data',
            value: 'Нет данных',
          },
          sales_amount: {
            code: 2,
            slug: 'approved',
            value: 'Одобренный',
          },
          price: {
            code: 2,
            slug: 'approved',
            value: 'Одобренный',
          },
          distribution: {
            code: 2,
            slug: 'approved',
            value: 'Одобренный',
          },
        },
      },
      name: {
        id: 49572,
        value: 'Трихопол',
      },
      form: {
        id: 1081,
        value: 'Таблетки',
      },
      general_property: null,
      packing: {
        id: 407,
        value: 'Блистер',
      },
      amount: {
        id: 137,
        value: '20 шт.',
      },
      dosage: {
        id: 3821,
        value: '250 мг',
      },
      volume: null,
      comment: null,
      manufacturer: {
        id: 3702,
        name: 'Polpharma',
        wiki_data_link: null,
      },
      country: {
        id: 53,
        value: 'Польша',
      },
      atc: null,
      stack: {
        id: 30139,
        number_of_goods: 2,
        name: {
          id: 49572,
          value: 'Трихопол',
        },
        manufacturer: {
          id: 3702,
          name: 'Polpharma',
          wiki_data_link: null,
        },
      },
      search_stack: {
        id: 17906,
        number_of_goods: 1,
        name: {
          id: 49572,
          value: 'Трихопол',
        },
        manufacturer: {
          id: 3702,
          name: 'Polpharma',
          wiki_data_link: null,
        },
        form: {
          id: 1081,
          value: 'Таблетки',
        },
        dosage: {
          id: 3821,
          value: '250 мг',
        },
      },
      value_stack: {
        id: 388,
      },
      variation_stack: {
        id: 30139,
        number_of_goods: 2,
        name: {
          id: 49572,
          value: 'Трихопол',
        },
        manufacturer: {
          id: 3702,
          name: 'Polpharma',
          wiki_data_link: null,
        },
      },
      inns: [{
        id: 552,
        value: 'Метронидазол',
      }],
      available_count_of_pharmacies_with_offer: 1744,
      average_price: 9900,
      min_price: 7900,
      max_price: 11119,
      disabled: false,
    }],
  };

  const headers = {};

  if (sessionId) {
    headers['Session-Id'] = sessionId;
  }

  if (deviceId) {
    headers['Device-Id'] = deviceId;
  }

  const postDraft = (draftHeaders) => page.context().request.post(`${baseUrl}api/api_151/orders/draft`, {
    data: draftBody,
    headers: draftHeaders,
  });

  let response = await postDraft(headers);

  if (((response.status() === 401 || response.status() === 403) || (response.status() === 422 && (await response.text()).includes('NO_ACTIVE_SESSION_AND_NOT_AUTH'))) && !sessionId) {
    const authRequestResponse = await page.context().request.post(`${baseUrl}api/v2/auth/phone/code/request`, {
      data: {
        phone: 71111111111,
        smart_captcha_token: null,
      },
      headers: {
        'X-Platform': 'Mobile',
      },
    });

    if (!authRequestResponse.ok()) {
      const responseText = await authRequestResponse.text();
      throw new Error(`Failed to request auth code: ${authRequestResponse.status()} ${authRequestResponse.statusText()} ${responseText}`);
    }

    const { verification_id: verificationId } = await authRequestResponse.json();

    if (!verificationId) {
      throw new Error('Failed to request auth code: missing verification_id');
    }

    const authCompleteResponse = await page.context().request.post(`${baseUrl}api/v2/auth/phone/code/complete`, {
      data: {
        verification_id: verificationId,
        code: getSmsCode(),
      },
      headers: {
        'X-Platform': 'Mobile',
      },
    });

    if (!authCompleteResponse.ok()) {
      const responseText = await authCompleteResponse.text();
      throw new Error(`Failed to complete auth: ${authCompleteResponse.status()} ${authCompleteResponse.statusText()} ${responseText}`);
    }

    const authCompleteData = await authCompleteResponse.json();
    const accessToken = authCompleteData.access?.value || authCompleteData.access?.token || authCompleteData.access;

    if (!accessToken) {
      throw new Error('Failed to complete auth: missing access token');
    }

    response = await postDraft({
      ...headers,
      Authorization: `Bearer ${accessToken}`,
    });
  }

  if (!response.ok()) {
    const responseText = await response.text();
    throw new Error(`Failed to create draft: ${response.status()} ${response.statusText()} ${responseText}`);
  }

  const draft = await response.json();
  return draft.id;
}

module.exports = { createDraftAPI };
