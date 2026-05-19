const fs = require('fs');
const path = require('path');

const DEFAULT_PUBLISHED_DIR = 'D:\\AIStuff\\Cardmaking\\Published';
const CREATOR = 'The_Lonely_Devil';
const DEFAULT_CARD_THUMB_CROP = { x: 'center', y: '42%' };

// CSS-only native Chub thumbnail focal points. Keys are the stable Chub slug
// path segments from Published/project-ids.json; values are CSS-ready
// background-position components for the high-res overlay.
const CARD_THUMB_CROPS = Object.freeze({
  'alice-thymefield-9ea01e7216fe': { x: '50%', y: '30%' },
  'alya-kujou-9266ab21d865': { x: '50%', y: '30%' },
  'amelia-633388f89151': { x: '50%', y: '30%' },
  'angelina-kudou-shields-1f9aa3d57529': { x: '50%', y: '30%' },
  'belle-ae93a7cca2c7': { x: '50%', y: '30%' },
  'bianca-2439a92036e2': { x: '50%', y: '42%' },
  'bronya-rand-5091849cd3b1': { x: '50%', y: '42%' },
  'castorice-f165691fa7a7': { x: '50%', y: '30%' },
  'chiori-16609eab8c22': { x: '50%', y: '38%' },
  'chizuru-shimizu-4330738f4f24': { x: '50%', y: '30%' },
  'chloe-88bece7e7069': { x: '50%', y: '30%' },
  'cipher-c38d425ec8fc': { x: '50%', y: '30%' },
  'clara-cbdbe20e560b': { x: '50%', y: '35%' },
  'columbina-hyposelenia-84266b0e5891': { x: '50%', y: '42%' },
  'corin-25ae2e1fae19': { x: '60%', y: '42%' },
  'crazy-mita-781b68e79b1d': { x: '50%', y: '30%' },
  'cyrene-07fab33c9d6b': { x: '50%', y: '30%' },
  'ellen-joe-ad372e14f4d7': { x: '50%', y: '35%' },
  'evernight-4366b7ade9bf': { x: '50%', y: '30%' },
  'fern-2a58f194e858': { x: '50%', y: '38%' },
  'firefly-acbe9d8b183b': { x: '50%', y: '38%' },
  'frieren-7207ffbf5ca9': { x: '50%', y: '42%' },
  'fu-xuan-f137aebce3ae': { x: '50%', y: '30%' },
  'furina-de-fontaine-88bfde5805f5': { x: '50%', y: '30%' },
  'futaba-sakura-3858de4dc371': { x: '50%', y: '30%' },
  'guizhong-85f70bf5656f': { x: '50%', y: '42%' },
  'herrscher-of-the-void-e0be6bb73fc9': { x: '50%', y: '24%' },
  'herta-5f8532070dbc': { x: '50%', y: '30%' },
  'hoshimi-miyabi-1f4497673417': { x: '50%', y: '42%' },
  'hu-tao-c802c083a044': { x: '50%', y: '30%' },
  'huohuo-61a7fd7520d8': { x: '50%', y: '35%' },
  'hysilens-f7add9386bb7': { x: '50%', y: '30%' },
  'ines-de6c326aee44': { x: '50%', y: '30%' },
  'io-9a5687ba7a81': { x: '50%', y: '35%' },
  'ivy-ffc7ced6dd83': { x: '50%', y: '30%' },
  'jahoda-6bdca6531697': { x: '50%', y: '30%' },
  'katie-lowell-482192c1d0dc': { x: '50%', y: '35%' },
  'keqing-0d40230522fb': { x: '50%', y: '28%' },
  'kind-mita-98c2b0d8de3f': { x: '45%', y: '42%' },
  'kurisu-1c71e62ffb35': { x: '50%', y: '30%' },
  'laura-emries-e2e905074704': { x: '50%', y: '30%' },
  'lilly-satou-b0a1bd5f4fa4': { x: '50%', y: '30%' },
  'lingsha-7f2ff6ed2afe': { x: '50%', y: '35%' },
  'liriel-valoric-e6138f176d6d': { x: '50%', y: '30%' },
  'lucy-6d20dca89109': { x: '50%', y: '38%' },
  'lumine-0cd81b907f91': { x: '50%', y: '32%' },
  'lyssandra-1b6b808a715c': { x: '50%', y: '35%' },
  'marin-kitagawa-198d3b3dbfb4': { x: '50%', y: '30%' },
  'maya-06bce7dddb50': { x: '50%', y: '30%' },
  'mei-lihua-04b2debf57aa': { x: '50%', y: '30%' },
  'michiru-matsushima-b8a1c1d6dfe8': { x: '50%', y: '30%' },
  'miyuki-tanaka-02fbcd21a534': { x: '50%', y: '30%' },
  'natalie-137d843c759e': { x: '50%', y: '24%' },
  'nefer-b727bb047c46': { x: '55%', y: '42%' },
  'nicole-1d6ba8ccddd6': { x: '50%', y: '30%' },
  'nino-nakano-ccb8aabbf52c': { x: '50%', y: '30%' },
  'noelle-6f9ea3a121a4': { x: '50%', y: '30%' },
  'robin-b9f03eed7ebc': { x: '50%', y: '38%' },
  'ruan-mei-280b1c33453c': { x: '50%', y: '30%' },
  'rui-58df137d7892': { x: '60%', y: '42%' },
  'seed-2d9106b6102c': { x: '50%', y: '25%' },
  'silver-wolf-0748eda0f01d': { x: '50%', y: '30%' },
  'sparkle-1b99dc8f52cc': { x: '50%', y: '30%' },
  'stelle-66b112500b0a': { x: '50%', y: '35%' },
  'sushang-07df530ed0bf': { x: '50%', y: '30%' },
  'sweety-042bff4e8d73': { x: '50%', y: '30%' },
  'tribios-4f09a2115092': { x: '50%', y: '30%' },
  'tsukikage-no-sayo-5bbfd3cb6396': { x: '50%', y: '30%' },
  'vivian-23a1e1cf5638': { x: '50%', y: '30%' },
  'vivianne-ashford-ec25a7a4964c': { x: '50%', y: '38%' },
  'ye-shunguang-9ea3929c4292': { x: '50%', y: '30%' },
  'yelan-4b5cf5ee0583': { x: '50%', y: '35%' },
  'yoimiya-naganohara-5f23132b8995': { x: '50%', y: '30%' },
  'yukiko-14ef05d57c15': { x: '50%', y: '30%' },
  'yumemizuki-mizuki-2da7af398e69': { x: '50%', y: '35%' },
  'yuzuha-8ce51d7a1e70': { x: '50%', y: '30%' },
});

function windowsPathToWsl(filePath) {
  const match = String(filePath).match(/^([A-Za-z]):\\(.*)$/);
  if (!match) return filePath;
  return `/mnt/${match[1].toLowerCase()}/${match[2].replace(/\\/g, '/')}`;
}

function resolveExistingDir(filePath) {
  if (fs.existsSync(filePath)) return filePath;

  const wslPath = windowsPathToWsl(filePath);
  if (wslPath !== filePath && fs.existsSync(wslPath)) {
    return wslPath;
  }

  return filePath;
}

function cssEscapeAttribute(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function cssCustomPropertyValue(value, fallback) {
  const normalized = String(value || '').trim();
  if (/^(?:center|(?:100|\d{1,2})(?:\.\d+)?%)$/.test(normalized)) {
    return normalized;
  }

  return fallback;
}

function getCardThumbCrop(slug) {
  const crop = CARD_THUMB_CROPS[slug] || DEFAULT_CARD_THUMB_CROP;
  return {
    x: cssCustomPropertyValue(crop.x, DEFAULT_CARD_THUMB_CROP.x),
    y: cssCustomPropertyValue(crop.y, DEFAULT_CARD_THUMB_CROP.y),
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getProjectCards(resolvedDir) {
  const projectIdsPath = path.join(resolvedDir, 'project-ids.json');
  if (!fs.existsSync(projectIdsPath)) {
    return fs.readdirSync(resolvedDir)
      .filter((name) => name.endsWith('.json') && name !== 'project-ids.json')
      .map((name) => ({ slug: name.replace(/\.json$/, '') }));
  }

  const projectIds = readJson(projectIdsPath);
  return Array.isArray(projectIds.cards) ? projectIds.cards : [];
}

function getCardEntries(publishedDir = DEFAULT_PUBLISHED_DIR) {
  const resolvedDir = resolveExistingDir(publishedDir);

  if (!fs.existsSync(resolvedDir)) {
    return [];
  }

  return getProjectCards(resolvedDir)
    .map((projectCard) => {
      const slug = projectCard?.slug;
      if (!slug) return null;

      const filePath = path.join(resolvedDir, `${slug}.json`);
      if (!fs.existsSync(filePath)) return null;

      try {
        const card = readJson(filePath);
        const chubId = card?.data?.extensions?.chub?.id;
        const fullPath = card?.data?.extensions?.chub?.full_path;
        const avatar = card?.data?.avatar;
        if (!fullPath || !fullPath.startsWith(`${CREATOR}/`)) {
          return null;
        }

        const fullPathSlug = fullPath.slice(CREATOR.length + 1);
        if (fullPathSlug !== slug) return null;
        if (projectCard.id && chubId && Number(projectCard.id) !== Number(chubId)) return null;

        return {
          slug,
          id: projectCard.id || chubId,
          fullPath,
          imageUrl: avatar || `https://avatars.charhub.io/avatars/${fullPath}/chara_card_v2.png`,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function buildCardPreviewCss(publishedDir = DEFAULT_PUBLISHED_DIR) {
  const entries = getCardEntries(publishedDir);
  if (!entries.length) {
    return '';
  }

  const rules = entries.map((entry) => {
    const slug = cssEscapeAttribute(entry.slug);
    const imageUrl = cssEscapeAttribute(entry.imageUrl);
    const crop = getCardThumbCrop(entry.slug);
    return `.ant-col-lg-18 [role="tabpanel"] a.cursor-pointer[href*="/characters/${CREATOR}/${slug}"]{--ld-card-full-art:url("${imageUrl}");--ld-card-thumbnail-native-opacity:0;--ld-card-crop-x:${crop.x};--ld-card-crop-y:${crop.y}}`;
  });

  return [
    '/* Generated from D:\\AIStuff\\Cardmaking\\Published by card-preview-css.js. */',
    ...rules,
  ].join('\n');
}

module.exports = {
  CARD_THUMB_CROPS,
  DEFAULT_PUBLISHED_DIR,
  DEFAULT_CARD_THUMB_CROP,
  buildCardPreviewCss,
  getCardThumbCrop,
  getCardEntries,
  getProjectCards,
  resolveExistingDir,
};
