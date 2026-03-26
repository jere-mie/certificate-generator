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

export const FONT_FAMILIES = [
  'Helvetica',
  'Times-Roman',
  'Courier',
] as const;

export const PDF_FONT_MAP: Record<string, 'Helvetica' | 'Helvetica-Bold' | 'Times-Roman' | 'Times-Bold' | 'Courier' | 'Courier-Bold'> = {
  'Helvetica': 'Helvetica',
  'Helvetica-bold': 'Helvetica-Bold',
  'Times-Roman': 'Times-Roman',
  'Times-Roman-bold': 'Times-Bold',
  'Courier': 'Courier',
  'Courier-bold': 'Courier-Bold',
};
