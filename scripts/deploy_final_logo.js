const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function deployFinalLogo() {
  const inputFile = 'C:/Users/harsh/.gemini/antigravity-ide/brain/ea6a925f-fe7f-4304-beee-f53eb7c49245/.user_uploaded/media_1792939424792.png';
  console.log('Loading input logo from:', inputFile);

  const { data, info } = await sharp(inputFile).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const channels = info.channels;

  // 1. Process alpha for clean transparent background
  const outBuffer = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    const diffR = 255 - r;
    const diffG = 255 - g;
    const diffB = 255 - b;
    const maxDiff = Math.max(diffR, diffG, diffB);

    if (maxDiff <= 3) {
      outBuffer[i * 4] = 0;
      outBuffer[i * 4 + 1] = 0;
      outBuffer[i * 4 + 2] = 0;
      outBuffer[i * 4 + 3] = 0;
    } else if (maxDiff > 45) {
      outBuffer[i * 4] = r;
      outBuffer[i * 4 + 1] = g;
      outBuffer[i * 4 + 2] = b;
      outBuffer[i * 4 + 3] = 255;
    } else {
      const alpha = Math.round((maxDiff / 45) * 255);
      const aNorm = alpha / 255;
      outBuffer[i * 4] = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - aNorm)) / aNorm)));
      outBuffer[i * 4 + 1] = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - aNorm)) / aNorm)));
      outBuffer[i * 4 + 2] = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - aNorm)) / aNorm)));
      outBuffer[i * 4 + 3] = alpha;
    }
  }

  // 2. High-res trimmed transparent logo
  const trimmedTransparent = await sharp(outBuffer, {
    raw: { width: w, height: h, channels: 4 }
  }).trim().png().toBuffer();

  const logoMeta = await sharp(trimmedTransparent).metadata();
  console.log('Trimmed Final Logo Dimensions:', logoMeta.width, 'x', logoMeta.height);

  // 3. Square App Icon (512x512) on luxury subtle ivory/cream background
  const appIconInner = await sharp(trimmedTransparent)
    .resize(460, 460, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const appIcon512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 253, g: 249, b: 244, alpha: 255 } // #FDF9F4 signature luxury ivory
    }
  })
  .composite([
    { input: appIconInner, gravity: 'center' }
  ])
  .png()
  .toBuffer();

  // 4. Square Motif Icon (for favicon, touch-icon, and avatar)
  // Extract the paisley motif: x: 0 to 192 in trimmed logo
  const motifExtract = await sharp(trimmedTransparent)
    .extract({ left: 0, top: 0, width: 192, height: logoMeta.height })
    .trim()
    .png()
    .toBuffer();

  const motifSquare = await sharp(motifExtract)
    .resize(160, 160, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const faviconSquare192 = await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 253, g: 249, b: 244, alpha: 255 }
    }
  })
  .composite([
    { input: motifSquare, gravity: 'center' }
  ])
  .png()
  .toBuffer();

  const favicon64 = await sharp(faviconSquare192)
    .resize(64, 64)
    .png()
    .toBuffer();

  const favicon32 = await sharp(faviconSquare192)
    .resize(32, 32)
    .png()
    .toBuffer();

  // 5. Target destinations list across all workspaces
  const fullLogoTargets = [
    // bhagonanew assets
    'd:/Bhagona/bhagonanew/src/assets/bhagona-logo-official.png',
    'd:/Bhagona/bhagonanew/src/assets/bhagona-logo-clean.png',
    'd:/Bhagona/bhagonanew/src/assets/bhagona-logo-horizontal.png',
    'd:/Bhagona/bhagonanew/src/assets/logo.png',
    'd:/Bhagona/bhagonanew/src/assets/home-logo.png',
    'd:/Bhagona/bhagonanew/public/logoimage.png',

    // bagonaadmin
    'd:/Bhagona/bagonaadmin/src/assets/bhagona-logo-official.png',
    'd:/Bhagona/bagonaadmin/src/assets/bhagona-logo-clean.png',
    'd:/Bhagona/bagonaadmin/src/assets/bhagona-logo-horizontal.png',
    'd:/Bhagona/bagonaadmin/src/assets/logo.png',
    'd:/Bhagona/bagonaadmin/src/assets/home-logo.png',
    'd:/Bhagona/bagonaadmin/src/assets/logoimage.png',
    'd:/Bhagona/bagonaadmin/src/logo.png',
    'd:/Bhagona/bagonaadmin/public/logoimage.png',

    // bhagona-regisration
    'd:/Bhagona/bhagona-regisration/public/logoimage.png'
  ];

  for (const target of fullLogoTargets) {
    const dir = path.dirname(target);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(target, trimmedTransparent);
    console.log('✓ Deployed full logo to:', target);
  }

  // Favicons and App icons
  fs.writeFileSync('d:/Bhagona/bhagonanew/src/assets/bhagona-app-icon.png', appIcon512);
  fs.writeFileSync('d:/Bhagona/bhagonanew/src/assets/bhagona-pot-emblem.png', motifExtract);
  fs.writeFileSync('d:/Bhagona/bhagonanew/public/favicon.png', favicon64);
  fs.writeFileSync('d:/Bhagona/bhagonanew/public/favicon.ico', favicon32);

  // Bagonaadmin favicons
  if (fs.existsSync('d:/Bhagona/bagonaadmin/public')) {
    fs.writeFileSync('d:/Bhagona/bagonaadmin/public/favicon.png', favicon64);
    fs.writeFileSync('d:/Bhagona/bagonaadmin/public/favicon.ico', favicon32);
  }

  // Bhagona-registration favicons
  if (fs.existsSync('d:/Bhagona/bhagona-regisration/public')) {
    fs.writeFileSync('d:/Bhagona/bhagona-regisration/public/favicon.png', favicon64);
  }

  // Android mipmap app icons
  const androidMipmaps = [
    { dir: 'd:/Bhagona/bhagonanew/android/app/src/main/res/mipmap-mdpi', size: 48 },
    { dir: 'd:/Bhagona/bhagonanew/android/app/src/main/res/mipmap-hdpi', size: 72 },
    { dir: 'd:/Bhagona/bhagonanew/android/app/src/main/res/mipmap-xhdpi', size: 96 },
    { dir: 'd:/Bhagona/bhagonanew/android/app/src/main/res/mipmap-xxhdpi', size: 144 },
    { dir: 'd:/Bhagona/bhagonanew/android/app/src/main/res/mipmap-xxxhdpi', size: 192 }
  ];

  for (const m of androidMipmaps) {
    if (fs.existsSync(m.dir)) {
      const resized = await sharp(appIcon512).resize(m.size, m.size).png().toBuffer();
      fs.writeFileSync(path.join(m.dir, 'ic_launcher.png'), resized);
      fs.writeFileSync(path.join(m.dir, 'ic_launcher_round.png'), resized);
      console.log(`✓ Updated Android icon (${m.size}x${m.size}) in ${m.dir}`);
    }
  }

  console.log('\n🎉 ALL LOGO ASSETS DEPLOYED EVERYWHERE WITH HIGHEST QUALITY!');
}

deployFinalLogo().catch(err => {
  console.error('Error deploying logo:', err);
  process.exit(1);
});
