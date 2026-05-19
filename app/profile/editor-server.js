const fs = require('fs');
const path = require('path');
const http = require('http');
const { buildPasteBlob } = require('./blob-generator');
const { buildCardPreviewCss } = require('./card-preview-css');
const { buildDeployBio } = require('./profile-template');

const rootDir = __dirname;
const port = Number(process.env.PORT || 4312);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readSources() {
  const content = JSON.parse(fs.readFileSync(path.join(rootDir, 'profile-content.json'), 'utf8'));
  const bioHtml = buildDeployBio(content);
  return {
    content,
    css: fs.readFileSync(path.join(rootDir, 'deploy.css'), 'utf8'),
    bioHtml,
  };
}

function writeSources(css, content) {
  const bioHtml = buildDeployBio(content);
  fs.writeFileSync(path.join(rootDir, 'deploy.css'), css, 'utf8');
  fs.writeFileSync(path.join(rootDir, 'profile-content.json'), `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(rootDir, 'deploy-bio.html'), bioHtml, 'utf8');
  return bioHtml;
}

function writeBlob(blob) {
  fs.writeFileSync(path.join(rootDir, 'paste-blob.html'), blob, 'utf8');
}

function withGeneratedCss(css) {
  const generatedCss = /--ld-card-(?:preview-art|full-art)/.test(css) ? buildCardPreviewCss() : '';
  return generatedCss ? `${css}\n\n${generatedCss}` : css;
}

function regenerateDerivedFiles() {
  const { content, css } = readSources();
  const bioHtml = writeSources(css, content);
  const { blob } = buildPasteBlob(withGeneratedCss(css), bioHtml);
  writeBlob(blob);
  return { bioHtml, blob };
}

function serveFile(res, filePath, contentType) {
  res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
  res.end(fs.readFileSync(filePath));
}

const staticFiles = new Map([
  ['/preview.html', ['preview.html', 'text/html']],
  ['/paste-blob.html', ['paste-blob.html', 'text/html']],
  ['/chub-shell.html', ['chub-shell.html', 'text/html']],
  ['/chub-shell.css', ['chub-shell.css', 'text/css']],
  ['/chub-shell.js', ['chub-shell.js', 'application/javascript']],
  ['/mock-recovery.css', ['mock-recovery.css', 'text/css']],
]);

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/') {
    return serveFile(res, path.join(rootDir, 'editor.html'), 'text/html');
  }

  if (req.method === 'GET' && staticFiles.has(url.pathname)) {
    const [fileName, contentType] = staticFiles.get(url.pathname);
    return serveFile(res, path.join(rootDir, fileName), contentType);
  }

  if (req.method === 'GET' && url.pathname === '/api/sources') {
    const { content, css, bioHtml } = readSources();
    const { blob } = buildPasteBlob(withGeneratedCss(css), bioHtml);
    return sendJson(res, 200, { content, css, bioHtml, blob });
  }

  if (req.method === 'POST' && url.pathname === '/api/build') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const css = typeof parsed.css === 'string' ? parsed.css : '';
        const content = parsed.content && typeof parsed.content === 'object' ? parsed.content : {};
        const persist = parsed.persist === true;
        const bioHtml = buildDeployBio(content);
        const { blob, cssMin } = buildPasteBlob(withGeneratedCss(css), bioHtml);

        if (persist) {
          writeSources(css, content);
          writeBlob(blob);
        }

        return sendJson(res, 200, {
          blob,
          bioHtml,
          cssLength: css.length,
          bioLength: bioHtml.length,
          styleLength: cssMin.length,
          persisted: persist,
        });
      } catch (error) {
        return sendJson(res, 400, { error: error.message });
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(port, () => {
  const { bioHtml, blob } = regenerateDerivedFiles();
  console.log(`Profile editor running at http://127.0.0.1:${port}`);
  console.log(`Regenerated deploy-bio.html (${bioHtml.length} chars)`);
  console.log(`Regenerated paste-blob.html (${blob.length} chars)`);
});
