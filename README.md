# Certificate Generator

A free, client-side certificate generator. Upload a template, define text fields, provide a list of data, and generate vectorized PDFs - all in your browser.

**Live:** [certificates.zxcv.fyi](https://certificates.zxcv.fyi)

## Features

- **Template Upload** - Upload a PDF or image file to use as your certificate background
- **Visual Field Editor** - Click and drag to place text fields on the canvas using Konva
- **Field Customization** - Set font family, size, weight, color, and alignment for each field
- **Data Entry** - Add data manually or import a CSV. Each row generates one certificate
- **Vectorized PDF Output** - Text is drawn as real vector text using pdf-lib, not flattened into images
- **Bulk Export** - Download a single multi-page PDF or a ZIP of individual PDFs

## Privacy

**All processing happens entirely in your browser.** No data is ever sent to a server. Your templates, data, and generated certificates never leave your device.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Vite](https://vite.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Canvas | [react-konva](https://konvajs.org/) |
| PDF Generation | [pdf-lib](https://pdf-lib.js.org/) |
| PDF Preview | [pdfjs-dist](https://mozilla.github.io/pdf.js/) |
| Bulk Export | [JSZip](https://stuk.github.io/jszip/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Deployment | GitHub Actions → GitHub Pages |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How It Works

1. **Upload** a PDF or image template
2. **Double-click** on the canvas to add text fields (or use the "Add" button)
3. **Configure** each field's font, size, color, and alignment in the sidebar
4. **Enter data** in the Data tab - each row becomes one certificate
5. **Export** as a single multi-page PDF or a ZIP of individual PDFs

## Deployment

The app deploys automatically to GitHub Pages via GitHub Actions on push to `main`. The workflow uses Node.js v24.

## License

MIT

Created by [Jeremie Bornais](https://jeremie.bornais.ca)
