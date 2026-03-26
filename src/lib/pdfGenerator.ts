import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import JSZip from 'jszip';
import type { CertificateField, TemplateData, DataRow } from '@/types';
import { PDF_FONT_MAP, PDF_STANDARD_FONTS } from '@/types';
import { isCustomFont, getCustomFontBytes } from './fontAssets';

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
}

async function createSingleCertificate(
  template: TemplateData,
  fields: CertificateField[],
  row: DataRow
): Promise<Uint8Array> {
  let pdfDoc: PDFDocument;

  if (template.type === 'pdf') {
    pdfDoc = await PDFDocument.load(template.originalBytes);
  } else {
    pdfDoc = await PDFDocument.create();
    const imgBytes = template.originalBytes;
    const isPng = imgBytes[0] === 0x89 && imgBytes[1] === 0x50;
    const img = isPng
      ? await pdfDoc.embedPng(imgBytes)
      : await pdfDoc.embedJpg(imgBytes);
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }

  pdfDoc.registerFontkit(fontkit);

  const page = pdfDoc.getPages()[0];
  const { width: pageWidth, height: pageHeight } = page.getSize();

  const fontCache: Record<string, Awaited<ReturnType<typeof pdfDoc.embedFont>>> = {};

  for (const field of fields) {
    const text = row[field.name] ?? '';
    if (!text) continue;

    const cacheKey = `${field.fontFamily}__${field.fontWeight}`;
    if (!fontCache[cacheKey]) {
      if (isCustomFont(field.fontFamily)) {
        const bytes = await getCustomFontBytes(field.fontFamily, field.fontWeight);
        fontCache[cacheKey] = await pdfDoc.embedFont(bytes);
      } else if (PDF_STANDARD_FONTS.has(field.fontFamily)) {
        const stdKey = field.fontWeight === 'bold'
          ? `${field.fontFamily}-bold`
          : field.fontFamily;
        const mapped = PDF_FONT_MAP[stdKey] ?? 'Helvetica';
        fontCache[cacheKey] = await pdfDoc.embedFont(StandardFonts[mapped as keyof typeof StandardFonts]);
      } else {
        fontCache[cacheKey] = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }
    }
    const font = fontCache[cacheKey];

    const scaleX = pageWidth / template.width;
    const scaleY = pageHeight / template.height;

    const pdfX = field.x * scaleX;
    const pdfY = pageHeight - field.y * scaleY;
    const pdfFontSize = field.fontSize * scaleY;

    const textWidth = font.widthOfTextAtSize(text, pdfFontSize);

    let xPos = pdfX;
    if (field.textAlign === 'center') {
      xPos = pdfX - textWidth / 2;
    } else if (field.textAlign === 'right') {
      xPos = pdfX - textWidth;
    }

    page.drawText(text, {
      x: xPos,
      y: pdfY - pdfFontSize,
      size: pdfFontSize,
      font,
      color: hexToRgb(field.fontColor),
    });
  }

  return pdfDoc.save();
}

export async function generateMergedPdf(
  template: TemplateData,
  fields: CertificateField[],
  dataRows: DataRow[]
): Promise<Uint8Array> {
  const merged = await PDFDocument.create();

  for (const row of dataRows) {
    const singleBytes = await createSingleCertificate(template, fields, row);
    const singleDoc = await PDFDocument.load(singleBytes);
    const [copiedPage] = await merged.copyPages(singleDoc, [0]);
    merged.addPage(copiedPage);
  }

  return merged.save();
}

export async function generateZip(
  template: TemplateData,
  fields: CertificateField[],
  dataRows: DataRow[]
): Promise<Uint8Array> {
  const zip = new JSZip();

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const pdfBytes = await createSingleCertificate(template, fields, row);
    const name = Object.values(row)[0] || `certificate_${i + 1}`;
    zip.file(`${name}.pdf`, pdfBytes);
  }

  const blob = await zip.generateAsync({ type: 'uint8array' });
  return blob;
}

export function downloadFile(data: Uint8Array, filename: string, mime: string) {
  const blob = new Blob([data as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
