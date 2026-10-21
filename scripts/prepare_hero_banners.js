const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function prepareBanners() {
  const brainDir = 'C:/Users/harsh/.gemini/antigravity-ide/brain/2990c4b6-2358-4eff-9ce8-d148edd51c2f';
  
  const img1 = path.join(brainDir, 'hero_banner_grand_celebration_1790529868427.jpg');
  const img2 = path.join(brainDir, 'hero_banner_royal_catering_1790529892181.jpg');
  const img3 = path.join(brainDir, 'hero_banner_decorators_events_1790529920224.jpg');

  const sources = [img1, img2, img3];

  for (let i = 0; i < sources.length; i++) {
    const src = sources[i];
    const num = i + 1;

    // Desktop banner: 1920 x 800 with high quality
    const desktopBuffer = await sharp(src)
      .resize(1920, 840, { fit: 'cover', position: 'center' })
      .png({ quality: 90, compressionLevel: 8 })
      .toBuffer();

    // Mobile banner: 800 x 900
    const mobileBuffer = await sharp(src)
      .resize(800, 950, { fit: 'cover', position: 'center' })
      .png({ quality: 85, compressionLevel: 8 })
      .toBuffer();

    // Save to bhagonanew Sliders
    const webOut = path.join(__dirname, `../src/assets/Sliders/Slider${num}.png`);
    const mobOut = path.join(__dirname, `../src/assets/Mobile-Sliders/Mobile-Slider-${num}.png`);

    fs.writeFileSync(webOut, desktopBuffer);
    fs.writeFileSync(mobOut, mobileBuffer);

    console.log(`Saved Slider${num}.png (${Math.round(desktopBuffer.length / 1024)} KB) and Mobile-Slider-${num}.png (${Math.round(mobileBuffer.length / 1024)} KB)`);

    // Also update bagonaadmin banners
    const adminBanner = path.join(__dirname, `../../bagonaadmin/src/assets/banner-${num}.png`);
    if (fs.existsSync(path.dirname(adminBanner))) {
      fs.writeFileSync(adminBanner, desktopBuffer);
      console.log(`Updated bagonaadmin/src/assets/banner-${num}.png`);
    }
  }

  console.log('All hero banners generated successfully!');
}

prepareBanners().catch(console.error);
