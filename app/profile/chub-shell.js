const SAMPLE_CARDS = [
  {
    name: 'Silver Wolf',
    tokens: '278',
    likes: '39',
    downloads: '110',
    rating: '6.1k',
    slug: 'silver-wolf-0748eda0f01d',
    tagline: '"Peak performance looks a lot like lying on the couch. Cheats enabled, shoes off, zero intention of moving first."',
    tags: ['Feet', 'Petite', 'Anime', 'Malepov', 'English', 'Romance', 'Female', 'Human', 'Roleplay', 'Elation'],
    age: '1w',
  },
  {
    name: 'Frieren',
    tokens: '573',
    likes: '42',
    downloads: '95',
    rating: '5k',
    slug: 'frieren-7207ffbf5ca9',
    tagline: '"Praying she will arrive on time, for once, before another century goes missing."',
    tags: ['Feet', 'Elf', 'Petite', 'Anime', 'Malepov', 'English', 'Romance', 'Female', 'Roleplay'],
    age: '2w',
  },
  {
    name: 'Mita',
    tokens: '318',
    likes: '63',
    downloads: '108',
    rating: '6.1k',
    slug: 'crazy-mita-781b68e79b1d',
    tagline: '"She won. He stayed. Now neither knows what happens next."',
    tags: ['Feet', 'Miside', 'Yandere', 'Petite', 'Anime', 'Malepov', 'English', 'Romance', 'Female', 'Human', 'Roleplay'],
    age: '3w',
  },
  {
    name: 'Yoimiya',
    tokens: '225',
    likes: '41',
    downloads: '90',
    rating: '6k',
    slug: 'yoimiya-naganohara-5f23132b8995',
    tagline: '"Every detonation calculated, except the ones you cause."',
    tags: ['Feet', 'Petite', 'Anime', 'Malepov', 'English', 'Romance', 'Female', 'Human', 'Roleplay'],
    age: '4w',
  },
  {
    name: 'Marin',
    tokens: '838',
    likes: '58',
    downloads: '121',
    rating: '6.1k',
    slug: 'marin-kitagawa-198d3b3dbfb4',
    tagline: '"She can become anyone, but she only takes off the contacts for you."',
    tags: ['Feet', 'Clingy', 'Anime', 'Malepov', 'English', 'Romance', 'Female', 'Human', 'Roleplay'],
    age: '1mo',
  },
  {
    name: 'Firefly',
    tokens: '306',
    likes: '72',
    downloads: '231',
    rating: '3.1k',
    slug: 'firefly-acbe9d8b183b',
    tagline: 'A weapon who learned to want fireflies instead of fire.',
    tags: ['Shy', 'English', 'Female', 'Human', 'Romance', 'Anime', 'Roleplay', 'Malepov', 'Feet'],
    age: '4mo',
  },
  {
    name: 'Ruan Mei',
    tokens: '635',
    likes: '36',
    downloads: '147',
    rating: '4.8k',
    slug: 'ruan-mei-280b1c33453c',
    tagline: 'Needs no introduction. The silently-crazed Emanator maker.',
    tags: ['Feet', 'English', 'Female', 'Human', 'Roleplay', 'Romance', 'Malepov', 'Anime'],
    age: '4mo',
  },
  {
    name: 'Yelan',
    tokens: '798',
    likes: '67',
    downloads: '163',
    rating: '5.6k',
    slug: 'yelan-4b5cf5ee0583',
    tagline: '"The world is full of secrets waiting to be plucked, and I have made it my business to collect them all."',
    tags: ['Feet', 'English', 'Female', 'Human', 'Roleplay', 'Romance', 'Anime', 'Malepov'],
    age: '4mo',
  },
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function avatarUrl(slug) {
  return `https://avatars.charhub.io/avatars/The_Lonely_Devil/${slug}/avatar.webp`;
}

function cardUrl(slug) {
  return `https://avatars.charhub.io/avatars/The_Lonely_Devil/${slug}/chara_card_v2.png`;
}

function characterUrl(slug) {
  return `/characters/The_Lonely_Devil/${slug}`;
}

function renderCard(card) {
  const tags = card.tags
    .map((tag) => `<span class="cursor-pointer"><span class="ant-tag css-625x50">${escapeHtml(tag)}</span></span>`)
    .join('');

  return `<a class="cursor-pointer" href="${characterUrl(card.slug)}" style="--ld-card-full-art:url('${cardUrl(card.slug)}')">
    <div class="ant-card ant-card-bordered ant-card-hoverable ant-card-small d-flex flex-column char-card-class css-625x50">
      <div class="ant-card-head">
        <div class="ant-card-head-wrapper">
          <div class="ant-card-head-title">
            <div class="card-title-row">
              <span>${escapeHtml(card.name)}</span>
              <div>${escapeHtml(card.tokens)}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="ant-card-body">
        <div class="ant-row ant-row-no-wrap card-main-body css-625x50">
          <div class="ant-col css-625x50">
            <div>
              <div>
                <img class="sc-ktwOfi eCEqAJ" src="${avatarUrl(card.slug)}" alt="${escapeHtml(card.name)}">
              </div>
            </div>
            <span class="sc-brSamD fqUhVt quote-color stats">
              <span class="fake-ribbon">
                <div><span aria-hidden="true">heart</span><span>${escapeHtml(card.likes)}</span></div>
                <div><span aria-hidden="true">down</span><span>${escapeHtml(card.downloads)}</span></div>
                <div><span aria-hidden="true">gold</span><span>${escapeHtml(card.rating)}</span></div>
              </span>
            </span>
          </div>
          <div class="ant-col css-625x50">
            <div></div>
            <div class="ant-card-meta">
              <div class="ant-card-meta-detail">
                <div class="ant-card-meta-description"><span class="quote-color">${escapeHtml(card.tagline)}</span></div>
              </div>
            </div>
            <div>
              <div class="custom-scroll"><div class="mt-2">${tags}</div></div>
              <div><a class="purple-link" href="/users/The_Lonely_Devil">@The_Lonely_Devil</a><button>${escapeHtml(card.age)}</button><button>more</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a>`;
}

function installShellControls() {
  const avatar = document.querySelector('[data-shell-avatar]');
  const profileMenu = document.querySelector('[data-shell-profile-menu]');
  const search = document.querySelector('[data-shell-search] input');
  const searchBox = document.querySelector('[data-shell-search]');
  const searchMenu = document.querySelector('[data-shell-search-menu]');

  const showProfile = () => {
    profileMenu.classList.remove('ant-dropdown-hidden');
    avatar.classList.add('ant-dropdown-open');
  };
  const hideProfile = () => {
    profileMenu.classList.add('ant-dropdown-hidden');
    avatar.classList.remove('ant-dropdown-open');
  };
  const showSearch = () => {
    searchMenu.classList.remove('ant-select-dropdown-hidden');
    search?.setAttribute('aria-expanded', 'true');
    searchBox?.classList.add('ant-select-open', 'ant-select-focused');
  };
  const hideSearch = () => {
    searchMenu.classList.add('ant-select-dropdown-hidden');
    search?.setAttribute('aria-expanded', 'false');
    searchBox?.classList.remove('ant-select-open');
  };

  avatar?.addEventListener('mouseenter', showProfile);
  avatar?.addEventListener('focus', showProfile);
  profileMenu?.addEventListener('mouseenter', showProfile);
  profileMenu?.addEventListener('mouseleave', hideProfile);

  search?.addEventListener('focus', showSearch);
  search?.addEventListener('input', showSearch);
  search?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const query = encodeURIComponent(search.value || '');
      window.history.replaceState(null, '', `/chub-shell.html?search=${query}`);
      showSearch();
    }
    if (event.key === 'Escape') hideSearch();
  });

  document.addEventListener('pointerdown', (event) => {
    if (!profileMenu?.contains(event.target) && !avatar?.contains(event.target)) hideProfile();
    if (!searchMenu?.contains(event.target) && !searchBox?.contains(event.target)) hideSearch();
  });
}

function shouldLoadMockRecovery() {
  const params = new URLSearchParams(window.location.search);
  return params.has('mockRecovery');
}

async function installProfile() {
  const response = await fetch('/paste-blob.html', { cache: 'no-store' });
  const html = await response.text();
  document.querySelector('#profile-mount').innerHTML = html;
  if (shouldLoadMockRecovery()) {
    const recovery = document.createElement('link');
    recovery.rel = 'stylesheet';
    recovery.href = `/mock-recovery.css?t=${Date.now()}`;
    document.head.appendChild(recovery);
  }
}

function installCards() {
  document.querySelector('#chara-list').innerHTML = SAMPLE_CARDS.map(renderCard).join('');
}

installProfile()
  .then(() => {
    installCards();
    installShellControls();
  })
  .catch((error) => {
    document.querySelector('#profile-mount').textContent = `Mockup failed: ${error.message}`;
  });
