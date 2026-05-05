const WALLPAPER_URL = 'https://file.garden/aeRvgfxptRQB-dB-/_1%20Profile%20Background.png';

function inlineWallpaper(css) {
  return css.replace(/var\(--ld-wallpaper\)/g, `url("${WALLPAPER_URL}")`);
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

function buildPasteBlob(css, bioHtml) {
  const cssMin = minifyCss(inlineWallpaper(css));
  const bioTrimmed = bioHtml.trim();
  const blob = bioTrimmed.replace(
    /^(<div\b[^>]*>)/i,
    `$1\n<style>${cssMin}</style>`
  );

  return { blob, cssMin, bioTrimmed };
}

module.exports = {
  WALLPAPER_URL,
  buildPasteBlob,
  minifyCss,
  inlineWallpaper,
};
