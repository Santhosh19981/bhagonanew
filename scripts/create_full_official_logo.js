const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createFullOfficialLogo() {
  const inputFile = 'C:/Users/harsh/.gemini/antigravity-ide/brain/2990c4b6-2358-4eff-9ce8-d148edd51c2f/.user_uploaded/media_1790528606578.png';
  const { data, info } = await sharp(inputFile).raw().toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // We want to capture the 6 icons at the top, down to the bottom of Bhagona.in swoosh
  const top = 18;
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

  // Extract tagline from official
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

  // Trim transparent borders
  const trimmedFinal = await sharp(finalLogo).trim().png().toBuffer();
  const trimmedMeta = await sharp(trimmedFinal).metadata();

  console.log('Trimmed full logo size:', trimmedMeta.width, 'x', trimmedMeta.height);

  const outPath = path.join(__dirname, '../src/assets/test-full-official-logo.png');
  fs.writeFileSync(outPath, trimmedFinal);
  console.log('Saved to test-full-official-logo.png successfully!');
}

createFullOfficialLogo().catch(console.error);
