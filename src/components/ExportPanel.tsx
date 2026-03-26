import { useState } from 'react';
import { Download, FileArchive, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateMergedPdf, generateZip, downloadFile } from '@/lib/pdfGenerator';
import type { CertificateField, TemplateData, DataRow } from '@/types';

interface Props {
  template: TemplateData;
  fields: CertificateField[];
  dataRows: DataRow[];
  previewIndex: number;
  onPreviewIndexChange: (index: number) => void;
}

export function ExportPanel({ template, fields, dataRows, previewIndex, onPreviewIndexChange }: Props) {
  const [loading, setLoading] = useState<'merged' | 'zip' | null>(null);

  const canExport = dataRows.length > 0 && fields.length > 0;

  const handleMergedPdf = async () => {
    if (!canExport) return;
    setLoading('merged');
    try {
      const bytes = await generateMergedPdf(template, fields, dataRows);
      downloadFile(bytes, 'certificates.pdf', 'application/pdf');
    } finally {
      setLoading(null);
    }
  };

  const handleZip = async () => {
    if (!canExport) return;
    setLoading('zip');
    try {
      const bytes = await generateZip(template, fields, dataRows);
      downloadFile(bytes, 'certificates.zip', 'application/zip');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Export & Preview</h3>

      {dataRows.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={previewIndex <= 0}
            onClick={() => onPreviewIndexChange(previewIndex - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Preview: {previewIndex + 1} / {dataRows.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={previewIndex >= dataRows.length - 1}
            onClick={() => onPreviewIndexChange(previewIndex + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          onClick={handleMergedPdf}
          disabled={!canExport || loading !== null}
          className="gap-2"
        >
          {loading === 'merged' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Single PDF (All Pages)
        </Button>
        <Button
          variant="outline"
          onClick={handleZip}
          disabled={!canExport || loading !== null}
          className="gap-2"
        >
          {loading === 'zip' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileArchive className="h-4 w-4" />}
          ZIP (Individual PDFs)
        </Button>
      </div>

      {!canExport && (
        <p className="text-xs text-muted-foreground">
          Add fields and data rows to enable export.
        </p>
      )}
    </div>
  );
}
