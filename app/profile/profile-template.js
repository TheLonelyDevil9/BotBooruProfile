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
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
}

function formatMultiline(text) {
  return formatInline(text).replace(/\n/g, '<br>');
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
    return `              <li>\n                <a class="ld-inline-link" href="${escapeHtml(item.url)}">${formatInline(item.label)}</a>\n                <div class="ld-child-copy">${formatInline(item.description)}</div>\n              </li>`;
  }).join('\n');
}

function renderChildCopyBlocks(items, indent = '                ') {
  return items
    .map((item) => `${indent}<div class="ld-child-copy">${formatInline(item)}</div>`)
    .join('\n');
}

function renderArtCredits(items) {
  return items.map((item) => `                <li><a href="${escapeHtml(item.url)}">${formatInline(item.label)}</a></li>`).join('\n');
}

function renderArtShowcase(showcase) {
  const items = Array.isArray(showcase?.items) ? showcase.items : [];
  if (!items.length) return '';

  return `      <section class="ld-art-showcase" aria-label="Firefly artwork showcase">
${items.map((item) => `        <a class="ld-media-card ld-art-card" href="${escapeHtml(item.url)}"${imageWindowAttrs(item.label || item.alt)}>
          <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt || item.label)}">
        </a>`).join('\n')}
      </section>`;
}

function renderActions(actions) {
  return actions.map((item) => `                  <a class="ld-jump-link ld-jump-link--ghost" href="${escapeHtml(item.url)}">${formatInline(item.label)}</a>`).join('\n');
}

function isVideoUrl(url) {
  return /\.(mp4|webm|mov)(?:[?#]|$)/i.test(String(url ?? ''));
}

function renderMedia(url, className, alt) {
  if (!url) return '';
  if (isVideoUrl(url)) {
    return `<video class="${className}" src="${escapeHtml(url)}" autoplay muted loop playsinline preload="metadata" aria-label="${escapeHtml(alt)}"></video>`;
  }
  return `<img class="${className}" src="${escapeHtml(url)}" alt="${escapeHtml(alt)}">`;
}

function buildDeployBio(content) {
  return `<div class="ld-bio" data-ld-bio-root="1" id="ld-top">
      <section class="ld-profile-hero">
        <div class="ld-profile-card">
          <div class="ld-avatar-frame">
            <img src="${escapeHtml(content.topCard.avatarUrl)}" alt="The_Lonely_Devil avatar">
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
              <img class="ld-philosophy-media" src="${escapeHtml(content.leftColumn.philosophy.mediaUrl)}" alt="Decorative dancing gif">
            </div>
          </section>

          <a class="ld-media-card" href="${escapeHtml(content.leftColumn.dividerImageUrl)}"${imageWindowAttrs('divider image')}>
            <img src="${escapeHtml(content.leftColumn.dividerImageUrl)}" alt="Decorative section image">
          </a>

          <section class="ld-panel">
            <h2>Preset Recommendations</h2>
            <ul class="ld-list">
${renderRecommendations(content.leftColumn.presetRecommendations)}
            </ul>
          </section>

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
            <h2>${formatInline(content.rightColumn.sizeProblem.title)}</h2>
            <ul class="ld-list">
${renderChildItems(content.rightColumn.sizeProblem.items)}
            </ul>
          </section>

          <p class="ld-statement">${formatInline(content.rightColumn.statement)}</p>

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
            <img src="${escapeHtml(content.rightColumn.midImageUrl)}" alt="Decorative mid-page image">
          </a>

          <div class="ld-compact-grid">
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
          </div>

          <section class="ld-panel ld-panel--disclaimers">
            <h2>${formatInline(content.rightColumn.disclaimers.title)}</h2>
            <ul class="ld-list">
${renderChildItems(content.rightColumn.disclaimers.items)}
            </ul>
          </section>
        </div>
      </div>
${renderArtShowcase(content.artShowcase)}
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
