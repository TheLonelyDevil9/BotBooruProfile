#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const path = require('path');

const ACCOUNT_ENDPOINT = 'https://gateway.chub.ai/api/account';
const UPDATE_ENDPOINT = 'https://gateway.chub.ai/user/update';
const DEFAULT_ARTIFACT_PATH = path.join(__dirname, 'paste-blob.html');
const TOKEN_FILE_PATHS = [
  'D:/AIStuff/Cardmaking/Tools/chub-token.txt',
  'D:/AIStuff/Cardmaking/_Tools/chub-token.txt',
];
const HTTP_TIMEOUT_MS = 30_000;
const ERROR_BODY_SNIPPET_CHARS = 240;

let tokenForRedaction = '';

function printHelp(stream = process.stdout) {
  stream.write(`Chub profile About Me push helper

Usage:
  node push-profile.js --dry-run [--file <path>]
  node push-profile.js --check [--file <path>]
  node push-profile.js --push [--file <path>]
  node push-profile.js --help

Modes:
  --help     Print this help. Performs no file read, account read, or POST.
  --dry-run  Read the local artifact and account, print the update plan, but do not POST.
  --check    Read the local artifact and account, compare local vs live about_me hashes, but do not POST.
             Exits nonzero when the local artifact differs from live about_me.
  --push     Read the local artifact and account, POST the update, then re-read and compare hashes.

Options:
  --file <path>  Artifact to use instead of paste-blob.html next to this script.

Auth:
  Token source is CHUB_TOKEN first, then the Cardmaking token file.
  Token values and auth header values are never printed.

Safety:
  No arguments prints this help and performs no POST.
  Only --push can send POST https://gateway.chub.ai/user/update.
`);
}

function parseArgs(argv) {
  const options = { mode: null, file: null, help: false, noArgs: argv.length === 0 };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help') {
      options.help = true;
      continue;
    }

    if (arg === '--dry-run' || arg === '--check' || arg === '--push') {
      const mode = arg.slice(2);
      if (options.mode && options.mode !== mode) {
        throw new Error(`Choose exactly one mode; got --${options.mode} and ${arg}.`);
      }
      options.mode = mode;
      continue;
    }

    if (arg === '--file') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('--file requires a path.');
      }
      options.file = value;
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.noArgs) {
    options.help = true;
  }

  if (!options.help && !options.mode) {
    throw new Error('Choose a mode: --dry-run, --check, --push, or --help.');
  }

  return options;
}

function sha256(bufferOrString) {
  return crypto.createHash('sha256').update(bufferOrString).digest('hex');
}

function textStats(value) {
  const text = value == null ? '' : String(value);
  const buffer = Buffer.from(text, 'utf8');
  return { bytes: buffer.length, hash: sha256(buffer), text };
}

function readArtifact(fileArg) {
  const artifactPath = fileArg
    ? path.resolve(process.cwd(), fileArg)
    : DEFAULT_ARTIFACT_PATH;
  const buffer = fs.readFileSync(artifactPath);
  const content = buffer.toString('utf8');
  return {
    path: artifactPath,
    bytes: buffer.length,
    hash: sha256(buffer),
    content,
  };
}

function readToken() {
  const envToken = process.env.CHUB_TOKEN && process.env.CHUB_TOKEN.trim();
  if (envToken) {
    tokenForRedaction = envToken;
    return envToken;
  }

  for (const tokenFilePath of TOKEN_FILE_PATHS) {
    if (!fs.existsSync(tokenFilePath)) continue;
    const fileToken = fs.readFileSync(tokenFilePath, 'utf8').trim();
    if (fileToken) {
      tokenForRedaction = fileToken;
      return fileToken;
    }
  }

  throw new Error('Missing Chub token. Set CHUB_TOKEN or create a Cardmaking token file.');
}

function redactParsedBody(value, depth = 0) {
  if (depth > 4) return '[redacted-depth]';
  if (Array.isArray(value)) return value.slice(0, 5).map(item => redactParsedBody(item, depth + 1));
  if (!value || typeof value !== 'object') return value;

  const redacted = {};
  for (const [key, child] of Object.entries(value)) {
    const lower = key.toLowerCase();
    if (
      lower.includes('token') ||
      lower.includes('secret') ||
      lower.includes('password') ||
      lower === 'authorization' ||
      lower === 'ch-api-key' ||
      lower === 'samwise' ||
      lower === 'about_me' ||
      lower === 'email' ||
      lower === 'profile'
    ) {
      redacted[key] = '[redacted]';
    } else {
      redacted[key] = redactParsedBody(child, depth + 1);
    }
  }
  return redacted;
}

function collapseAndClip(text) {
  const collapsed = String(text).replace(/\s+/g, ' ').trim();
  if (!collapsed) return '(empty)';
  if (collapsed.length <= ERROR_BODY_SNIPPET_CHARS) return collapsed;
  return `${collapsed.slice(0, ERROR_BODY_SNIPPET_CHARS)}…`;
}

function sanitizeBodySnippet(bodyText) {
  if (!bodyText) return '(empty)';

  try {
    const parsed = JSON.parse(bodyText);
    return collapseAndClip(JSON.stringify(redactParsedBody(parsed)));
  } catch (_error) {
    let text = String(bodyText);
    if (tokenForRedaction) {
      text = text.split(tokenForRedaction).join('[redacted-token]');
    }
    text = text
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
      .replace(/(CH-API-KEY|Authorization|samwise|token|access_token|refresh_token)(\s*[:=]\s*)([^\s,;}]+)/gi, '$1$2[redacted]')
      .replace(/("(?:about_me|email|profile)"\s*:\s*)"(?:\\"|[^"])*"/gi, '$1"[redacted]"');
    return collapseAndClip(text);
  }
}

function safeEndpoint(urlString) {
  const url = new URL(urlString);
  return `${url.origin}${url.pathname}`;
}

function httpRequest(method, urlString, token, payload) {
  const body = payload === undefined ? null : JSON.stringify(payload);
  const url = new URL(urlString);
  const headers = {
    Accept: 'application/json',
    'CH-API-KEY': token,
    'User-Agent': 'ChubProfile push-profile.js',
  };

  if (body !== null) {
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(body, 'utf8');
  }

  return new Promise((resolve, reject) => {
    const request = https.request(url, { method, headers, timeout: HTTP_TIMEOUT_MS }, response => {
      const chunks = [];

      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const responseText = Buffer.concat(chunks).toString('utf8');
        const status = response.statusCode || 0;
        if (status < 200 || status >= 300) {
          reject(new Error(`${method} ${safeEndpoint(urlString)} failed: HTTP ${status}; body: ${sanitizeBodySnippet(responseText)}`));
          return;
        }
        resolve(responseText);
      });
    });

    request.on('timeout', () => {
      request.destroy(new Error(`${method} ${safeEndpoint(urlString)} timed out after ${HTTP_TIMEOUT_MS}ms.`));
    });
    request.on('error', reject);

    if (body !== null) request.write(body);
    request.end();
  });
}

function parseJsonResponse(text, label) {
  try {
    return JSON.parse(text);
  } catch (_error) {
    throw new Error(`${label} returned invalid JSON; body: ${sanitizeBodySnippet(text)}`);
  }
}

function unwrapAccount(responseBody) {
  const candidates = [
    responseBody,
    responseBody && responseBody.account,
    responseBody && responseBody.user,
    responseBody && responseBody.data,
    responseBody && responseBody.data && responseBody.data.account,
    responseBody && responseBody.data && responseBody.data.user,
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      const hasAccountShape = ['name', 'profile', 'email', 'preferred_language', 'about_me']
        .some(field => Object.prototype.hasOwnProperty.call(candidate, field));
      if (hasAccountShape) return candidate;
    }
  }

  throw new Error('Account response did not contain expected account fields. Aborting before any POST.');
}

async function readAccount(token) {
  const url = `${ACCOUNT_ENDPOINT}?nocache=${Date.now()}&tokens=false`;
  const text = await httpRequest('GET', url, token);
  return unwrapAccount(parseJsonResponse(text, 'Account read'));
}

async function postUpdate(token, payload) {
  await httpRequest('POST', UPDATE_ENDPOINT, token, payload);
}

function stringifyField(value) {
  if (value === undefined || value === null) return null;
  return String(value);
}

function buildPayload(account, aboutMe) {
  const name = stringifyField(account.name);
  const email = stringifyField(account.email);

  const missing = [];
  if (name === null) missing.push('name');
  if (email === null) missing.push('email');
  if (missing.length > 0) {
    throw new Error(`Account read missing required field(s): ${missing.join(', ')}. Aborting before any POST.`);
  }

  const rawPreferredLanguage = stringifyField(account.preferred_language);

  return {
    name,
    profile: stringifyField(account.profile) || '',
    email,
    preferred_language: rawPreferredLanguage && rawPreferredLanguage.trim()
      ? rawPreferredLanguage
      : 'en-us',
    about_me: aboutMe,
  };
}

function fieldPlan(account) {
  const profileState = stringifyField(account.profile) === null ? 'fallback-empty' : 'preserved';
  const preferred = stringifyField(account.preferred_language);
  const preferredState = preferred && preferred.trim() ? 'preserved' : 'fallback-en-us';
  return [
    'name=preserved',
    `profile=${profileState}`,
    'email=preserved',
    `preferred_language=${preferredState}`,
    'about_me=replaced-from-artifact',
  ].join(', ');
}

function printLiveComparison(label, liveAboutMe, localHash) {
  const stats = textStats(liveAboutMe || '');
  const matches = stats.hash === localHash;
  console.log(`${label} bytes: ${stats.bytes}`);
  console.log(`${label} sha256: ${stats.hash}`);
  console.log(`${label} match status: ${matches ? 'MATCH' : 'DIFFER'}`);
  return matches;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp(process.stdout);
    return;
  }

  const artifact = readArtifact(options.file);

  console.log(`Mode: --${options.mode}${options.mode === 'push' ? ' (POST enabled)' : ' (no POST)'}`);
  console.log(`Artifact path: ${artifact.path}`);
  console.log(`Artifact bytes: ${artifact.bytes}`);
  console.log(`Artifact sha256: ${artifact.hash}`);

  const token = readToken();
  const account = await readAccount(token);
  console.log('Account read: ok');

  const payload = buildPayload(account, artifact.content);
  console.log(`Planned fields preserved: ${fieldPlan(account)}`);

  const initialMatches = printLiveComparison('Live about_me', account.about_me, artifact.hash);

  if (options.mode === 'dry-run') {
    console.log('POST update: skipped (--dry-run; use --push to write live About Me).');
    return;
  }

  if (options.mode === 'check') {
    console.log('POST update: skipped (--check).');
    if (!initialMatches) process.exitCode = 1;
    return;
  }

  if (options.mode !== 'push') {
    throw new Error(`Unsupported mode: ${options.mode}`);
  }

  console.log('POST update: sending preserved account fields with artifact about_me.');
  await postUpdate(token, payload);
  console.log('POST update: ok');

  const postAccount = await readAccount(token);
  console.log('Post-push account read: ok');
  const postMatches = printLiveComparison('Post-push live about_me', postAccount.about_me, artifact.hash);
  if (!postMatches) process.exitCode = 1;
}

main().catch(error => {
  const message = error && error.message ? error.message : String(error);
  console.error(`ERROR: ${sanitizeBodySnippet(message)}`);
  process.exit(1);
});
