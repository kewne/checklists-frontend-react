import sharp from "sharp";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "logo_checkoff.svg");
const logoSvg = readFileSync(svgPath);

const themeColor = "#10B981";

async function renderIcon(size, outputPath) {
  await sharp(logoSvg)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outputPath);
  console.log(`Generated ${outputPath}`);
}

async function renderBrandedImage({
  width,
  height,
  logoScale,
  outputPath,
  backgroundColor = themeColor,
}) {
  const logoSize = Math.round(Math.min(width, height) * logoScale);
  const logoBuffer = await sharp(logoSvg)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const textColor = backgroundColor === "#FFFFFF" ? "#111827" : "white";
  const titleSize = Math.max(24, Math.round(Math.min(width, height) * 0.08));
  const subtitleSize = Math.max(14, Math.round(titleSize * 0.45));
  const gap = Math.round(titleSize * 0.75);
  const totalContentHeight = logoSize + gap + titleSize + subtitleSize;
  const contentTop = Math.round((height - totalContentHeight) / 2);
  const logoTop = contentTop;
  const titleBaseline = contentTop + logoSize + gap + Math.round(titleSize * 0.8);
  const subtitleBaseline = titleBaseline + Math.round(titleSize * 0.35) + Math.round(subtitleSize * 0.8);

  const textSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <text x="50%" y="${titleBaseline}" text-anchor="middle" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${titleSize}" font-weight="700">CheckOff</text>
      <text x="50%" y="${subtitleBaseline}" text-anchor="middle" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${subtitleSize}" opacity="0.9">Checklists</text>
    </svg>
  `;
  const textBuffer = await sharp(Buffer.from(textSvg)).png().toBuffer();

  const background = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: backgroundColor,
    },
  }).png();

  await background
    .composite([
      {
        input: logoBuffer,
        left: Math.round((width - logoSize) / 2),
        top: logoTop,
      },
      { input: textBuffer, left: 0, top: 0 },
    ])
    .toFile(outputPath);
  console.log(`Generated ${outputPath}`);
}

(async () => {
  mkdirSync(join(root, "public", "icons", "startup"), { recursive: true });

  await renderIcon(32, join(root, "public", "icons", "favicon-32x32.png"));
  await renderIcon(180, join(root, "public", "icons", "apple-touch-icon.png"));
  await renderIcon(192, join(root, "public", "icons", "icon-192x192.png"));
  await renderIcon(512, join(root, "public", "icons", "icon-512x512.png"));

  await renderBrandedImage({
    width: 1200,
    height: 630,
    logoScale: 0.35,
    backgroundColor: "#FFFFFF",
    outputPath: join(root, "public", "og-image.png"),
  });

  const startupSizes = [
    [2048, 2732],
    [1668, 2388],
    [1170, 2532],
    [1284, 2778],
    [1125, 2436],
    [750, 1334],
  ];

  for (const [width, height] of startupSizes) {
    await renderBrandedImage({
      width,
      height,
      logoScale: 0.3,
      backgroundColor: "#FFFFFF",
      outputPath: join(
        root,
        "public",
        "icons",
        "startup",
        `startup-${width}x${height}.png`,
      ),
    });
  }
})();
