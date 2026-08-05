import sharp from "sharp";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="144" fill="#0F6E6A"/>
  <path
    d="M256 104 Q256 56 304 72"
    stroke="#ffffff"
    stroke-width="24"
    fill="none"
    stroke-linecap="round"
  />
  <path
    d="M208 128 L256 163.2 L304 128 L392 192 L336 243.2 L336 416 L176 416 L176 243.2 L120 192 Z"
    fill="#ffffff"
  />
  <circle cx="256" cy="288" r="20.8" fill="#FF6B4A"/>
</svg>
`;

const MASKABLE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0F6E6A"/>
  <g transform="translate(256 256) scale(0.72) translate(-256 -256)">
    <rect width="512" height="512" rx="144" fill="#0F6E6A"/>
    <path
      d="M256 104 Q256 56 304 72"
      stroke="#ffffff"
      stroke-width="24"
      fill="none"
      stroke-linecap="round"
    />
    <path
      d="M208 128 L256 163.2 L304 128 L392 192 L336 243.2 L336 416 L176 416 L176 243.2 L120 192 Z"
      fill="#ffffff"
    />
    <circle cx="256" cy="288" r="20.8" fill="#FF6B4A"/>
  </g>
</svg>
`;

async function writePng(svg, size, outPath) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outPath);
  console.log(`Wrote ${outPath} (${size}x${size})`);
}

await mkdir(join(root, "public/icons"), { recursive: true });

await writePng(LOGO_SVG, 192, join(root, "public/icons/icon-192.png"));
await writePng(LOGO_SVG, 512, join(root, "public/icons/icon-512.png"));
await writePng(MASKABLE_SVG, 512, join(root, "public/icons/icon-maskable-512.png"));
await writePng(LOGO_SVG, 180, join(root, "public/apple-touch-icon.png"));
