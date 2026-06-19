// Generates the preview-portal QR code into public/preview-qr.png (+ .svg).
// Run: npm run qr
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const PREVIEW_URL = process.env.PREVIEW_URL || "https://alaskanmagpie.github.io/auto-money-map/";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outPng = resolve(root, "public/preview-qr.png");
const outSvg = resolve(root, "public/preview-qr.svg");

const opts = { errorCorrectionLevel: "M", margin: 2, width: 512, color: { dark: "#08090c", light: "#ffffff" } };

await mkdir(dirname(outPng), { recursive: true });
await QRCode.toFile(outPng, PREVIEW_URL, opts);
await writeFile(outSvg, await QRCode.toString(PREVIEW_URL, { ...opts, type: "svg" }));

console.log(`QR generated for ${PREVIEW_URL}\n  ${outPng}\n  ${outSvg}`);
