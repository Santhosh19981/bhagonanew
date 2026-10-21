const sharp = require('sharp');
const file = 'C:/Users/harsh/.gemini/antigravity-ide/brain/2990c4b6-2358-4eff-9ce8-d148edd51c2f/.user_uploaded/media_1790528606578.png';

async function check() {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  console.log('Size:', info.width, 'x', info.height, 'Channels:', info.channels);

  const points = [
    [0, 0],
    [info.width - 1, 0],
    [10, 10],
    [info.width - 10, 10],
    [Math.floor(info.width / 2), 5],
    [5, Math.floor(info.height / 2)],
    [info.width - 5, Math.floor(info.height / 2)],
    [10, info.height - 10],
    [info.width - 10, info.height - 10]
  ];

  points.forEach(([x, y]) => {
    const idx = (y * info.width + x) * info.channels;
    console.log('At (' + x + ',' + y + '): R=' + data[idx] + ' G=' + data[idx+1] + ' B=' + data[idx+2] + ' A=' + data[idx+3]);
  });
}

check().catch(console.error);
