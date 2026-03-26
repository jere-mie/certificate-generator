import { useCallback, useRef } from 'react';
import { Upload, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { renderPdfPageToImage } from '@/lib/pdfPreview';
import type { TemplateData } from '@/types';

interface Props {
  onTemplateLoaded: (template: TemplateData) => void;
}

export function TemplateUpload({ onTemplateLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    if (file.type === 'application/pdf') {
      const { url, width, height } = await renderPdfPageToImage(bytes);
      onTemplateLoaded({ type: 'pdf', originalBytes: bytes, previewUrl: url, width, height });
    } else if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      const img = document.createElement('img');
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = url;
      });
      onTemplateLoaded({
        type: 'image',
        originalBytes: bytes,
        previewUrl: url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
  }, [onTemplateLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-xl p-12 hover:border-primary/50 transition-colors cursor-pointer min-h-[400px]"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
    >
      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">Upload Certificate Template</h2>
      <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">
        Drag & drop or click to upload a <strong>PDF</strong> or <strong>image</strong> file to use as your certificate template.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" className="gap-2" type="button">
          <FileText className="h-4 w-4" /> PDF
        </Button>
        <Button variant="outline" size="sm" className="gap-2" type="button">
          <Image className="h-4 w-4" /> Image
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
