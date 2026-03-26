import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export async function renderPdfPageToImage(
  pdfBytes: Uint8Array,
  scale = 2
): Promise<{ url: string; width: number; height: number }> {
  // Pass a copy to pdfjs so it can transfer the ArrayBuffer to its worker
  // without detaching the original bytes (which are kept for pdf-lib export).
  const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;

  await page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]).promise;

  return {
    url: canvas.toDataURL('image/png'),
    width: viewport.width / scale,
    height: viewport.height / scale,
  };
}
