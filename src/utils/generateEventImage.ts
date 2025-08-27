import { createCanvas, loadImage, GlobalFonts, Image } from '@napi-rs/canvas';
import { EventData } from '../interfaces/eventImage';
import { readFileSync } from 'fs';
import path from 'path';

let fontRegistered = false;

// Helper function to recolor a PNG image.
// Helper function to recolor a PNG image.
async function recolorImage(imagePath: string, targetColor: string): Promise<Image> {
  try {
    console.log('Recoloring image from:', imagePath);
    
    const imgBuffer = readFileSync(imagePath);
    console.log('Buffer size:', imgBuffer.length);
    
    const img = await loadImage(imgBuffer);
    console.log('Original image dimensions:', img.width, 'x', img.height);
    
    const tempCanvas = createCanvas(img.width, img.height);
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(img, 0, 0);
    tempCtx.globalCompositeOperation = 'source-in';
    tempCtx.fillStyle = targetColor;
    tempCtx.fillRect(0, 0, img.width, img.height);
    tempCtx.globalCompositeOperation = 'source-over';

    // Instead of creating a new Image object, return the result directly from loadImage
    const buffer = tempCanvas.toBuffer('image/png');
    console.log('Recolored buffer size:', buffer.length);
    
    // Load the recolored buffer back as an image
    const recoloredImg = await loadImage(buffer);
    console.log('Final recolored image dimensions:', recoloredImg.width, 'x', recoloredImg.height);
    
    return recoloredImg;
  } catch (error) {
    console.error('Error recoloring image:', error);
    throw error;
  }
}

// Function to create a rounded rectangle path.
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

// Function to draw the diagonal background stripes.
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

/**
 * Generates an event banner image with the provided data.
 * @param {EventData} data The object containing all event details.
 * @returns {Promise<Buffer>} The generated image as a Buffer.
 */
export async function generateEventImage(data: EventData): Promise<Buffer> {
  const fontPath = path.resolve(__dirname, '../../assets/fonts/urw-din-black.ttf');
  const fontPath2 = path.resolve(__dirname, '../../assets/fonts/RobotoMono-SemiBold.ttf');
  const adrrLogoPath = path.resolve(__dirname, '../../assets/images/ADRR.png');

  console.log('adrrLogoPath:', adrrLogoPath);
  console.log('fontPath:', fontPath);

  // Add file existence checks
  console.log('Font file exists:', require('fs').existsSync(fontPath));
  console.log('Logo file exists:', require('fs').existsSync(adrrLogoPath));

  // Register font once
  if (!fontRegistered) {
    GlobalFonts.registerFromPath(fontPath, 'URW DIN');
    GlobalFonts.registerFromPath(fontPath2, 'Roboto Mono');
    fontRegistered = true;
  }
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  console.log(`canvas created. data: ${JSON.stringify(data)}`);

  const { title, seasonRound, date, classes, colour, imagePath } = data;

  // 1. Draw the diagonal border
  drawDiagonalBorder(ctx, width, height, 50, ['#1a1a1a', colour]);

  // 2. Draw the inner white rectangle
  ctx.fillStyle = '#f9f9f9';
  const borderWidth = 30;
  roundedRect(ctx, borderWidth, borderWidth, width - borderWidth * 2, height - borderWidth * 2, 25);
  ctx.fill();

  // Define the content area for consistent positioning
  const innerRectX = 45;
  const innerRectY = 45;
  const innerRectWidth = width - 2 * innerRectX;
  const innerRectHeight = height - 2 * innerRectY;

  // 3. Draw ADRR logo and text
  const padding = 20;
  const adrrLogoWhite = adrrLogoPath;
  const adrrLogoBlack = await recolorImage(adrrLogoWhite, '#1a1a1a');

  console.log('adrrLogoBlack created');

  // Calculate text metrics
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#1a1a1a';
  const adrrFontSize = 45;
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

  const lineGap = 5;
  const textBlockHeight = adrrTextHeight + lineGap + simRacingTextHeight;
  const logoScaleMultiplier = 1;
  const desiredLogoHeight = textBlockHeight * logoScaleMultiplier;
  const logoScale = desiredLogoHeight / adrrLogoBlack.height;
  const adrrLogoWidth = adrrLogoBlack.width * logoScale;
  const adrrLogoHeight = adrrLogoBlack.height * logoScale;

  const adrrLogoX = innerRectX + padding;
  const adrrLogoY = innerRectY + padding;

  // Add this debugging after the logo scaling calculations:
  // console.log('=== COORDINATE DEBUG ===');
  // console.log('adrrLogoBlack.height:', adrrLogoBlack.height);
  // console.log('adrrLogoBlack.width:', adrrLogoBlack.width);
  // console.log('textBlockHeight:', textBlockHeight);
  // console.log('desiredLogoHeight:', desiredLogoHeight);
  // console.log('logoScale:', logoScale);
  // console.log('adrrLogoWidth:', adrrLogoWidth);
  // console.log('adrrLogoHeight:', adrrLogoHeight);
  // console.log('adrrLogoX:', adrrLogoX);
  // console.log('adrrLogoY:', adrrLogoY);
  // console.log(
  //   'adrrTextX calculation:',
  //   adrrLogoX,
  //   '+',
  //   adrrLogoWidth,
  //   '+',
  //   padding,
  //   '=',
  //   adrrLogoX + adrrLogoWidth + padding
  // );

  ctx.drawImage(adrrLogoBlack, adrrLogoX, adrrLogoY, adrrLogoWidth, adrrLogoHeight);

  const adrrTextX = adrrLogoX + adrrLogoWidth + padding;
  ctx.font = `bold ${adrrFontSize}px "URW DIN"`;
  
  const adrrTextY = adrrLogoY + 18;
  ctx.textBaseline = 'top';
  ctx.fillText('ADRR', adrrTextX, adrrTextY);

  const targetWidth = adrrTextWidth;
  let adjustedSimRacingFontSize = simRacingFontSize;

  ctx.font = `${adjustedSimRacingFontSize}px "URW DIN"`;
  let currentSimRacingWidth = ctx.measureText(simRacingText).width;

  while (currentSimRacingWidth > targetWidth && adjustedSimRacingFontSize > 10) {
    adjustedSimRacingFontSize -= 0.5;
    ctx.font = `${adjustedSimRacingFontSize}px "URW DIN"`;
    currentSimRacingWidth = ctx.measureText(simRacingText).width;
  }

  const adjustedSimRacingMetrics = ctx.measureText(simRacingText);
  const adjustedSimRacingHeight =
    adjustedSimRacingMetrics.actualBoundingBoxAscent + adjustedSimRacingMetrics.actualBoundingBoxDescent;
  const simRacingTextY = adrrLogoY + adrrLogoHeight - (adjustedSimRacingHeight * 0.4);

  ctx.font = `${adjustedSimRacingFontSize}px "URW DIN"`;
  ctx.textBaseline = 'top';
  ctx.fillText(simRacingText, adrrTextX, simRacingTextY);

  const brandingBlockBottom = adrrLogoY + adrrLogoHeight;
  const titleSpacing = padding * 3;
  const titleY = brandingBlockBottom + titleSpacing;
  const dateSpacing = -20;
  const dateY = titleY + 60 + dateSpacing;

  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold italic 48px "URW DIN"';

  // Before drawing title
  console.log('Drawing title at:', innerRectX + padding, titleY - 15);
  console.log('Title text:', title);
  ctx.fillText(title, innerRectX + padding, titleY - 15);

  ctx.font = 'bold 28px "Roboto Mono"';
  ctx.fillText(seasonRound, innerRectX + padding, dateY + dateSpacing);
  ctx.fillText(date, innerRectX + padding, dateY + dateSpacing + 40);
  ctx.fillText(classes, innerRectX + padding, dateY + dateSpacing + 80);

  ctx.font = 'bold 24px "Roboto Mono"';
  ctx.fillText('www.adrr.net', innerRectX + padding, dateY + dateSpacing + 170); // 5. Draw the inset image

  console.log('inset image drawn');

  try {
    const eventImg = await loadImage(imagePath);
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

  try {
    const eventImg = await loadImage(imagePath);

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

    // Clip and draw main event image
    ctx.save();
    roundedRect(ctx, frameX, frameY, frameWidth, frameHeight, cornerRadius);
    ctx.clip();
    ctx.drawImage(eventImg as Image, newImageX, newImageY, newImageWidth, newImageHeight);
    ctx.restore();

    // --- Add the FOT thumbnail in bottom-right corner ---
    const fotImgPath = data.logoImagePath;
    if (fotImgPath !== null) {
      const fotImg = await loadImage(fotImgPath);

      const fotScale = 0.5; // scale down the thumbnail to 25% of frame width
      const fotWidth = frameWidth * fotScale;
      const fotHeight = (fotImg.height / fotImg.width) * fotWidth;

      const fotX = frameX + frameWidth - fotWidth - 30; // +10 to slightly overlap outside
      const fotY = frameY + 20; // +10 to slightly overlap outside

      ctx.drawImage(fotImg, fotX, fotY, fotWidth, fotHeight);
    }

  } catch (err) {
    console.error('Error loading event or FOT image:', err);
  }

  return canvas.toBuffer('image/png');
}
