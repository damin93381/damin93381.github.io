import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = "assets/yuyuko-local-preview-source/favicon-original.png";
const output = "source/images/yuyuko-favicon.ico";
const sizes = [16, 32, 48];
const images = await Promise.all(
  sizes.map((size) => sharp(source).resize(size, size, { fit: "fill" }).png().toBuffer()),
);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + images.length * 16;
const entries = images.map((image, index) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(sizes[index], 0);
  entry.writeUInt8(sizes[index], 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(image.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += image.length;
  return entry;
});
await mkdir("source/images", { recursive: true });
await writeFile(output, Buffer.concat([header, ...entries, ...images]));
