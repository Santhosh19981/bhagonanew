const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createHorizontalWithFullEmblem() {
  const fullLogoPath = path.join(__dirname, '../src/assets/test-full-official-logo.png');

  // Let's extract the emblem portion (service icons + rays + crowd + pot + shadow)
  // In test-full-official-logo.png (471 x 381),
  // y=0 to y=298 is the emblem (icons, crowd, pot, base shadow)
  // y=298 to 381 is Bhagona.in + tagline
  const emblemBuffer = await sharp(fullLogoPath)
    .extract({ left: 0, top: 0, width: 471, height: 298 })
    .toBuffer();

  // Target height for horizontal navbar logo: 120px
  const targetEmblemH = 120;
  const targetEmblemW = Math.round((471 / 298) * targetEmblemH); // ~190px

  const resizedEmblem = await sharp(emblemBuffer)
    .resize(targetEmblemW, targetEmblemH, { fit: 'contain' })
    .toBuffer();

  // Extract 'Bhagona.in' and tagline from the full logo
  // In test-full-official-logo.png, y=290 to 381 has 'Bhagona.in' + tagline
  const textBuffer = await sharp(fullLogoPath)
    .extract({ left: 0, top: 290, width: 471, height: 91 })
    .toBuffer();

  const targetTextH = 92;
  const targetTextW = Math.round((471 / 91) * targetTextH); // ~476px

  const resizedText = await sharp(textBuffer)
    .resize(targetTextW, targetTextH, { fit: 'contain' })
    .toBuffer();

  const totalW = targetEmblemW + targetTextW + 16;
  const totalH = 126;

  const textY = Math.round((totalH - targetTextH) / 2) + 2;

  const horizontalLogo = await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: resizedEmblem, top: 3, left: 0 },
    { input: resizedText, top: textY, left: targetEmblemW + 12 }
  ])
  .png()
  .toBuffer();

  const trimmedH = await sharp(horizontalLogo).trim().png().toBuffer();
  const trimmedMeta = await sharp(trimmedH).metadata();
  console.log('Horizontal logo with full emblem size:', trimmedMeta.width, 'x', trimmedMeta.height);

  fs.writeFileSync(path.join(__dirname, '../src/assets/test-horizontal-full.png'), trimmedH);
}

createHorizontalWithFullEmblem().catch(console.error);
