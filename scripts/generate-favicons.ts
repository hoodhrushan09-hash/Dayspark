import { deflateSync } from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

// CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createPngChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

export function generateRasterFavicon(size: number): Buffer {
  // Raw scanlines: each scanline starts with filter byte 0 (None)
  const rawData = Buffer.alloc(size * (size * 4 + 1));
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const radiusCorner = size * 0.22;
  const sunR = size * 0.135;
  const innerRay = size * 0.22;
  const outerRay = size * 0.36;
  const rayWidth = Math.max(1, size * 0.075);

  let offset = 0;
  for (let y = 0; y < size; y++) {
    rawData[offset++] = 0; // Filter: None
    for (let x = 0; x < size; x++) {
      // Determine if inside rounded squircle
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const half = size / 2;

      // Distance from squircle edge
      let insideSquircle = true;
      if (dx > half - radiusCorner && dy > half - radiusCorner) {
        const cornerDx = dx - (half - radiusCorner);
        const cornerDy = dy - (half - radiusCorner);
        if (cornerDx * cornerDx + cornerDy * cornerDy > radiusCorner * radiusCorner) {
          insideSquircle = false;
        }
      }

      if (!insideSquircle) {
        // Transparent
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        continue;
      }

      // DaySpark gradient: from #FF7058 (255, 112, 88) to #FFD166 (255, 209, 102)
      const t = (x + y) / (2 * size);
      let r = 255;
      let g = Math.round(112 * (1 - t) + 209 * t);
      let b = Math.round(88 * (1 - t) + 102 * t);
      let a = 255;

      // Sunburst calculations
      const distFromCenter = Math.hypot(x - cx, y - cy);

      // Central sun disc
      let isSun = distFromCenter <= sunR;

      // 8 rays
      if (!isSun) {
        const angle = Math.atan2(y - cy, x - cx); // -PI to PI
        // Check 8 directions: k * PI / 4
        for (let k = -4; k <= 4; k++) {
          const rayAngle = (k * Math.PI) / 4;
          let diffAngle = Math.abs(angle - rayAngle);
          while (diffAngle > Math.PI) diffAngle -= 2 * Math.PI;
          diffAngle = Math.abs(diffAngle);

          // Distance along ray & perpendicular distance
          const cosA = Math.cos(rayAngle);
          const sinA = Math.sin(rayAngle);
          const projDist = (x - cx) * cosA + (y - cy) * sinA;
          const perpDist = Math.abs(-(x - cx) * sinA + (y - cy) * cosA);

          if (projDist >= innerRay && projDist <= outerRay && perpDist <= rayWidth) {
            isSun = true;
            break;
          }
          // Rounded cap at outer end
          if (Math.hypot(x - (cx + outerRay * cosA), y - (cy + outerRay * sinA)) <= rayWidth) {
            isSun = true;
            break;
          }
          // Rounded cap at inner end
          if (Math.hypot(x - (cx + innerRay * cosA), y - (cy + innerRay * sinA)) <= rayWidth) {
            isSun = true;
            break;
          }
        }
      }

      if (isSun) {
        // #FFFDF9
        rawData[offset++] = 255;
        rawData[offset++] = 253;
        rawData[offset++] = 249;
        rawData[offset++] = 255;
      } else {
        rawData[offset++] = r;
        rawData[offset++] = g;
        rawData[offset++] = b;
        rawData[offset++] = a;
      }
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // Compression method 0
  ihdrData.writeUInt8(0, 11); // Filter method 0
  ihdrData.writeUInt8(0, 12); // Interlace 0
  const ihdrChunk = createPngChunk('IHDR', ihdrData);

  // IDAT
  const compressed = deflateSync(rawData, { level: 9 });
  const idatChunk = createPngChunk('IDAT', compressed);

  // IEND
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate ICO format wrapping 16x16 and 32x32 PNGs
function generateIco(png16: Buffer, png32: Buffer): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type (1 for icon)
  header.writeUInt16LE(2, 4); // 2 images

  const entry1 = Buffer.alloc(16);
  entry1.writeUInt8(16, 0); // width
  entry1.writeUInt8(16, 1); // height
  entry1.writeUInt8(0, 2);  // color count
  entry1.writeUInt8(0, 3);  // reserved
  entry1.writeUInt16LE(1, 4); // color planes
  entry1.writeUInt16LE(32, 6); // bpp
  entry1.writeUInt32LE(png16.length, 8); // size
  entry1.writeUInt32LE(6 + 16 * 2, 12); // offset

  const entry2 = Buffer.alloc(16);
  entry2.writeUInt8(32, 0);
  entry2.writeUInt8(32, 1);
  entry2.writeUInt8(0, 2);
  entry2.writeUInt8(0, 3);
  entry2.writeUInt16LE(1, 4);
  entry2.writeUInt16LE(32, 6);
  entry2.writeUInt32LE(png32.length, 8);
  entry2.writeUInt32LE(6 + 16 * 2 + png16.length, 12);

  return Buffer.concat([header, entry1, entry2, png16, png32]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PNG favicons...');
const png16 = generateRasterFavicon(16);
const png32 = generateRasterFavicon(32);
const png180 = generateRasterFavicon(180);
const png192 = generateRasterFavicon(192);
const png512 = generateRasterFavicon(512);

fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), png192);
fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), png512);

const ico = generateIco(png16, png32);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);

console.log('Favicons generated successfully in public/');
