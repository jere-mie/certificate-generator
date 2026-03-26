// Font WOFF2 file URLs imported via Vite for PDF embedding.
// All fonts are bundled locally via @fontsource – no external requests at runtime.
import robotoNormalUrl from '@fontsource/roboto/files/roboto-latin-400-normal.woff2?url';
import robotoBoldUrl from '@fontsource/roboto/files/roboto-latin-700-normal.woff2?url';
import openSansNormalUrl from '@fontsource/open-sans/files/open-sans-latin-400-normal.woff2?url';
import openSansBoldUrl from '@fontsource/open-sans/files/open-sans-latin-700-normal.woff2?url';
import latoNormalUrl from '@fontsource/lato/files/lato-latin-400-normal.woff2?url';
import latoBoldUrl from '@fontsource/lato/files/lato-latin-700-normal.woff2?url';
import montserratNormalUrl from '@fontsource/montserrat/files/montserrat-latin-400-normal.woff2?url';
import montserratBoldUrl from '@fontsource/montserrat/files/montserrat-latin-700-normal.woff2?url';
import poppinsNormalUrl from '@fontsource/poppins/files/poppins-latin-400-normal.woff2?url';
import poppinsBoldUrl from '@fontsource/poppins/files/poppins-latin-700-normal.woff2?url';
import ralewayNormalUrl from '@fontsource/raleway/files/raleway-latin-400-normal.woff2?url';
import ralewayBoldUrl from '@fontsource/raleway/files/raleway-latin-700-normal.woff2?url';
import oswaldNormalUrl from '@fontsource/oswald/files/oswald-latin-400-normal.woff2?url';
import oswaldBoldUrl from '@fontsource/oswald/files/oswald-latin-700-normal.woff2?url';
import nunitoNormalUrl from '@fontsource/nunito/files/nunito-latin-400-normal.woff2?url';
import nunitoBoldUrl from '@fontsource/nunito/files/nunito-latin-700-normal.woff2?url';
import josefinNormalUrl from '@fontsource/josefin-sans/files/josefin-sans-latin-400-normal.woff2?url';
import josefinBoldUrl from '@fontsource/josefin-sans/files/josefin-sans-latin-700-normal.woff2?url';
import quicksandNormalUrl from '@fontsource/quicksand/files/quicksand-latin-400-normal.woff2?url';
import quicksandBoldUrl from '@fontsource/quicksand/files/quicksand-latin-700-normal.woff2?url';
import merriweatherNormalUrl from '@fontsource/merriweather/files/merriweather-latin-400-normal.woff2?url';
import merriweatherBoldUrl from '@fontsource/merriweather/files/merriweather-latin-700-normal.woff2?url';
import playfairNormalUrl from '@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff2?url';
import playfairBoldUrl from '@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2?url';
import ebGaramondNormalUrl from '@fontsource/eb-garamond/files/eb-garamond-latin-400-normal.woff2?url';
import ebGaramondBoldUrl from '@fontsource/eb-garamond/files/eb-garamond-latin-700-normal.woff2?url';
import libreBaskervilleNormalUrl from '@fontsource/libre-baskerville/files/libre-baskerville-latin-400-normal.woff2?url';
import libreBaskervilleBoldUrl from '@fontsource/libre-baskerville/files/libre-baskerville-latin-700-normal.woff2?url';
import ptSerifNormalUrl from '@fontsource/pt-serif/files/pt-serif-latin-400-normal.woff2?url';
import ptSerifBoldUrl from '@fontsource/pt-serif/files/pt-serif-latin-700-normal.woff2?url';
import cormorantNormalUrl from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2?url';
import cormorantBoldUrl from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-700-normal.woff2?url';
import cinzelNormalUrl from '@fontsource/cinzel/files/cinzel-latin-400-normal.woff2?url';
import cinzelBoldUrl from '@fontsource/cinzel/files/cinzel-latin-700-normal.woff2?url';
import dancingNormalUrl from '@fontsource/dancing-script/files/dancing-script-latin-400-normal.woff2?url';
import dancingBoldUrl from '@fontsource/dancing-script/files/dancing-script-latin-700-normal.woff2?url';
import greatVibesUrl from '@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff2?url';
import pacificoUrl from '@fontsource/pacifico/files/pacifico-latin-400-normal.woff2?url';
import lobsterUrl from '@fontsource/lobster/files/lobster-latin-400-normal.woff2?url';

const STATIC_FONT_URLS: Record<string, { normal: string; bold: string }> = {
  'Roboto':               { normal: robotoNormalUrl,             bold: robotoBoldUrl },
  'Open Sans':            { normal: openSansNormalUrl,           bold: openSansBoldUrl },
  'Lato':                 { normal: latoNormalUrl,               bold: latoBoldUrl },
  'Montserrat':           { normal: montserratNormalUrl,         bold: montserratBoldUrl },
  'Poppins':              { normal: poppinsNormalUrl,            bold: poppinsBoldUrl },
  'Raleway':              { normal: ralewayNormalUrl,            bold: ralewayBoldUrl },
  'Oswald':               { normal: oswaldNormalUrl,             bold: oswaldBoldUrl },
  'Nunito':               { normal: nunitoNormalUrl,             bold: nunitoBoldUrl },
  'Josefin Sans':         { normal: josefinNormalUrl,            bold: josefinBoldUrl },
  'Quicksand':            { normal: quicksandNormalUrl,          bold: quicksandBoldUrl },
  'Merriweather':         { normal: merriweatherNormalUrl,       bold: merriweatherBoldUrl },
  'Playfair Display':     { normal: playfairNormalUrl,           bold: playfairBoldUrl },
  'EB Garamond':          { normal: ebGaramondNormalUrl,         bold: ebGaramondBoldUrl },
  'Libre Baskerville':    { normal: libreBaskervilleNormalUrl,   bold: libreBaskervilleBoldUrl },
  'PT Serif':             { normal: ptSerifNormalUrl,            bold: ptSerifBoldUrl },
  'Cormorant Garamond':   { normal: cormorantNormalUrl,          bold: cormorantBoldUrl },
  'Cinzel':               { normal: cinzelNormalUrl,             bold: cinzelBoldUrl },
  'Dancing Script':       { normal: dancingNormalUrl,            bold: dancingBoldUrl },
  'Great Vibes':          { normal: greatVibesUrl,               bold: greatVibesUrl },
  'Pacifico':             { normal: pacificoUrl,                 bold: pacificoUrl },
  'Lobster':              { normal: lobsterUrl,                  bold: lobsterUrl },
};

// Dynamic registry for user-uploaded or Google Fonts loaded at runtime
const dynamicFontRegistry = new Map<string, { normal: Uint8Array | null; bold: Uint8Array | null }>();

export function registerDynamicFont(
  family: string,
  normalBytes: Uint8Array | null,
  boldBytes: Uint8Array | null = null,
) {
  dynamicFontRegistry.set(family, { normal: normalBytes, bold: boldBytes });
}

export function getDynamicFontBytes(
  family: string,
): { normal: Uint8Array | null; bold: Uint8Array | null } | null {
  return dynamicFontRegistry.get(family) ?? null;
}

export function isCustomFont(family: string): boolean {
  return family in STATIC_FONT_URLS || dynamicFontRegistry.has(family);
}

const urlBytesCache = new Map<string, ArrayBuffer>();

export async function getCustomFontBytes(family: string, weight: 'normal' | 'bold'): Promise<Uint8Array> {
  // Dynamic registry (uploaded / Google Fonts)
  const dynamic = dynamicFontRegistry.get(family);
  if (dynamic) {
    const bytes = weight === 'bold' ? (dynamic.bold ?? dynamic.normal) : dynamic.normal;
    if (bytes) return bytes;
  }

  // Static bundled fonts
  const entry = STATIC_FONT_URLS[family];
  if (!entry) throw new Error(`No font asset registered for "${family}"`);
  const url = weight === 'bold' ? entry.bold : entry.normal;
  if (!urlBytesCache.has(url)) {
    const res = await fetch(url);
    urlBytesCache.set(url, await res.arrayBuffer());
  }
  return new Uint8Array(urlBytesCache.get(url)!);
}
