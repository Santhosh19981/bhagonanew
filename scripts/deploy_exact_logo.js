const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function deployExactLogo() {
  const inputFile = 'C:/Users/harsh/.gemini/antigravity-ide/brain/2990c4b6-2358-4eff-9ce8-d148edd51c2f/.user_uploaded/media_1790528606578.png';
  const { data, info } = await sharp(inputFile).raw().toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Capture from y=16 (above the 6 icons) to y=392 (bottom of Bhagona.in swoosh)
  const top = 16;
  const bottom = 392;
  const left = 35;
  const right = 550;

  const croppedW = right - left;
  const croppedH = bottom - top;
  const outBuffer = Buffer.alloc(croppedW * croppedH * 4);

  let outIdx = 0;
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const diffR = 255 - r;
      const diffG = 255 - g;
      const diffB = 255 - b;
      const maxDiff = Math.max(diffR, diffG, diffB);

      let alpha = 0;
      let outR = r;
      let outG = g;
      let outB = b;

      if (maxDiff <= 4) {
        alpha = 0;
        outR = 0;
        outG = 0;
        outB = 0;
      } else if (maxDiff >= 50) {
        alpha = Math.min(255, Math.round((maxDiff / 100) * 255));
        if (maxDiff > 70) alpha = 255;

        const aNorm = alpha / 255;
        outR = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - aNorm)) / aNorm)));
        outG = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - aNorm)) / aNorm)));
        outB = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - aNorm)) / aNorm)));
      } else {
        const factor = (maxDiff - 4) / 46;
        alpha = Math.round(factor * factor * 140);
        if (alpha > 0) {
          const aNorm = alpha / 255;
          outR = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - aNorm)) / aNorm)));
          outG = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - aNorm)) / aNorm)));
          outB = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - aNorm)) / aNorm)));
        }
      }

      outBuffer[outIdx++] = outR;
      outBuffer[outIdx++] = outG;
      outBuffer[outIdx++] = outB;
      outBuffer[outIdx++] = alpha;
    }
  }

  const topAndPotBuffer = await sharp(outBuffer, {
    raw: {
      width: croppedW,
      height: croppedH,
      channels: 4
    }
  }).png().toBuffer();

  // Extract official tagline
  const officialPath = path.join(__dirname, '../src/assets/bhagona-logo-official.png');
  const taglineBuffer = await sharp(officialPath)
    .extract({ left: 30, top: 256, width: 420, height: 13 })
    .toBuffer();

  // Resize tagline to match proportional width
  const targetTaglineW = 440;
  const targetTaglineH = Math.round((13 / 420) * targetTaglineW);
  const resizedTagline = await sharp(taglineBuffer)
    .resize(targetTaglineW, targetTaglineH, { fit: 'fill' })
    .toBuffer();

  // Composite final canvas
  const canvasW = croppedW;
  const canvasH = croppedH + 28;
  const taglineX = Math.round((canvasW - targetTaglineW) / 2);
  const taglineY = croppedH + 8;

  const finalLogo = await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: topAndPotBuffer, top: 0, left: 0 },
    { input: resizedTagline, top: taglineY, left: taglineX }
  ])
  .png()
  .toBuffer();

  // Trim transparent edges
  const trimmedLogoBuffer = await sharp(finalLogo).trim().png().toBuffer();
  const trimmedMeta = await sharp(trimmedLogoBuffer).metadata();
  console.log('Final Trimmed Exact Logo:', trimmedMeta.width, 'x', trimmedMeta.height);

  // 1. Emblem only (icons + rays + crowd + pot + shadow)
  const emblemBuffer = await sharp(trimmedLogoBuffer)
    .extract({ left: 0, top: 0, width: trimmedMeta.width, height: 272 })
    .trim()
    .png()
    .toBuffer();

  // 2. Square App Icon (512x512) with elegant soft white/ivory background and drop shadow
  const appIconLogo = await sharp(trimmedLogoBuffer)
    .resize(440, 440, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const squareAppIcon = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 253, g: 249, b: 244, alpha: 255 }
    }
  })
  .composite([
    { input: appIconLogo, top: 36, left: 36 }
  ])
  .png()
  .toBuffer();

  // Target paths list
  const targets = [
    // bhagonanew
    'd:/Bhagona/bhagonanew/src/assets/logo.png',
    'd:/Bhagona/bhagonanew/src/assets/bhagona-logo-official.png',
    'd:/Bhagona/bhagonanew/src/assets/bhagona-logo-clean.png',
    'd:/Bhagona/bhagonanew/src/assets/home-logo.png',
    'd:/Bhagona/bhagonanew/src/assets/bhagona-logo-horizontal.png',

    // bagonaadmin
    'd:/Bhagona/bagonaadmin/src/assets/logo.png',
    'd:/Bhagona/bagonaadmin/src/assets/bhagona-logo-official.png',
    'd:/Bhagona/bagonaadmin/src/assets/bhagona-logo-clean.png',
    'd:/Bhagona/bagonaadmin/src/assets/home-logo.png',
    'd:/Bhagona/bagonaadmin/src/assets/bhagona-logo-horizontal.png',
    'd:/Bhagona/bagonaadmin/src/assets/logoimage.png',
    'd:/Bhagona/bagonaadmin/src/logo.png',
    'd:/Bhagona/bagonaadmin/public/logoimage.png',

    // bhagona-regisration
    'd:/Bhagona/bhagona-regisration/public/logoimage.png'
  ];

  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, trimmedLogoBuffer);
    console.log('Wrote:', t);
  }

  // Write emblem
  fs.writeFileSync('d:/Bhagona/bhagonanew/src/assets/bhagona-pot-emblem.png', emblemBuffer);
  console.log('Wrote bhagona-pot-emblem.png');

  // Write square app icon
  fs.writeFileSync('d:/Bhagona/bhagonanew/src/assets/bhagona-app-icon.png', squareAppIcon);
  console.log('Wrote bhagona-app-icon.png');

  console.log('ALL LOGO ASSETS DEPLOYED ACROSS ALL APPLICATIONS SUCCESSFULLY!');
}

deployExactLogo().catch(console.error);
