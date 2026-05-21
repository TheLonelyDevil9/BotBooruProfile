#!/usr/bin/env node
'use strict';

const fs = require('fs');
const https = require('https');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  DEFAULT_CARD_THUMBNAIL_BASE_URL,
  getCardEntries,
  getCardThumbnailUrl,
  getCardThumbCrop,
} = require('./card-preview-css');

const DEFAULT_OUTPUT_DIR = path.join(__dirname, 'filegarden-card-thumbnails');
const DEFAULT_CACHE_DIR = path.join(__dirname, '.card-thumbnail-cache');
const DEFAULT_FILEGARDEN_USER_ID = '69e46f81fc69b51401f9d07e';
const DEFAULT_FILEGARDEN_FOLDER_NAME = 'chub-profile-card-thumbnails';
const DEFAULT_BASE_URL = deriveBaseUrl(DEFAULT_FILEGARDEN_USER_ID, DEFAULT_FILEGARDEN_FOLDER_NAME);
const DEFAULT_WIDTH = 960;
const DEFAULT_HEIGHT = 540;
const DEFAULT_QUALITY = 100;
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const CONTACT_SHEET_COLUMNS = 4;
const CONTACT_SHEET_ROWS = 6;
const CONTACT_SHEET_THUMB_WIDTH = 240;
const CONTACT_SHEET_THUMB_HEIGHT = 135;

function printHelp() {
  process.stdout.write(`Generate Filegarden-ready Chub profile card thumbnails.

Usage:
  node generate-card-thumbnails.js [options]

Options:
  --out <dir>       Output directory for JPGs and manifests.
                    Default: app/profile/filegarden-card-thumbnails
  --cache <dir>     Source PNG cache directory.
                    Default: app/profile/.card-thumbnail-cache
  --base-url <url>  Expected Filegarden URL folder for manifest output.
                    Default: ${DEFAULT_BASE_URL}
  --user-id <id>    Filegarden API user id for --upload.
                    Default: ${DEFAULT_FILEGARDEN_USER_ID}
  --folder <name>   Folder to create/use on Filegarden for --upload.
                    Default: ${DEFAULT_FILEGARDEN_FOLDER_NAME}
  --parent <id>     Existing Filegarden parent folder id for JPG uploads.
                    Skips folder lookup/creation.
  --auth-env <name> Environment variable containing the Filegarden auth cookie.
                    Default: FILEGARDEN_AUTH
  --upload          Upload generated JPGs to Filegarden after generation.
  --dry-run         With --upload, print upload plan without writing to Filegarden.
  --verify-urls     HEAD-check public JPG URLs after upload/generation.
  --width <px>      Output JPG width. Default: ${DEFAULT_WIDTH}
  --height <px>     Output JPG height. Default: ${DEFAULT_HEIGHT}
  --quality <1-100> JPG quality. Default: ${DEFAULT_QUALITY}
  --no-sheets       Skip contact sheet generation.
  --help            Print this help.

Requires ImageMagick's "magick" executable on PATH.
For --upload, pass the auth cookie through the configured environment variable.
The script never prints the cookie value.
`);
}

function parsePositiveInteger(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return number;
}

function parseArgs(argv) {
  const options = {
    outDir: DEFAULT_OUTPUT_DIR,
    cacheDir: DEFAULT_CACHE_DIR,
    baseUrl: null,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    quality: DEFAULT_QUALITY,
    filegardenUserId: DEFAULT_FILEGARDEN_USER_ID,
    folderName: DEFAULT_FILEGARDEN_FOLDER_NAME,
    parentId: null,
    authEnv: 'FILEGARDEN_AUTH',
    upload: false,
    dryRun: false,
    verifyUrls: false,
    contactSheets: true,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help') {
      options.help = true;
      continue;
    }
    if (arg === '--no-sheets') {
      options.contactSheets = false;
      continue;
    }
    if (arg === '--upload') {
      options.upload = true;
      continue;
    }
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (arg === '--verify-urls') {
      options.verifyUrls = true;
      continue;
    }

    const next = argv[i + 1];
    if (!next) throw new Error(`${arg} requires a value.`);

    if (arg === '--out') {
      options.outDir = path.resolve(process.cwd(), next);
    } else if (arg === '--cache') {
      options.cacheDir = path.resolve(process.cwd(), next);
    } else if (arg === '--base-url') {
      options.baseUrl = next.replace(/\/+$/, '');
    } else if (arg === '--user-id') {
      options.filegardenUserId = next;
    } else if (arg === '--folder') {
      options.folderName = next;
    } else if (arg === '--parent') {
      options.parentId = next || null;
    } else if (arg === '--auth-env') {
      options.authEnv = next;
    } else if (arg === '--width') {
      options.width = parsePositiveInteger(next, '--width');
    } else if (arg === '--height') {
      options.height = parsePositiveInteger(next, '--height');
    } else if (arg === '--quality') {
      options.quality = parsePositiveInteger(next, '--quality');
      if (options.quality > 100) throw new Error('--quality must be 100 or lower.');
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }

    i += 1;
  }

  return options;
}

function publicFilegardenIdFromUserId(userId) {
  if (!/^[\da-f]{24}$/i.test(userId)) {
    throw new Error(`Invalid Filegarden user id: ${userId}`);
  }

  return Buffer.from(userId.match(/\w{2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join(''), 'binary')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function deriveBaseUrl(userId, folderName) {
  return `https://file.garden/${publicFilegardenIdFromUserId(userId)}/${encodeFilegardenPath(folderName)}`;
}

function encodeFilegardenPath(value) {
  return encodeURIComponent(value).replace(/%2F/g, '/').replace(/%40/g, '@');
}

function parseJsonResponse(body, label) {
  try {
    return JSON.parse(body || '{}');
  } catch {
    throw new Error(`${label} returned non-JSON response.`);
  }
}

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const responseBody = Buffer.concat(chunks).toString('utf8');
        resolve({
          statusCode: response.statusCode || 0,
          headers: response.headers,
          body: responseBody,
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(60_000, () => {
      req.destroy(new Error(`${options.method || 'GET'} ${options.path} timed out after 60000ms.`));
    });

    if (body) req.write(body);
    req.end();
  });
}

function filegardenRequest(method, apiPath, authCookie, body = null, headers = {}) {
  return request({
    hostname: 'api.filegarden.com',
    method,
    path: apiPath,
    headers: {
      Cookie: `auth=${authCookie}`,
      ...headers,
    },
  }, body);
}

function ensureDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    const details = [result.stderr, result.stdout].filter(Boolean).join('\n').trim();
    throw new Error(`${command} ${args.join(' ')} failed${details ? `:\n${details}` : '.'}`);
  }

  return result.stdout || '';
}

function assertMagick() {
  run('magick', ['-version']);
}

function download(url, filePath) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirected = new URL(response.headers.location, url).href;
        response.resume();
        download(redirected, filePath).then(resolve, reject);
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`${url} returned HTTP ${response.statusCode}.`));
        return;
      }

      const file = fs.createWriteStream(filePath);
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    });

    request.on('error', reject);
    request.setTimeout(60_000, () => {
      request.destroy(new Error(`${url} timed out after 60000ms.`));
    });
  });
}

async function head(url) {
  const parsed = new URL(url);
  return request({
    hostname: parsed.hostname,
    method: 'HEAD',
    path: `${parsed.pathname}${parsed.search}`,
  });
}

function identifyDimensions(filePath) {
  const output = run('magick', ['identify', '-format', '%w %h', filePath]).trim();
  const [width, height] = output.split(/\s+/).map(Number);
  if (!width || !height) throw new Error(`Could not identify dimensions for ${filePath}.`);
  return { width, height };
}

function positionToUnit(value) {
  if (value === 'center') return 0.5;
  const match = String(value).match(/^(\d+(?:\.\d+)?)%$/);
  if (!match) return 0.5;
  return Math.max(0, Math.min(1, Number(match[1]) / 100));
}

function cropGeometry(source, crop, targetWidth, targetHeight) {
  const scale = Math.max(targetWidth / source.width, targetHeight / source.height);
  const resizedWidth = Math.ceil(source.width * scale);
  const resizedHeight = Math.ceil(source.height * scale);
  const excessX = Math.max(0, resizedWidth - targetWidth);
  const excessY = Math.max(0, resizedHeight - targetHeight);
  const x = Math.round(excessX * positionToUnit(crop.x));
  const y = Math.round(excessY * positionToUnit(crop.y));

  return {
    resizedWidth,
    resizedHeight,
    x: Math.max(0, Math.min(excessX, x)),
    y: Math.max(0, Math.min(excessY, y)),
  };
}

function generateJpg(inputPath, outputPath, geometry, options) {
  run('magick', [
    inputPath,
    '-auto-orient',
    '-colorspace', 'sRGB',
    '-background', 'black',
    '-alpha', 'remove',
    '-alpha', 'off',
    '-filter', 'Lanczos',
    '-resize', `${geometry.resizedWidth}x${geometry.resizedHeight}!`,
    '-crop', `${options.width}x${options.height}+${geometry.x}+${geometry.y}`,
    '+repage',
    '-strip',
    '-interlace', 'Plane',
    '-sampling-factor', '4:4:4',
    '-quality', String(options.quality),
    outputPath,
  ]);
}

function buildContactSheets(records, options) {
  const pageSize = CONTACT_SHEET_COLUMNS * CONTACT_SHEET_ROWS;
  const sheets = [];

  for (let start = 0; start < records.length; start += pageSize) {
    const page = records.slice(start, start + pageSize);
    const pageNumber = String(sheets.length + 1).padStart(2, '0');
    const outputPath = path.join(options.outDir, `_contact-sheet-${pageNumber}.jpg`);
    const args = [
      '-background', '#111111',
      '-fill', '#eeeeee',
      '-font', 'Arial',
      '-pointsize', '10',
      '-label', '%t',
      ...page.map(record => record.outputPath),
      '-thumbnail', `${CONTACT_SHEET_THUMB_WIDTH}x${CONTACT_SHEET_THUMB_HEIGHT}`,
      '-tile', `${CONTACT_SHEET_COLUMNS}x${CONTACT_SHEET_ROWS}`,
      '-geometry', '+8+22',
      '-quality', '94',
      outputPath,
    ];
    run('magick', ['montage', ...args]);
    sheets.push(outputPath);
  }

  return sheets;
}

function writeManifests(records, options, sheets) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    dimensions: { width: options.width, height: options.height },
    quality: options.quality,
    baseUrl: options.baseUrl,
    uploadFolderName: path.basename(options.outDir),
    filegarden: {
      userId: options.filegardenUserId,
      publicId: publicFilegardenIdFromUserId(options.filegardenUserId),
      folderName: options.folderName,
      parentId: options.parentId || null,
    },
    contactSheets: sheets.map(filePath => path.basename(filePath)),
    cards: records.map(record => ({
      slug: record.slug,
      file: path.basename(record.outputPath),
      url: getCardThumbnailUrl(record.slug, options.baseUrl),
      sourceUrl: record.sourceUrl,
      sourceDimensions: record.sourceDimensions,
      crop: record.crop,
      geometry: record.geometry,
      bytes: record.bytes,
    })),
  };

  fs.writeFileSync(
    path.join(options.outDir, '_manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  const urls = manifest.cards
    .map(card => `${card.slug}\t${card.url}`)
    .join('\n');
  fs.writeFileSync(path.join(options.outDir, '_upload-urls.tsv'), `${urls}\n`, 'utf8');
}

async function listFilegardenItems(options, parentId, authCookie) {
  const parentQuery = parentId ? encodeFilegardenPath(parentId) : '';
  const response = await filegardenRequest(
    'GET',
    `/users/${options.filegardenUserId}/pipe?parent=${parentQuery}`,
    authCookie,
  );
  const parsed = parseJsonResponse(response.body, 'Filegarden item list');
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`Filegarden item list failed with HTTP ${response.statusCode}: ${parsed.error || 'unknown error'}`);
  }

  return Array.isArray(parsed.items) ? parsed.items : [];
}

async function ensureFilegardenFolder(options, authCookie) {
  if (options.parentId) return options.parentId;

  const rootItems = await listFilegardenItems(options, null, authCookie);
  const existing = rootItems.find(item => item.name === options.folderName && item.type === '/');
  if (existing) {
    process.stdout.write(`Using existing Filegarden folder "${options.folderName}" (${existing.id}).\n`);
    return existing.id;
  }

  if (options.dryRun) {
    process.stdout.write(`Would create Filegarden folder "${options.folderName}" at root.\n`);
    return '(dry-run-folder-id)';
  }

  const metadata = encodeURI(JSON.stringify({
    parent: null,
    name: options.folderName,
    type: '/',
  }));
  const response = await filegardenRequest(
    'POST',
    `/users/${options.filegardenUserId}/pipe`,
    authCookie,
    null,
    { 'X-Data': metadata },
  );
  const parsed = parseJsonResponse(response.body, 'Filegarden folder create');
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`Filegarden folder create failed with HTTP ${response.statusCode}: ${parsed.error || 'unknown error'}`);
  }
  if (!parsed.id) throw new Error('Filegarden folder create response did not include an id.');

  process.stdout.write(`Created Filegarden folder "${options.folderName}" (${parsed.id}).\n`);
  return parsed.id;
}

async function deleteFilegardenItem(options, authCookie, item) {
  const response = await filegardenRequest(
    'DELETE',
    `/users/${options.filegardenUserId}/pipe/${item.id}`,
    authCookie,
  );
  if (response.statusCode < 200 || response.statusCode >= 300) {
    const parsed = parseJsonResponse(response.body, 'Filegarden delete');
    throw new Error(`Filegarden delete failed for ${item.name} with HTTP ${response.statusCode}: ${parsed.error || 'unknown error'}`);
  }
}

async function uploadFilegardenFile(options, authCookie, parentId, record, existingItems) {
  const fileName = path.basename(record.outputPath);
  const existing = existingItems.find(item => item.name === fileName && item.parent === parentId);
  const bytes = fs.statSync(record.outputPath).size;

  if (bytes > MAX_UPLOAD_BYTES) {
    throw new Error(`${fileName} is ${bytes} bytes, above Filegarden's 100 MiB upload limit.`);
  }

  if (options.dryRun) {
    process.stdout.write(`Would upload ${fileName} (${Math.round(bytes / 1024)}KB) to Filegarden folder ${parentId}.\n`);
    return {
      slug: record.slug,
      file: fileName,
      url: getCardThumbnailUrl(record.slug, options.baseUrl),
      uploaded: false,
      dryRun: true,
    };
  }

  if (existing) {
    await deleteFilegardenItem(options, authCookie, existing);
  }

  const metadata = encodeURI(JSON.stringify({
    parent: parentId,
    name: fileName,
  }));
  const response = await filegardenRequest(
    'POST',
    `/users/${options.filegardenUserId}/pipe`,
    authCookie,
    fs.readFileSync(record.outputPath),
    {
      'Content-Type': 'application/octet-stream',
      'X-Data': metadata,
    },
  );
  const parsed = parseJsonResponse(response.body, `Filegarden upload ${fileName}`);
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`Filegarden upload failed for ${fileName} with HTTP ${response.statusCode}: ${parsed.error || 'unknown error'}`);
  }
  if (!parsed.path) throw new Error(`Filegarden upload response for ${fileName} did not include a path.`);

  return {
    slug: record.slug,
    file: fileName,
    url: `https://file.garden/${publicFilegardenIdFromUserId(options.filegardenUserId)}/${encodeFilegardenPath(parsed.path)}`,
    uploaded: true,
    bytes,
  };
}

async function uploadToFilegarden(records, options) {
  const authCookie = process.env[options.authEnv];
  if (!authCookie && !options.dryRun) {
    throw new Error(`Set ${options.authEnv} to the Filegarden auth cookie before using --upload.`);
  }

  process.stdout.write(`Uploading ${records.length} JPG thumbnails to Filegarden as user ${options.filegardenUserId}.\n`);
  if (options.dryRun) process.stdout.write('Dry run: no Filegarden writes will be made.\n');

  const parentId = options.dryRun && !authCookie
    ? (options.parentId || '(dry-run-root)')
    : await ensureFilegardenFolder(options, authCookie);
  const existingItems = options.dryRun || !authCookie ? [] : await listFilegardenItems(options, parentId, authCookie);
  const uploaded = [];

  for (const record of records) {
    const result = await uploadFilegardenFile(options, authCookie, parentId, record, existingItems);
    uploaded.push(result);
    process.stdout.write(`${result.dryRun ? 'planned' : 'uploaded'} ${result.file} -> ${result.url}\n`);
  }

  if (options.dryRun || authCookie) {
    fs.writeFileSync(
      path.join(options.outDir, '_filegarden-upload-results.json'),
      `${JSON.stringify({
        uploadedAt: new Date().toISOString(),
        dryRun: options.dryRun,
        userId: options.filegardenUserId,
        publicId: publicFilegardenIdFromUserId(options.filegardenUserId),
        folderName: options.folderName,
        parentId,
        items: uploaded,
      }, null, 2)}\n`,
      'utf8',
    );
  }

  return uploaded;
}

async function verifyPublicUrls(records, options) {
  let ok = 0;
  for (const record of records) {
    const url = getCardThumbnailUrl(record.slug, options.baseUrl);
    const response = await head(url);
    if (response.statusCode >= 200 && response.statusCode < 400) {
      ok += 1;
    } else {
      throw new Error(`${url} returned HTTP ${response.statusCode}.`);
    }
  }

  process.stdout.write(`Verified ${ok} public thumbnail URLs.\n`);
}

async function generate(options) {
  assertMagick();
  if (!options.baseUrl || options.baseUrl === DEFAULT_BASE_URL) {
    options.baseUrl = deriveBaseUrl(options.filegardenUserId, options.folderName);
  }
  ensureDirectory(options.outDir);
  ensureDirectory(options.cacheDir);

  const entries = getCardEntries();
  if (!entries.length) throw new Error('No card entries found.');

  const records = [];
  for (const entry of entries) {
    const crop = getCardThumbCrop(entry.slug);
    const sourcePath = path.join(options.cacheDir, `${entry.slug}.png`);
    const outputPath = path.join(options.outDir, `${entry.slug}.jpg`);

    if (!fs.existsSync(sourcePath)) {
      await download(entry.imageUrl, sourcePath);
    }

    const sourceDimensions = identifyDimensions(sourcePath);
    const geometry = cropGeometry(sourceDimensions, crop, options.width, options.height);
    generateJpg(sourcePath, outputPath, geometry, options);
    const bytes = fs.statSync(outputPath).size;

    records.push({
      slug: entry.slug,
      sourceUrl: entry.imageUrl,
      outputPath,
      sourceDimensions,
      crop,
      geometry,
      bytes,
    });

    const kib = Math.round(bytes / 1024);
    process.stdout.write(`${entry.slug}: ${options.width}x${options.height} q${options.quality} ${kib}KB crop=${crop.x} ${crop.y}\n`);
  }

  const sheets = options.contactSheets ? buildContactSheets(records, options) : [];
  writeManifests(records, options, sheets);

  const totalBytes = records.reduce((sum, record) => sum + record.bytes, 0);
  process.stdout.write(`\nGenerated ${records.length} JPG thumbnails in ${options.outDir}\n`);
  process.stdout.write(`Total JPG bytes: ${totalBytes} (${Math.round(totalBytes / 1024 / 1024)} MB)\n`);
  if (sheets.length) {
    process.stdout.write(`Contact sheets: ${sheets.map(filePath => path.basename(filePath)).join(', ')}\n`);
  }

  if (options.upload) {
    await uploadToFilegarden(records, options);
  }

  if (options.verifyUrls) {
    await verifyPublicUrls(records, options);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  await generate(options);
}

main().catch(error => {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
});
