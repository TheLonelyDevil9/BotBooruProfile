// Builds paste-blob.html — ALL CSS in one <style> inside the bio <div> for About Me.
// Chub's Upload Custom CSS is unreliable; bio <style> inside a <div> survives the sanitizer.
const fs = require('fs');
const path = require('path');
const { buildPasteBlob } = require('./blob-generator');
const { buildCardPreviewCss } = require('./card-preview-css');
const { buildDeployBio } = require('./profile-template');

const dir = __dirname;
const css = fs.readFileSync(path.join(dir, 'deploy.css'), 'utf8');
const content = JSON.parse(fs.readFileSync(path.join(dir, 'profile-content.json'), 'utf8'));
const bio = buildDeployBio(content);
const generatedCss = css.includes('--ld-card-full-art') ? buildCardPreviewCss() : '';
const cssWithGenerated = generatedCss ? `${css}\n\n${generatedCss}` : css;
const { blob, cssMin, bioTrimmed } = buildPasteBlob(cssWithGenerated, bio);
const bioPath = path.join(dir, 'deploy-bio.html');
const blobPath = path.join(dir, 'paste-blob.html');
fs.writeFileSync(bioPath, bio, 'utf8');
fs.writeFileSync(blobPath, blob, 'utf8');
console.log(`deploy-bio.html: ${bio.length} chars`);
console.log(`paste-blob.html: ${blob.length} chars (${Math.round(blob.length/1024)} KB)`);
console.log(`  <style>: ${cssMin.length} chars`);
console.log(`  bio HTML: ${bioTrimmed.length} chars`);
if (generatedCss) {
  console.log(`  card hover previews: ${(generatedCss.match(/--ld-card-full-art/g) || []).length} cards`);
}
