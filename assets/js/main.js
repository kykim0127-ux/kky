/* ===========================================================
   물마루 (Mulmaru) — 제주 탑동 카페 랜딩페이지
   -----------------------------------------------------------
   1) 좌표 · 경로 설정 (CONFIG)
   2) 오늘의 일몰 계산 위젯
   3) 메뉴 렌더링 + 탭 필터
   4) Leaflet 지도 : 공항 → 카페 경로
   =========================================================== */

/* -----------------------------------------------------------
   1) CONFIG — 실제 개업 시 이 블록의 값만 바꾸면 됩니다.
   ----------------------------------------------------------- */
const CONFIG = {
  cafe: {
    name: '물마루 MULMARU',
    place: '제주더큰내일센터 1층',
    address: '제주특별자치도 제주시 탑동로 55',
    // ※ 대략 좌표입니다. 정확한 값으로 교체하세요.
    latlng: [33.5165, 126.5220]
  },
  airport: {
    name: '제주국제공항',
    place: '국내선 도착층 (1층) 앞',
    latlng: [33.5064, 126.4936]
  },
  map: {
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 기여자',
    maxZoom: 19
  }
};

/* 이동 수단별 경로 (도로를 따라간 근사 경로) */
const ROUTES = [
  {
    id: 'taxi',
    name: '택시 · 렌터카',
    time: '약 15분',
    color: '#F5821F',
    desc: '공항 진입로 → 용문로 → 서해안로 → 임항로 → 탑동로. 요금 약 7,000원 내외(택시). 탑동 공영주차장에 주차 후 도보 2분.',
    stops: [
      { latlng: [33.5085, 126.4941], label: '공항 택시 승강장' },
      { latlng: [33.5158, 126.5188], label: '탑동로 진입' }
    ],
    path: [
      [33.5064, 126.4936],
      [33.5083, 126.4940],
      [33.5096, 126.4958],
      [33.5106, 126.4996],
      [33.5117, 126.5034],
      [33.5131, 126.5077],
      [33.5145, 126.5124],
      [33.5152, 126.5158],
      [33.5158, 126.5190],
      [33.5163, 126.5211],
      [33.5165, 126.5220]
    ]
  },
  {
    id: 'bus',
    name: '시내버스',
    time: '약 30분',
    color: '#14607D',
    desc: '공항 3번 게이트 앞 정류장에서 시내 방면 버스 탑승 → 「제주항 여객터미널 / 탑동」 하차 → 도보 5분. 카드 1,150원.',
    stops: [
      { latlng: [33.5078, 126.4924], label: '제주국제공항 정류장' },
      { latlng: [33.5124, 126.5065], label: '중간 경유 · 해안 방면' },
      { latlng: [33.5155, 126.5203], label: '탑동 정류장 하차' }
    ],
    path: [
      [33.5064, 126.4936],
      [33.5078, 126.4924],
      [33.5091, 126.4950],
      [33.5102, 126.4990],
      [33.5112, 126.5028],
      [33.5124, 126.5065],
      [33.5136, 126.5106],
      [33.5147, 126.5150],
      [33.5155, 126.5203],
      [33.5165, 126.5220]
    ]
  },
  {
    id: 'walk',
    name: '해안 산책 코스',
    time: '약 55분 · 4.2km',
    color: '#4A4640',
    dash: '6, 8',
    desc: '시간 여유가 있다면 용담 해안도로를 따라 걸어보세요. 도두봉 방향 바다를 오른쪽에 두고 계속 직진하면 탑동에 닿습니다.',
    stops: [
      { latlng: [33.5116, 126.4903], label: '용담 해안도로 시작' },
      { latlng: [33.5152, 126.5060], label: '서부두 방파제' }
    ],
    path: [
      [33.5064, 126.4936],
      [33.5082, 126.4917],
      [33.5100, 126.4900],
      [33.5116, 126.4903],
      [33.5128, 126.4938],
      [33.5138, 126.4980],
      [33.5146, 126.5018],
      [33.5152, 126.5060],
      [33.5156, 126.5105],
      [33.5159, 126.5152],
      [33.5162, 126.5195],
      [33.5165, 126.5220]
    ]
  }
];

/* 메뉴 데이터 */
const MENU = [
  {
    cat: 'signature',
    name: '귤림추색 말차',
    en: 'Tangerine Matcha',
    price: '7,000',
    desc: '서귀포 유기농 말차 위에 애월 감귤청을 층으로 얹었습니다. 젓는 순간 초록에서 주황으로 번지는 색이 영주십경 「귤림추색」을 닮았습니다.',
    tag: '가장 많이 찍히는 잔',
    sig: true
  },
  {
    cat: 'signature',
    name: '숨비소리 소금 커피',
    en: 'Sumbi Salt Coffee',
    price: '6,800',
    desc: '해녀가 물 위로 올라와 내쉬는 숨소리에서 이름을 땄습니다. 구좌 천일염 크림을 올린 콜드브루 — 첫 모금은 짜고, 두 번째부터 답니다.',
    tag: '짠맛 → 단맛 2단 구성',
    sig: true
  },
  {
    cat: 'signature',
    name: '탑동 일몰 에이드',
    en: 'Topdong Sunset Ade',
    price: '7,500',
    desc: '히비스커스와 한라봉, 청귤을 층층이 쌓아 잔 안에 일몰을 만듭니다. 창밖 수평선과 나란히 놓고 마시는 것이 정석입니다.',
    tag: '골든아워 한정 잔 제공',
    sig: true
  },
  {
    cat: 'signature',
    name: '돌하르방 흑임자 라떼',
    en: 'Dolhareubang Latte',
    price: '6,500',
    desc: '제주 흑임자를 볶아 갈아 넣고, 현무암 모양으로 얼린 얼음을 띄웁니다. 얼음이 녹을수록 색이 짙어집니다.',
    tag: '현무암 아이스 큐브',
    sig: true
  },
  {
    cat: 'tea',
    name: '말테우리 밀크티',
    en: 'Maltewuri Milk Tea',
    price: '6,500',
    desc: '한라산 중산간에서 말을 몰던 사람을 제주어로 「말테우리」라 부릅니다. 흑당과 제주 우유를 오래 끓여 진하게 냈습니다.'
  },
  {
    cat: 'tea',
    name: '바람코지 청귤 소다',
    en: 'Windy Cape Soda',
    price: '6,000',
    desc: '바람이 세게 부는 곶을 뜻하는 「바람코지」. 덜 익은 청귤을 통째로 짜 넣어 끝맛이 서늘합니다.'
  },
  {
    cat: 'tea',
    name: '백록담 안개차',
    en: 'Baengnokdam Mist',
    price: '6,800',
    desc: '제주 녹차에 페퍼민트와 유채꿀을 더하고, 드라이아이스로 안개를 피워 냅니다. 잔을 여는 순간 백록담 능선의 운무가 흘러나옵니다.'
  },
  {
    cat: 'tea',
    name: '동백꽃 지는 오후',
    en: 'Camellia Afternoon',
    price: '6,300',
    desc: '히비스커스와 로즈힙을 우린 붉은 차. 식용 동백 꽃잎 한 장이 천천히 가라앉습니다.'
  },
  {
    cat: 'coffee',
    name: '사라봉 싱글오리진',
    en: 'Sarabong Single Origin',
    price: '6,000',
    desc: '탑동에서 가장 가까운 오름의 이름을 붙인 이달의 원두. 매장 뒤편에서 3일에 한 번 직접 로스팅합니다.',
    tag: '원두 200g 12,000원'
  },
  {
    cat: 'coffee',
    name: '우도 땅콩 아인슈페너',
    en: 'Udo Peanut Einspänner',
    price: '7,200',
    desc: '우도 땅콩을 볶아 만든 크림을 두껍게 올렸습니다. 젓지 말고 크림을 통과해 마시는 것이 정석입니다.'
  },
  {
    cat: 'coffee',
    name: '유채 허니 아메리카노',
    en: 'Canola Honey Americano',
    price: '5,800',
    desc: '봄 유채밭에서 딴 꿀을 한 스푼. 설탕 없이도 뒷맛이 길게 답니다.'
  },
  {
    cat: 'coffee',
    name: '물마루 블렌드',
    en: 'Mulmaru Blend',
    price: '5,000',
    desc: '수평선처럼 평평하게 균형 잡힌 기본 블렌드. 이 잔이 맛있으면 다른 잔도 믿으셔도 됩니다.'
  },
  {
    cat: 'dessert',
    name: '오메기 티라미수',
    en: 'Omegi Tiramisu',
    price: '8,000',
    desc: '제주 전통 떡 오메기떡을 마스카포네 사이에 눌러 넣고, 팥고물 대신 말차 가루를 덮었습니다.',
    tag: '하루 20개 한정',
    sig: true
  },
  {
    cat: 'dessert',
    name: '먹돌 스콘',
    en: 'Black Stone Scone',
    price: '5,500',
    desc: '대나무 숯을 넣어 새까맣게 구운 스콘. 갈라진 단면이 현무암 구멍을 닮았습니다. 감귤 커드와 함께 냅니다.'
  },
  {
    cat: 'dessert',
    name: '감태 솔티드 초콜릿',
    en: 'Gamtae Salted Chocolate',
    price: '4,500',
    desc: '제주 바다에서 자란 감태를 갈아 넣은 다크 초콜릿. 바다 향이 먼저 오고 카카오가 뒤따릅니다.'
  },
  {
    cat: 'dessert',
    name: '빙떡 크로플',
    en: 'Binteok Croffle',
    price: '6,500',
    desc: '메밀 빙떡을 크로플로 눌러 구웠습니다. 안에는 구좌 당근 무채, 위에는 유채꿀.'
  }
];

/* -----------------------------------------------------------
   2) 오늘의 일몰 계산 (NOAA 근사식)
   ----------------------------------------------------------- */
function calcSunset(date, lat, lng) {
  const rad = Math.PI / 180;
  // 오늘 날짜(현지 정오 기준)의 통일된 일수를 구한다.
  const localNoon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  const jdNoon = localNoon.getTime() / 86400000 + 2440587.5;
  const n = Math.round(jdNoon - 2451545.0 + 0.0008);
  const jStar = n - lng / 360; // 동경(+126.52)일수록 태양 남중이 이르다

  const M = (357.5291 + 0.98560028 * jStar) % 360;
  const C = 1.9148 * Math.sin(M * rad) +
            0.0200 * Math.sin(2 * M * rad) +
            0.0003 * Math.sin(3 * M * rad);
  const lambda = (M + C + 180 + 102.9372) % 360;

  const jTransit = 2451545.0 + jStar +
                   0.0053 * Math.sin(M * rad) -
                   0.0069 * Math.sin(2 * lambda * rad);

  const sinDec = Math.sin(lambda * rad) * Math.sin(23.44 * rad);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosOmega = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * sinDec) /
                   (Math.cos(lat * rad) * cosDec);

  if (cosOmega < -1 || cosOmega > 1) return null; // 백야/극야 (제주에선 발생하지 않음)

  const omega = Math.acos(cosOmega) / rad;
  const jSet = jTransit + omega / 360;

  return new Date((jSet - 2440587.5) * 86400000);
}

function fmtTime(d) {
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function renderSunset() {
  const elTime = document.getElementById('sunsetTime');
  const elNote = document.getElementById('sunsetNote');
  const elBadge = document.getElementById('sunsetBadge');
  if (!elTime) return;

  const now = new Date();
  const sunset = calcSunset(now, CONFIG.cafe.latlng[0], CONFIG.cafe.latlng[1]);

  if (!sunset) {
    elTime.textContent = '—';
    elNote.textContent = '일몰 시각을 불러오지 못했습니다.';
    return;
  }

  const golden = new Date(sunset.getTime() - 30 * 60000);
  const close = new Date(sunset.getTime() + 60 * 60000);

  elTime.textContent = fmtTime(sunset);

  const diffMin = Math.round((sunset - now) / 60000);
  let note;
  if (diffMin > 60) {
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    note = `해가 지기까지 ${h}시간 ${m}분 남았습니다. 골든아워는 ${fmtTime(golden)}부터.`;
  } else if (diffMin > 0) {
    note = `해가 지기까지 ${diffMin}분. 지금 오시면 수평선을 정면에서 보십니다.`;
  } else if (now < close) {
    note = `오늘의 해는 졌습니다. 마감은 ${fmtTime(close)} — 아직 자리가 있습니다.`;
  } else {
    note = `오늘 영업은 ${fmtTime(close)}에 마감했습니다. 내일 08:00에 다시 엽니다.`;
  }
  elNote.textContent = note;

  const inGolden = now >= golden && now <= sunset;
  elBadge.textContent = inGolden
    ? `🕯️ 지금 골든아워 · 아메리카노 30% 할인 중`
    : `🕯️ 골든아워 ${fmtTime(golden)}–${fmtTime(sunset)} · 아메리카노 –30%`;
}

/* -----------------------------------------------------------
   3) 메뉴 렌더링 + 탭 필터
   ----------------------------------------------------------- */
function renderMenu(cat) {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;

  const list = cat === 'all' ? MENU : MENU.filter(m => m.cat === cat);

  grid.innerHTML = list.map((m, i) => `
    <article class="menu-item" style="animation-delay:${i * 40}ms">
      ${m.sig ? '<span class="sig">SIGNATURE</span>' : ''}
      <h3>${m.name}</h3>
      <p class="en">${m.en}</p>
      <p>${m.desc}</p>
      <div class="menu-foot">
        <span class="price">${m.price}원</span>
        ${m.tag ? `<span class="tagline">${m.tag}</span>` : ''}
      </div>
    </article>
  `).join('');
}

function initMenuTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      renderMenu(tab.dataset.cat);
    });
  });
  renderMenu('all');
}

/* -----------------------------------------------------------
   4) Leaflet 지도
   ----------------------------------------------------------- */
function makePin(cls, emoji) {
  return L.divIcon({
    className: '',
    html: `<div class="pin ${cls}"><i>${emoji}</i></div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 36],
    popupAnchor: [0, -34]
  });
}

function initMap() {
  const el = document.getElementById('map');
  if (!el || typeof L === 'undefined') {
    if (el) el.innerHTML = '<p style="padding:24px">지도를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.</p>';
    return;
  }

  const map = L.map('map', { scrollWheelZoom: false });
  L.tileLayer(CONFIG.map.tileUrl, {
    attribution: CONFIG.map.attribution,
    maxZoom: CONFIG.map.maxZoom
  }).addTo(map);

  // 출발지 · 도착지 마커
  L.marker(CONFIG.airport.latlng, { icon: makePin('air', '✈') })
    .addTo(map)
    .bindPopup(`<b>${CONFIG.airport.name}</b><br>${CONFIG.airport.place}<br>여기서 출발합니다.`);

  L.marker(CONFIG.cafe.latlng, { icon: makePin('cafe', '☕') })
    .addTo(map)
    .bindPopup(`<b>${CONFIG.cafe.name}</b><br>${CONFIG.cafe.place}<br>${CONFIG.cafe.address}`)
    .openPopup();

  // 카페 반경 표시
  L.circle(CONFIG.cafe.latlng, {
    radius: 120,
    color: '#F5821F',
    weight: 1,
    fillColor: '#F5821F',
    fillOpacity: 0.10
  }).addTo(map);

  const layers = {};   // routeId -> L.LayerGroup
  const bounds = L.latLngBounds([CONFIG.airport.latlng, CONFIG.cafe.latlng]);

  ROUTES.forEach(route => {
    const group = L.layerGroup();

    // 그림자 라인 (가독성)
    L.polyline(route.path, {
      color: '#ffffff', weight: 9, opacity: 0.8, lineCap: 'round', lineJoin: 'round'
    }).addTo(group);

    L.polyline(route.path, {
      color: route.color,
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: route.dash || null
    }).addTo(group);

    (route.stops || []).forEach(stop => {
      L.circleMarker(stop.latlng, {
        radius: 6,
        color: '#fff',
        weight: 2,
        fillColor: route.color,
        fillOpacity: 1
      }).bindTooltip(stop.label, { direction: 'top', offset: [0, -6] }).addTo(group);
    });

    layers[route.id] = group;
    route.path.forEach(p => bounds.extend(p));
  });

  map.fitBounds(bounds, { padding: [50, 50] });

  // 경로 선택 버튼
  const listEl = document.getElementById('routeList');
  listEl.innerHTML = ROUTES.map((r, i) => `
    <button class="route-btn" type="button" data-route="${r.id}" aria-pressed="${i === 0}">
      <span class="r-top">
        <span class="r-name">${r.name}</span>
        <span class="r-time">${r.time}</span>
      </span>
      <span class="r-desc">${r.desc}</span>
    </button>
  `).join('');

  function selectRoute(id) {
    ROUTES.forEach(r => {
      if (map.hasLayer(layers[r.id])) map.removeLayer(layers[r.id]);
    });
    layers[id].addTo(map);

    listEl.querySelectorAll('.route-btn').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.route === id));
    });

    const route = ROUTES.find(r => r.id === id);
    map.fitBounds(L.latLngBounds(route.path), { padding: [55, 55] });
  }

  listEl.querySelectorAll('.route-btn').forEach(btn => {
    btn.addEventListener('click', () => selectRoute(btn.dataset.route));
  });

  selectRoute(ROUTES[0].id);

  // 클릭하면 휠 줌 활성화 (스크롤 방해 방지)
  map.on('click', () => map.scrollWheelZoom.enable());
  map.on('mouseout', () => map.scrollWheelZoom.disable());
}

/* -----------------------------------------------------------
   시작
   ----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderSunset();
  setInterval(renderSunset, 60000); // 1분마다 갱신
  initMenuTabs();
  initMap();
});
