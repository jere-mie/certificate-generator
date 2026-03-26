import { registerDynamicFont } from './fontAssets';

// ---------------------------------------------------------------------------
// Google Fonts loader
// Accepts a full Google Fonts CSS2 URL or just a font-family name.
// Fetches woff2 bytes and registers via FontFace API for canvas + PDF.
// ---------------------------------------------------------------------------
export async function loadGoogleFont(input: string): Promise<{ family: string; success: boolean; error?: string }> {
  let family: string;
  let cssUrl: string;

  if (input.startsWith('http')) {
    // Extract first family value. Stop at : (weight specifier) or & (next param).
    // + encodes spaces in Google Fonts URLs, so the stop chars are only : and &.
    const match = input.match(/family=([^:&]+)/);
    if (!match) return { family: input, success: false, error: 'Could not parse font family from URL' };
    family = decodeURIComponent(match[1].replace(/\+/g, ' ').trim());
  } else {
    family = input.trim();
  }

  // Build CSS URL using + for spaces (do NOT use encodeURIComponent which turns + into %2B)
  cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}&display=swap`;

  try {
    const res = await fetch(cssUrl);
    if (!res.ok) throw new Error(`Google Fonts returned HTTP ${res.status}. Check that the font family name is spelled correctly.`);
    const css = await res.text();

    const pickWoff2Url = (cssText: string, weight: number): string | null => {
      const blocks = cssText.match(/@font-face\s*\{[^}]+\}/g) ?? [];
      const weighted = blocks.filter(b => {
        // Handle fixed weights ("400") and variable ranges ("100 900")
        const m = b.match(/font-weight:\s*(\d+)(?:\s+(\d+))?/);
        if (!m) return weight === 400;
        const lo = parseInt(m[1]);
        const hi = m[2] ? parseInt(m[2]) : lo;
        return weight >= lo && weight <= hi;
      });
      // Prefer the latin block (unicode-range starting at U+0000)
      const best = weighted.find(b => b.includes('unicode-range: U+0000')) ?? weighted[0] ?? null;
      if (!best) return null;
      const m = best.match(/url\(([^)]+\.woff2[^)]*)\)/);
      return m ? m[1] : null;
    };

    const normalUrl = pickWoff2Url(css, 400);
    const boldUrl   = pickWoff2Url(css, 700);

    const fetchBytes = async (url: string | null): Promise<ArrayBuffer | null> => {
      if (!url) return null;
      try {
        return await fetch(url).then(r => r.arrayBuffer());
      } catch {
        return null;
      }
    };

    const [normalBuffer, boldBuffer] = await Promise.all([fetchBytes(normalUrl), fetchBytes(boldUrl)]);
    if (!normalBuffer) throw new Error(`Could not fetch font files for "${family}".`);

    const normalBytes = new Uint8Array(normalBuffer);
    const boldBytes   = boldBuffer ? new Uint8Array(boldBuffer) : null;

    // Register via FontFace API so both canvas and CSS rendering use our chosen name
    const normalFace = new FontFace(family, normalBuffer, { weight: '400' });
    await normalFace.load();
    document.fonts.add(normalFace);
    if (boldBuffer) {
      const boldFace = new FontFace(family, boldBuffer, { weight: '700' });
      await boldFace.load();
      document.fonts.add(boldFace);
    }
    // Warm up canvas font cache
    await document.fonts.load(`16px "${family}"`);

    registerDynamicFont(family, normalBytes, boldBytes);
    return { family, success: true };
  } catch (err) {
    return { family, success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ---------------------------------------------------------------------------
// Font-file upload loader
// Accepts a File (TTF / OTF / WOFF / WOFF2).
// Registers via FontFace API for canvas + stores bytes for PDF embedding.
// ---------------------------------------------------------------------------
export async function loadFontFromFile(file: File): Promise<{ family: string; success: boolean; error?: string }> {
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());

    // Derive a clean CSS font-family name from the filename.
    // Strip the extension, bracket groups (e.g. [CRSV,ELSH,ELXP] in variable fonts),
    // and any remaining characters that are special in CSS font-family syntax (commas, etc.).
    const family = file.name
      .replace(/\.[a-z0-9]+$/i, '')           // remove extension
      .replace(/\[[^\]]*\]/g, '')             // remove [...] groups
      .replace(/[,;:]+/g, ' ')               // replace CSS separator chars with space
      .replace(/[-_]+/g, ' ')               // replace dashes/underscores with space
      .replace(/\s+/g, ' ')                 // collapse runs of spaces
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Custom Font';

    // Register with the browser via FontFace API
    const face = new FontFace(family, bytes.buffer as ArrayBuffer);
    await face.load();
    document.fonts.add(face);
    // Warm up canvas font cache so Konva renders it immediately
    await document.fonts.load(`16px "${family}"`);

    registerDynamicFont(family, bytes, null);
    return { family, success: true };
  } catch (err) {
    return { family: file.name, success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
