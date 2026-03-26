import { renderPdfPageToImage } from './pdfPreview';
import { registerDynamicFont, getDynamicFontBytes } from './fontAssets';
import type { TemplateData, StoredTemplate, StoredCustomFont, CustomFont } from '@/types';

// ── Base64 helpers ────────────────────────────────────────────────────────────

export function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── Template ─────────────────────────────────────────────────────────────────

export function serializeTemplate(template: TemplateData): StoredTemplate {
  return {
    type: template.type,
    originalBase64: uint8ToBase64(template.originalBytes),
    width: template.width,
    height: template.height,
  };
}

export async function deserializeTemplate(stored: StoredTemplate): Promise<TemplateData> {
  const originalBytes = base64ToUint8(stored.originalBase64);
  let previewUrl: string;
  if (stored.type === 'pdf') {
    const result = await renderPdfPageToImage(originalBytes);
    previewUrl = result.url;
  } else {
    previewUrl = URL.createObjectURL(new Blob([originalBytes as Uint8Array<ArrayBuffer>]));
  }
  return {
    type: stored.type,
    originalBytes,
    previewUrl,
    width: stored.width,
    height: stored.height,
  };
}

// ── Custom fonts ──────────────────────────────────────────────────────────────

export function serializeCustomFont(
  family: string,
  source: CustomFont['source'],
): StoredCustomFont | null {
  const bytes = getDynamicFontBytes(family);
  if (!bytes) return null;
  return {
    family,
    source,
    normalBase64: bytes.normal ? uint8ToBase64(bytes.normal) : null,
    boldBase64: bytes.bold ? uint8ToBase64(bytes.bold) : null,
  };
}

export async function deserializeCustomFont(
  stored: StoredCustomFont,
): Promise<CustomFont | null> {
  try {
    const normalBytes = stored.normalBase64 ? base64ToUint8(stored.normalBase64) : null;
    const boldBytes = stored.boldBase64 ? base64ToUint8(stored.boldBase64) : null;
    if (!normalBytes) return null;

    const normalFace = new FontFace(stored.family, normalBytes.buffer as ArrayBuffer, { weight: '400' });
    await normalFace.load();
    document.fonts.add(normalFace);

    if (boldBytes) {
      const boldFace = new FontFace(stored.family, boldBytes.buffer as ArrayBuffer, { weight: '700' });
      await boldFace.load();
      document.fonts.add(boldFace);
    }

    registerDynamicFont(stored.family, normalBytes, boldBytes);
    return { family: stored.family, source: stored.source };
  } catch {
    return null;
  }
}
