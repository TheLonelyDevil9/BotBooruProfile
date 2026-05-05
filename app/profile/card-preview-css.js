const fs = require('fs');
const path = require('path');

const DEFAULT_PUBLISHED_DIR = 'D:\\AIStuff\\Cardmaking\\Published';
const CREATOR = 'The_Lonely_Devil';

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
    return `.ant-col-lg-18 [role="tabpanel"] a.cursor-pointer[href*="/characters/${CREATOR}/${slug}"]{--ld-card-full-art:url("${imageUrl}")}`;
  });

  return [
    '/* Generated from D:\\AIStuff\\Cardmaking\\Published by card-preview-css.js. */',
    ...rules,
  ].join('\n');
}

module.exports = {
  DEFAULT_PUBLISHED_DIR,
  buildCardPreviewCss,
  getCardEntries,
  getProjectCards,
  resolveExistingDir,
};
