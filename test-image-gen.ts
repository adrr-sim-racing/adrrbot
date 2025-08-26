import { createCanvas, loadImage, GlobalFonts, Image } from '@napi-rs/canvas';
import { ADRRColours } from './src/constants';
import path from 'path';
import fs from 'fs';

// Mock interaction data and functions for testing
const mockOptions = {
  getString: (name: string) => {
    switch (name) {
      case 'colour':
        return ADRRColours.Primary; // Red
      case 'title':
        return 'SPA (WEC)';
      case 'date':
        return '26th AUG 2025';
    }
    return null;
  },
  getAttachment: () => ({
    url: path.join(__dirname, 'assets', 'images', '32.webp'),
  }),
};

const mockInteraction = {
  options: mockOptions,
  deferReply: () => console.log('Mock deferReply called.'),
  editReply: ({ files }: { files: any[] }) => {
    const attachment = files[0];
    fs.writeFileSync('test-event.png', attachment.data);
    console.log(`Test image saved as test-event.png`);
  },
};

let fontRegistered = false;

async function recolorImage(imageUrl: string, targetColor: string): Promise<Image> {
  const img = await loadImage(imageUrl);
  const tempCanvas = createCanvas(img.width, img.height);
  const tempCtx = tempCanvas.getContext('2d');

  tempCtx.drawImage(img, 0, 0);
  tempCtx.globalCompositeOperation = 'source-in';
  tempCtx.fillStyle = targetColor;
  tempCtx.fillRect(0, 0, img.width, img.height);

  return await loadImage(tempCanvas.toBuffer('image/png'));
}

function roundedRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawDiagonalBorder(ctx: any, width: number, height: number, stripeSize: number, colors: string[]) {
  let x = -height;
  let i = 0;

  while (x < width + height) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeSize, 0);
    ctx.lineTo(x + stripeSize - height, height);
    ctx.lineTo(x - height, height);
    ctx.closePath();
    ctx.fill();
    x += stripeSize;
    i++;
  }
}

async function runImageGeneration(interaction: any) {
  await interaction.deferReply();

  if (!fontRegistered) {
    GlobalFonts.registerFromPath(path.join(__dirname, 'src/assets/fonts/urw-din-black.ttf'), 'URW DIN');
    fontRegistered = true;
  }

  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const colourTuple = interaction.options.getString('colour');
  const colour = `rgb(${colourTuple.join(', ')})`;
  const title = interaction.options.getString('title');
  const date = interaction.options.getString('date');
  const imgAttachment = interaction.options.getAttachment('image');

  // 1. Draw diagonal border
  drawDiagonalBorder(ctx, width, height, 50, ['#1a1a1a', colour]);

  // 2. Draw inner white rectangle
  ctx.fillStyle = '#f9f9f9';
  const borderWidth = 30;
  roundedRect(ctx, borderWidth, borderWidth, width - borderWidth * 2, height - borderWidth * 2, 25);
  ctx.fill();

  // Content area
  const innerRectX = 45;
  const innerRectY = 45;
  const innerRectWidth = width - 2 * innerRectX;
  const innerRectHeight = height - 2 * innerRectY;

  // 3. Draw ADRR logo + text
  const padding = 20; // Increased padding for better spacing
  const adrrLogoWhite = path.join(__dirname, 'assets', 'images', 'ADRR.png');
  const adrrLogoBlack = await recolorImage(adrrLogoWhite, '#1a1a1a');

  // Measure text first to properly align everything
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#1a1a1a';

  const adrrFontSize = 40;
  ctx.font = `bold ${adrrFontSize}px "URW DIN"`;
  const adrrMetrics = ctx.measureText('ADRR');
  const adrrTextWidth = adrrMetrics.width;
  const adrrTextHeight = adrrMetrics.actualBoundingBoxAscent + adrrMetrics.actualBoundingBoxDescent;
  
  const simRacingFontSize = adrrFontSize * 0.6;
  ctx.font = `${simRacingFontSize}px "URW DIN"`;
  const simRacingText = 'SIM RACING';
  const simRacingMetrics = ctx.measureText(simRacingText);
  const simRacingWidth = simRacingMetrics.width;
  const simRacingTextHeight = simRacingMetrics.actualBoundingBoxAscent + simRacingMetrics.actualBoundingBoxDescent;

  // Calculate the total height needed for the text block (ADRR above, SIM RACING below with small gap)
  const lineGap = 5;
  const textBlockHeight = adrrTextHeight + lineGap + simRacingTextHeight;

  // Scale logo to be slightly larger - increase the multiplier
  const logoScaleMultiplier = 1.3; // Make logo 30% larger than text block
  const desiredLogoHeight = textBlockHeight * logoScaleMultiplier;
  const logoScale = desiredLogoHeight / adrrLogoBlack.height;
  const adrrLogoWidth = adrrLogoBlack.width * logoScale;
  const adrrLogoHeight = adrrLogoBlack.height * logoScale;

  // Position logo with equal padding from top and left
  const adrrLogoX = innerRectX + padding;
  const adrrLogoY = innerRectY + padding;

  ctx.drawImage(adrrLogoBlack, adrrLogoX, adrrLogoY, adrrLogoWidth, adrrLogoHeight);

  // Position text to align with logo top and bottom
  const adrrTextX = adrrLogoX + adrrLogoWidth + padding;
  
  // Align top of "ADRR" text with top of logo
  ctx.font = `bold ${adrrFontSize}px "URW DIN"`;
  const adrrTextMetrics = ctx.measureText('ADRR');
  // For top alignment with 'top' baseline, position directly at logo top
  const adrrTextY = adrrLogoY + 18;
  ctx.textBaseline = 'top';
  ctx.fillText('ADRR', adrrTextX, adrrTextY);

  // Calculate the font size for "SIM RACING" to match ADRR width without squashing
  const targetWidth = adrrTextWidth;
  let adjustedSimRacingFontSize = simRacingFontSize;
  
  // Iteratively find the right font size
  ctx.font = `${adjustedSimRacingFontSize}px "URW DIN"`;
  let currentSimRacingWidth = ctx.measureText(simRacingText).width;
  
  while (currentSimRacingWidth > targetWidth && adjustedSimRacingFontSize > 10) {
    adjustedSimRacingFontSize -= 0.5;
    ctx.font = `${adjustedSimRacingFontSize}px "URW DIN"`;
    currentSimRacingWidth = ctx.measureText(simRacingText).width;
  }
  
  // Position "SIM RACING" to align bottom with logo bottom
  const adjustedSimRacingMetrics = ctx.measureText(simRacingText);
  const adjustedSimRacingHeight = adjustedSimRacingMetrics.actualBoundingBoxAscent + adjustedSimRacingMetrics.actualBoundingBoxDescent;
  // For bottom alignment with 'top' baseline, position so text bottom aligns with logo bottom
  const simRacingTextY = adrrLogoY + adrrLogoHeight - adjustedSimRacingHeight;
  
  ctx.font = `${adjustedSimRacingFontSize}px "URW DIN"`;
  ctx.textBaseline = 'top';
  ctx.fillText(simRacingText, adrrTextX, simRacingTextY);

  // 4. Draw main title and date with proper spacing
  const brandingBlockBottom = adrrLogoY + adrrLogoHeight;
  const titleSpacing = padding * 3; // More generous spacing between branding and title
  const titleY = brandingBlockBottom + titleSpacing;
  const dateSpacing = -5; // Spacing between title and date
  const dateY = titleY + 60 + dateSpacing; // 60 is approximate height of title text

  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold italic 48px "URW DIN"';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top'; // Reset to top for title and date
  ctx.fillText(title, innerRectX + padding, titleY - 15);

  ctx.font = '34px "URW DIN"';
  ctx.fillText("S2 / ROUND 5", innerRectX + padding, dateY + dateSpacing);
  ctx.fillText(date, innerRectX + padding, dateY + dateSpacing +45);

  ctx.fillText('HYP / LMGT3', innerRectX + padding, dateY + dateSpacing + 90);

  ctx.font = 'bold 26px "URW DIN"';
  ctx.fillText('ADRR.net', innerRectX + padding, dateY + dateSpacing + 150);

  // 5. Draw the inset image
  try {
    const eventImg = await loadImage(imgAttachment.url);

    const frameHeight = innerRectHeight;
    const frameWidth = innerRectWidth * 0.45;
    const frameX = innerRectX + innerRectWidth - frameWidth;
    const frameY = innerRectY;
    const cornerRadius = 20;

    const imgAspectRatio = eventImg.width / eventImg.height;
    const newImageHeight = frameHeight;
    const newImageWidth = newImageHeight * imgAspectRatio;
    const newImageX = frameX - (newImageWidth - frameWidth) / 2;
    const newImageY = frameY;

    ctx.save();
    roundedRect(ctx, frameX, frameY, frameWidth, frameHeight, cornerRadius);
    ctx.clip();
    ctx.drawImage(eventImg as Image, newImageX, newImageY, newImageWidth, newImageHeight);
    ctx.restore();
  } catch (err) {
    console.error('Error loading event image:', err);
  }

  const buffer = canvas.toBuffer('image/png');
  const attachment = { data: buffer, name: 'event.png' };

  await interaction.editReply({ files: [attachment] });
  console.log({ adrrLogoWidth, adrrLogoHeight, adrrTextWidth });
}

runImageGeneration(mockInteraction);
console.log('Font path:', path.join(__dirname, 'src/assets/fonts/urw-din-black.ttf'));