export interface CertificateField {
  id: string;
  name: string;
  x: number;
  y: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontColor: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface TemplateData {
  type: 'pdf' | 'image';
  originalBytes: Uint8Array;
  previewUrl: string;
  width: number;
  height: number;
}

export type DataRow = Record<string, string>;

export interface CustomFont {
  family: string;
  source: 'upload' | 'google';
}

// ── Project persistence types ─────────────────────────────────────────────────

export interface StoredTemplate {
  type: 'pdf' | 'image';
  originalBase64: string;
  width: number;
  height: number;
}

export interface StoredCustomFont {
  family: string;
  source: 'upload' | 'google';
  normalBase64: string | null;
  boldBase64: string | null;
}

export interface ProjectMeta {
  id: string;
  name: string;
  lastModified: number;
}

export interface Project extends ProjectMeta {
  template: StoredTemplate | null;
  fields: CertificateField[];
  dataRows: DataRow[];
  storedFonts: StoredCustomFont[];
}

export const FONT_FAMILIES = [
  // PDF built-in
  'Helvetica',
  'Times-Roman',
  'Courier',
  // Sans-serif
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Oswald',
  'Nunito',
  'Josefin Sans',
  'Quicksand',
  // Serif
  'Merriweather',
  'Playfair Display',
  'EB Garamond',
  'Libre Baskerville',
  'PT Serif',
  'Cormorant Garamond',
  // Display / Script
  'Cinzel',
  'Dancing Script',
  'Great Vibes',
  'Pacifico',
  'Lobster',
] as const;

// Standard PDF fonts handled via pdf-lib's built-in StandardFonts (no embedding needed)
export const PDF_STANDARD_FONTS = new Set(['Helvetica', 'Times-Roman', 'Courier']);

export const PDF_FONT_MAP: Record<string, 'Helvetica' | 'Helvetica-Bold' | 'Times-Roman' | 'Times-Bold' | 'Courier' | 'Courier-Bold'> = {
  'Helvetica': 'Helvetica',
  'Helvetica-bold': 'Helvetica-Bold',
  'Times-Roman': 'Times-Roman',
  'Times-Roman-bold': 'Times-Bold',
  'Courier': 'Courier',
  'Courier-bold': 'Courier-Bold',
};
