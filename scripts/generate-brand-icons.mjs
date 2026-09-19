import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

// A 16 × 16 original pixel mark, shared by the favicon and installable icons.
// Colours match the light-theme tokens in src/styles/tokens.css.
const SIZE = 16;
const PALETTE = {
  ".": "#ffeccf", // page
  H: "#2a1c3f", // ink
  S: "#ff5d2e", // accent shadow and sun centre
  Y: "#ffd23f", // sunlight
};

const pixels = Array.from({ length: SIZE }, () => Array(SIZE).fill("."));

function rect(x, y, width, height, colour, canvas = pixels) {
  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      canvas[row][column] = colour;
    }
  }
}

// One-pixel orange offset gives the H depth without softening its silhouette.
rect(4, 5, 2, 9, "S");
rect(10, 5, 2, 9, "S");
rect(6, 9, 4, 2, "S");
rect(3, 4, 2, 9, "H");
rect(9, 4, 2, 9, "H");
rect(5, 8, 4, 2, "H");

// In the wordmark, the sun sits above H instead of competing with the i.
const headerPixels = pixels.map((row) => [...row]);
rect(6, 0, 3, 3, "Y", headerPixels);
rect(7, 1, 1, 1, "S", headerPixels);
for (const [x, y] of [[5, 1], [9, 1], [7, 3]]) {
  rect(x, y, 1, 1, "Y", headerPixels);
}

// A compact, square-rayed sun remains legible at favicon size.
rect(12, 2, 3, 3, "Y");
rect(13, 3, 1, 1, "S");
for (const [x, y] of [[13, 0], [10, 3], [15, 3], [13, 6]]) {
  rect(x, y, 1, 1, "Y");
}

function svg({ ink = PALETTE.H, transparent = false, canvas = pixels } = {}) {
  const shapes = Object.keys(PALETTE)
    .filter((colour) => colour !== ".")
    .map((colour) => {
      const commands = [];
      for (let y = 0; y < SIZE; y += 1) {
        for (let x = 0; x < SIZE; x += 1) {
          if (canvas[y][x] === colour) commands.push(`M${x} ${y}h1v1h-1z`);
        }
      }
      return `<path fill="${colour === "H" ? ink : PALETTE[colour]}" d="${commands.join("")}"/>`;
    });
  const background = transparent ? "" : `<path fill="${PALETTE["."]}" d="M0 0h16v16H0z"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">${background}${shapes.join("")}</svg>\n`;
}

const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

function chunk(type, data) {
  const name = Buffer.from(type);
  const output = Buffer.alloc(12 + data.length);
  output.writeUInt32BE(data.length, 0);
  name.copy(output, 4);
  data.copy(output, 8);
  let crc = 0xffffffff;
  for (const byte of output.subarray(4, 8 + data.length)) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  output.writeUInt32BE((crc ^ 0xffffffff) >>> 0, 8 + data.length);
  return output;
}

function png(size) {
  const scanlines = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const colour = PALETTE[pixels[Math.floor(y * SIZE / size)][Math.floor(x * SIZE / size)]];
      const offset = y * (1 + size * 4) + 1 + x * 4;
      scanlines[offset] = Number.parseInt(colour.slice(1, 3), 16);
      scanlines[offset + 1] = Number.parseInt(colour.slice(3, 5), 16);
      scanlines[offset + 2] = Number.parseInt(colour.slice(5, 7), 16);
      scanlines[offset + 3] = 255;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // RGBA, 8 bits per channel
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(scanlines)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

writeFileSync("public/favicon.svg", svg());
writeFileSync("public/logo.svg", svg({ transparent: true, canvas: headerPixels }));
writeFileSync("public/logo-dark.svg", svg({ ink: "#ffeede", transparent: true, canvas: headerPixels }));
for (const [filename, size] of [
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["public/apple-touch-icon.png", 180],
]) {
  writeFileSync(filename, png(size));
}
