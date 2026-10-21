const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processLogo() {
  const inputFile = 'C:/Users/harsh/.gemini/antigravity-ide/brain/2990c4b6-2358-4eff-9ce8-d148edd51c2f/.user_uploaded/media_1790528606578.png';
  const { data, info } = await sharp(inputFile).raw().toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Crop bounding box: from y=20 to y=415, x=45 to x=545 (leaving nice padding)
  const top = 22;
  const bottom = 416; // ignore bottom border line artifact at 422
  const left = 48;
  const right = 540;

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

      // Measure distance from white (255, 255, 255)
      // For white: diff is 0
      // For black: diff is 255
      const diffR = 255 - r;
      const diffG = 255 - g;
      const diffB = 255 - b;
      const maxDiff = Math.max(diffR, diffG, diffB);

      let alpha = 0;
      let outR = r;
      let outG = g;
      let outB = b;

      // Threshold: if very close to white (tolerance 4 out of 255), it's fully transparent
      if (maxDiff <= 4) {
        alpha = 0;
        outR = 0;
        outG = 0;
        outB = 0;
      } else if (maxDiff >= 50) {
        // High opacity region (text, pot, icons, dark shadows)
        // Alpha scales up to 255 rapidly
        alpha = Math.min(255, Math.round((maxDiff / 100) * 255));
        if (maxDiff > 70) alpha = 255;

        // Un-multiply color against white
        const aNorm = alpha / 255;
        outR = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - aNorm)) / aNorm)));
        outG = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - aNorm)) / aNorm)));
        outB = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - aNorm)) / aNorm)));
      } else {
        // Soft edge / golden glow / anti-aliasing (maxDiff between 5 and 50)
        const factor = (maxDiff - 4) / 46; // 0 to 1
        alpha = Math.round(factor * factor * 140); // smooth curve
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

  await sharp(outBuffer, {
    raw: {
      width: croppedW,
      height: croppedH,
      channels: 4
    }
  })
  .png()
  .toFile(path.join(__dirname, '../src/assets/test-transparent-logo.png'));

  console.log('Finished creating test-transparent-logo.png:', croppedW, 'x', croppedH);
}

processLogo().catch(console.error);
