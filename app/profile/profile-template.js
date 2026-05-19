function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatInline(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/\*(?!\*)([^*]+?)\*(?!\*)/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
}

function formatMultiline(text) {
  return formatInline(text).replace(/\n/g, '<br>');
}

const IMAGE_DIMENSIONS = new Map([
  ['https://file.garden/aeRvgfxptRQB-dB-/Firefly%20Spring%20Missive.png', [1281, 1079]],
  ['https://file.garden/aeRvgfxptRQB-dB-/_7%20FFSquish.gif', [480, 360]],
  ['https://file.garden/aeRvgfxptRQB-dB-/_5%20Ending%20GIF.gif', [498, 281]],
  ['https://file.garden/aeRvgfxptRQB-dB-/fireflypeek.gif', [398, 210]],
  ['https://file.garden/aeRvgfxptRQB-dB-/_2%20Top%20Firefly.GIF', [1280, 720]],
  ['https://file.garden/aeRvgfxptRQB-dB-/_6%20Wa%20Arararagi%20dance.gif', [500, 500]],
  ['https://file.garden/aeRvgfxptRQB-dB-/_3%20After%20Firefly%2C%20before%20other%20content.png', [3840, 2160]],
  ['https://file.garden/aeRvgfxptRQB-dB-/_9%20Firefly%20After%20School.jpg', [2026, 1428]],
  ['https://file.garden/aeRvgfxptRQB-dB-/_4.jpg', [3976, 2484]],
  ['https://file.garden/aeRvgfxptRQB-dB-/_8%20Firefly%20Pocky%20Couch.png', [4352, 3904]],
]);

function imageDimensionAttrs(url) {
  const dimensions = IMAGE_DIMENSIONS.get(String(url ?? ''));
  if (!dimensions) return '';
  const [width, height] = dimensions;
  return ` width="${width}" height="${height}"`;
}

function imageAttrs(url, { lazy = false, fetchpriority = '' } = {}) {
  let attrs = imageDimensionAttrs(url);
  if (lazy) attrs += ' loading="lazy"';
  attrs += ' decoding="async"';
  if (fetchpriority) attrs += ` fetchpriority="${escapeHtml(fetchpriority)}"`;
  return attrs;
}

function renderLink(label, url, className = '') {
  const cls = className ? ` class="${className}"` : '';
  return `<a${cls} href="${escapeHtml(url)}">${formatInline(label)}</a>`;
}

function imageWindowAttrs(label = 'image') {
  return ' target="_blank" rel="noopener noreferrer"';
}

function renderSimpleList(items, itemClass = '') {
  return items
    .map((item) => {
      if (item && typeof item === 'object') {
        const childItems = Array.isArray(item.children)
          ? item.children
          : item.childCopy
            ? [item.childCopy]
            : [];
        const children = childItems
          .map((child) => `\n                <div class="ld-child-copy">${formatMultiline(child)}</div>`)
          .join('');
        return `<li${itemClass ? ` class="${itemClass}"` : ''}>${formatInline(item.text)}${children}</li>`;
      }
      return `<li${itemClass ? ` class="${itemClass}"` : ''}>${formatInline(item)}</li>`;
    })
    .join('\n');
}

function renderModelUpdate(recommendations) {
  const headline = recommendations.updateHeadline;
  const body = recommendations.updateBody;
  if (!headline && !body) return '';

  return `            <div class="ld-update">
              ${headline ? `<p><strong>${formatInline(headline)}</strong></p>` : ''}
              ${body ? `<p>${formatMultiline(body)}</p>` : ''}
            </div>`;
}

function renderChildItems(items) {
  return items.map((item) => {
    const child = item.childCopy
      ? `\n                <div class="ld-child-copy">${formatMultiline(item.childCopy)}</div>`
      : '';
    return `              <li>\n                ${formatInline(item.text)}${child}\n              </li>`;
  }).join('\n');
}

function renderRecommendations(items) {
  return items.map((item) => {
    return `              <li>\n                <a class="ld-inline-link" href="${escapeHtml(item.url)}">${formatInline(item.label)}</a>\n                <div class="ld-child-copy">${formatMultiline(item.description)}</div>\n              </li>`;
  }).join('\n');
}

function renderChildCopyBlocks(items, indent = '                ') {
  return items
    .map((item) => `${indent}<div class="ld-child-copy">${formatMultiline(item)}</div>`)
    .join('\n');
}

function renderArtCredits(items) {
  return items.map((item) => `                <li><a href="${escapeHtml(item.url)}">${formatInline(item.label)}</a></li>`).join('\n');
}

function renderRequestsAndCredits(content, indent = '          ') {
  const block = `<div class="ld-compact-grid ld-hero-info-grid">
            <section class="ld-panel ld-panel--compact">
              <h2>${formatInline(content.rightColumn.requests.title)}</h2>
              <p class="ld-footer-link"><a href="${escapeHtml(content.rightColumn.requests.linkUrl)}">${formatInline(content.rightColumn.requests.linkLabel)}</a><span class="ld-footer-subtext">${formatInline(content.rightColumn.requests.subtext)}</span></p>
            </section>
            <section class="ld-panel ld-panel--compact">
              <h2>${formatInline(content.rightColumn.artCredits.title)}</h2>
              <ul class="ld-list">
${renderArtCredits(content.rightColumn.artCredits.items)}
              </ul>
            </section>
          </div>`;

  return block.replace(/^.+$/gm, (line) => `${indent}${line}`);
}

function renderArtCard(item) {
  if (!item?.url) return '';
  return `<a class="ld-media-card ld-art-card" href="${escapeHtml(item.url)}"${imageWindowAttrs(item.label || item.alt)}>
  <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt || item.label)}"${imageAttrs(item.url, { lazy: true })}>
</a>`;
}

const ACTION_VARIANT_CLASSES = new Map([
  ['support', 'ld-hero-action--support'],
]);

function actionClassName(item) {
  const classes = ['ld-jump-link', 'ld-jump-link--ghost'];
  const variant = String(item?.variant ?? '').trim().toLowerCase();
  const variantClass = ACTION_VARIANT_CLASSES.get(variant);

  if (variantClass) {
    classes.push(variantClass);
  }

  return classes.join(' ');
}

function renderActions(actions) {
  return actions.map((item) => `                  <a class="${actionClassName(item)}" href="${escapeHtml(item.url)}">${formatInline(item.label)}</a>`).join('\n');
}

function isVideoUrl(url) {
  return /\.(mp4|webm|mov)(?:[?#]|$)/i.test(String(url ?? ''));
}

function renderMedia(url, className, alt, lazy = false) {
  if (!url) return '';
  if (isVideoUrl(url)) {
    return `<video class="${className}" src="${escapeHtml(url)}" autoplay muted loop playsinline preload="metadata" aria-label="${escapeHtml(alt)}"></video>`;
  }
  return `<img class="${className}" src="${escapeHtml(url)}" alt="${escapeHtml(alt)}"${imageAttrs(url, { lazy })}>`;
}

function buildDeployBio(content) {
  return `<div class="ld-bio" data-ld-bio-root="1" id="ld-top">
      <section class="ld-profile-hero">
        <div class="ld-profile-card">
          <div class="ld-avatar-frame">
            <img src="${escapeHtml(content.topCard.avatarUrl)}" alt="The_Lonely_Devil avatar"${imageAttrs(content.topCard.avatarUrl, { fetchpriority: 'high' })}>
          </div>
          <h1 class="ld-profile-name">${formatInline(content.topCard.profileName)}</h1>
          <div class="ld-profile-about">
            <h2 class="ld-profile-subheading"><a href="${escapeHtml(content.topCard.whoLinkUrl)}" target="_blank" rel="noreferrer">${formatInline(content.topCard.whoLinkLabel)}</a></h2>
            <ul class="ld-list ld-profile-list" style="margin-top: 14px;">
${renderSimpleList(content.topCard.aboutBullets).replace(/^/gm, '              ')}
            </ul>
          </div>
          <div class="ld-quick-jump">
            <p>${formatInline(content.topCard.jumpCopy)}</p>
            <a class="ld-jump-link" href="${escapeHtml(content.topCard.jumpUrl)}">${formatInline(content.topCard.jumpLabel)}</a>
          </div>
        </div>

        <div class="ld-profile-intro">
          <section class="ld-hero-panel">
            <div class="ld-hero-panel-main">
              <div class="ld-hero-stack">
                <div class="ld-hero-heading-row">
                  <h2 class="ld-hero-heading"><a href="${escapeHtml(content.hero.titleUrl)}">${formatInline(content.hero.title)}</a></h2>
                </div>
                <div class="ld-hero-focus">
                  <p class="ld-hero-focus-label">${formatInline(content.hero.focusLabel)}</p>
                  <ul class="ld-list ld-profile-list">
${renderSimpleList(content.hero.focusItems).replace(/^/gm, '                    ')}
                  </ul>
                </div>
                <div class="ld-hero-actions">
${renderActions(content.hero.actions)}
                </div>
              </div>
              <div class="ld-hero-media-stack">
                ${renderMedia(content.hero.cornerGifUrl, 'ld-hero-corner-gif', 'Firefly squish gif')}
                ${renderMedia(content.hero.endingGifUrl, 'ld-hero-ending-gif', 'Ending profile gif')}
                ${renderMedia(content.hero.peekGifUrl, 'ld-hero-peek-gif', 'Firefly peek gif')}
              </div>
            </div>
          </section>
          ${renderMedia(content.hero.bannerUrl, 'ld-hero-media', 'Firefly animated banner')}
${renderRequestsAndCredits(content)}
        </div>
      </section>

      <div class="ld-profile-grid">
        <div class="ld-profile-column">
          <section class="ld-panel">
            <div class="ld-philosophy-layout">
              <div>
                <h2>${formatInline(content.leftColumn.philosophy.title)}</h2>
                <div class="ld-intro-lines">${content.leftColumn.philosophy.introLines.map((line) => formatInline(line)).join('<br>')}</div>
${content.leftColumn.philosophy.paragraphs.map((paragraph) => `                <div class="ld-child-copy">${formatInline(paragraph)}</div>`).join('\n')}

                <h3 class="ld-link-heading"><a href="${escapeHtml(content.leftColumn.philosophy.whyUrl)}" target="_blank" rel="noreferrer">${formatInline(content.leftColumn.philosophy.whyLabel)}</a></h3>
${renderChildCopyBlocks(content.leftColumn.philosophy.whyBullets)}
              </div>
              <img class="ld-philosophy-media" src="${escapeHtml(content.leftColumn.philosophy.mediaUrl)}" alt="Arararagi dance gif"${imageAttrs(content.leftColumn.philosophy.mediaUrl, { lazy: true })}>
            </div>
          </section>

          <a class="ld-media-card" href="${escapeHtml(content.leftColumn.dividerImageUrl)}"${imageWindowAttrs('divider image')}>
            <img src="${escapeHtml(content.leftColumn.dividerImageUrl)}" alt="Firefly illustration divider"${imageAttrs(content.leftColumn.dividerImageUrl, { lazy: true })}>
          </a>

${renderArtCard(content.artShowcase?.items?.[0]).replace(/^/gm, '          ')}

          <section class="ld-panel ld-panel--compact">
            <h2>${formatInline(content.leftColumn.modelRecommendations.title)}</h2>
            <ul class="ld-list">
${renderSimpleList(content.leftColumn.modelRecommendations.bullets).replace(/^/gm, '              ')}
            </ul>
${renderModelUpdate(content.leftColumn.modelRecommendations)}
            <h3 class="ld-link-heading">${formatInline(content.leftColumn.modelRecommendations.otherRecsTitle)}</h3>
            <ul class="ld-list">
${renderSimpleList(content.leftColumn.modelRecommendations.otherRecs).replace(/^/gm, '              ')}
            </ul>
          </section>
        </div>

        <div class="ld-profile-column">
          <section class="ld-panel">
            <h2>${formatInline(content.rightColumn.recommendedReading.title)}</h2>
            <ul class="ld-list">
              <li>
                ${formatInline(content.rightColumn.recommendedReading.guideIntro)}
                <div class="ld-sublist">
                  <div class="ld-sublist-item"><a class="ld-inline-link" href="${escapeHtml(content.rightColumn.recommendedReading.sukinoUrl)}">${formatInline(content.rightColumn.recommendedReading.sukinoLabel)}</a></div>
                </div>
              </li>
              <li>
                ${formatInline(content.rightColumn.recommendedReading.promptingIntro)}
                <div class="ld-sublist">
                  <div class="ld-sublist-item">
                    <a class="ld-inline-link" href="${escapeHtml(content.rightColumn.recommendedReading.geechanUrl)}">${formatInline(content.rightColumn.recommendedReading.geechanLabel)}</a>
                    <div class="ld-sublist ld-sublist--deep">
                      <div class="ld-sublist-item">${formatInline(content.rightColumn.recommendedReading.impersonationLine)}</div>
                      <div class="ld-sublist-item">${formatInline(content.rightColumn.recommendedReading.samplersLine)}</div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          <a class="ld-media-card" href="${escapeHtml(content.rightColumn.midImageUrl)}"${imageWindowAttrs('mid page image')}>
            <img src="${escapeHtml(content.rightColumn.midImageUrl)}" alt="Firefly bed illustration"${imageAttrs(content.rightColumn.midImageUrl, { lazy: true })}>
          </a>

          <section class="ld-panel ld-panel--disclaimers">
            <h2>${formatInline(content.rightColumn.disclaimers.title)}</h2>
            <ul class="ld-list">
${renderChildItems(content.rightColumn.disclaimers.items)}
            </ul>
          </section>

${renderArtCard(content.artShowcase?.items?.[1]).replace(/^/gm, '          ')}

          <section class="ld-panel">
            <h2>Preset Recommendation</h2>
            <ul class="ld-list">
${renderRecommendations(content.leftColumn.presetRecommendations)}
            </ul>
          </section>
        </div>
      </div>
      <div class="ld-anchor" id="ld-cards" aria-hidden="true"></div>
      <div class="ld-float-nav">
        <a class="ld-float-link ld-float-link--secondary" href="${escapeHtml(content.floatingNav.profileUrl)}">${formatInline(content.floatingNav.profileLabel)}</a>
        <a class="ld-float-link" href="${escapeHtml(content.floatingNav.cardsUrl)}">${formatInline(content.floatingNav.cardsLabel)}</a>
      </div>
    </div>\n`;
}

module.exports = {
  buildDeployBio,
};
