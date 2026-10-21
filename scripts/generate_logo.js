const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateBrandLogos() {
  const potPath = path.join(__dirname, '../src/assets/bhagona-pot-emblem.png');
  const potMetadata = await sharp(potPath).metadata();

  const targetPotHeight = 114;
  const targetPotWidth = Math.round((potMetadata.width / potMetadata.height) * targetPotHeight);

  const resizedPot = await sharp(potPath)
    .resize(targetPotWidth, targetPotHeight, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  const totalWidth = 740;
  const totalHeight = 136;
  const potX = 10;
  const potY = Math.round((totalHeight - targetPotHeight) / 2);
  const textX = potX + targetPotWidth + 18;

  // 1. Light theme logo
  const svgLight = Buffer.from(`
    <svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="textGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#24130A" />
          <stop offset="60%" stop-color="#3A1C0E" />
          <stop offset="100%" stop-color="#542510" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E87F2C" />
          <stop offset="50%" stop-color="#F5A623" />
          <stop offset="100%" stop-color="#D97706" />
        </linearGradient>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#1E120A" flood-opacity="0.12" />
        </filter>
      </defs>

      <!-- Brand Name 'Bhagona' -->
      <text x="${textX}" y="74" font-family="'Georgia', 'Times New Roman', 'Palatino', serif" font-weight="bold" font-size="58" fill="url(#textGradLight)" filter="url(#softShadow)" letter-spacing="0.5">Bhagona</text>

      <!-- Domain '.in' with comfortable spacing -->
      <text x="${textX + 265}" y="74" font-family="'Georgia', 'Times New Roman', 'Palatino', serif" font-weight="bold" font-size="46" fill="url(#goldGrad)">.in</text>

      <!-- Decorative gold accent flourish line -->
      <path d="M ${textX + 2} 87 Q ${textX + 150} 91 ${textX + 325} 85" stroke="url(#goldGrad)" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.9" />

      <!-- Subtitle Tagline -->
      <text x="${textX + 4}" y="106" font-family="'Segoe UI', 'Outfit', 'Helvetica Neue', sans-serif" font-weight="800" font-size="9.5" fill="#8C4404" letter-spacing="3.2">ONE PLATFORM • MEMORABLE EVENTS</text>
    </svg>
  `);

  const lightLogoBuffer = await sharp({
    create: {
      width: totalWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: resizedPot, top: potY, left: potX },
    { input: svgLight, top: 0, left: 0 }
  ])
  .png()
  .toBuffer();

  // Save to assets
  const homeLogoPath = path.join(__dirname, '../src/assets/home-logo.png');
  const horizontalLogoPath = path.join(__dirname, '../src/assets/bhagona-logo-horizontal.png');

  fs.writeFileSync(homeLogoPath, lightLogoBuffer);
  fs.writeFileSync(horizontalLogoPath, lightLogoBuffer);

  console.log('Successfully updated home-logo.png with refined spacing!');
}

generateBrandLogos().catch(console.error);
