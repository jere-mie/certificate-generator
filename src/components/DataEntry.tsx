import { useState, useCallback, useMemo, useRef } from 'react';
import { Plus, Trash2, Upload, Clipboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CertificateField, DataRow } from '@/types';

interface Props {
  fields: CertificateField[];
  dataRows: DataRow[];
  onDataChange: (rows: DataRow[]) => void;
}

/** Parse a single CSV line, respecting double-quoted fields. */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function DataEntry({ fields, dataRows, onDataChange }: Props) {
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pendingRows, setPendingRows] = useState<DataRow[] | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const dragCounterRef = useRef(0);

  const fieldNames = useMemo(() => fields.map(f => f.name), [fields]);

  // Case-insensitive lookup: lowercase field name -> actual field name
  const fieldNameMap = useMemo(
    () => new Map(fieldNames.map(n => [n.toLowerCase(), n])),
    [fieldNames]
  );

  // Placeholder for the paste textarea: uses actual field names as example values
  const pasteAreaPlaceholder = useMemo(() => {
    const headers = fieldNames.join(',');
    const exampleRow = fieldNames.map(n => `${n.toLowerCase()} 1`).join(',');
    return `Paste CSV with headers on the first line:\n${headers}\n${exampleRow}`;
  }, [fieldNames]);

  const addRow = useCallback(() => {
    const row: DataRow = {};
    fieldNames.forEach(name => { row[name] = ''; });
    onDataChange([...dataRows, row]);
  }, [dataRows, fieldNames, onDataChange]);

  const updateCell = useCallback((rowIndex: number, fieldName: string, value: string) => {
    const updated = dataRows.map((row, i) =>
      i === rowIndex ? { ...row, [fieldName]: value } : row
    );
    onDataChange(updated);
  }, [dataRows, onDataChange]);

  const removeRow = useCallback((rowIndex: number) => {
    onDataChange(dataRows.filter((_, i) => i !== rowIndex));
  }, [dataRows, onDataChange]);

  /** Parse CSV text into rows. Returns rows on success, or null on error. */
  const parseCsvToRows = useCallback((text: string): DataRow[] | null => {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) {
      setCsvError('CSV must have a header row and at least one data row.');
      return null;
    }
    const headers = parseCsvLine(lines[0]);
    const rows: DataRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const row: DataRow = {};
      fieldNames.forEach(name => { row[name] = ''; });
      headers.forEach((header, idx) => {
        const fieldName = fieldNameMap.get(header.toLowerCase());
        if (fieldName !== undefined) {
          row[fieldName] = values[idx] ?? '';
        }
      });
      rows.push(row);
    }
    setCsvError(null);
    return rows;
  }, [fieldNames, fieldNameMap]);

  /** After parsing, either apply directly (no existing data) or prompt for replace/append. */
  const handleParsedRows = useCallback((rows: DataRow[]) => {
    if (dataRows.length > 0) {
      setPendingRows(rows);
    } else {
      onDataChange(rows);
    }
  }, [dataRows.length, onDataChange]);

  const applyReplace = useCallback(() => {
    if (pendingRows) { onDataChange(pendingRows); setPendingRows(null); }
  }, [pendingRows, onDataChange]);

  const applyAppend = useCallback(() => {
    if (pendingRows) { onDataChange([...dataRows, ...pendingRows]); setPendingRows(null); }
  }, [pendingRows, dataRows, onDataChange]);

  const cancelPending = useCallback(() => setPendingRows(null), []);

  const readFileAndParse = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'text/plain') {
      setCsvError('Please provide a CSV file.');
      return;
    }
    setCsvError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCsvToRows(ev.target?.result as string);
      if (rows) handleParsedRows(rows);
    };
    reader.readAsText(file);
  }, [parseCsvToRows, handleParsedRows]);

  const handleCsvUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFileAndParse(file);
    e.target.value = '';
  }, [readFileAndParse]);

  // Drag-and-drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items?.length > 0) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
    const file = e.dataTransfer.files?.[0];
    if (file) readFileAndParse(file);
  }, [readFileAndParse]);

  // Paste area handlers
  const handlePasteApply = useCallback(() => {
    if (!pasteText.trim()) return;
    const rows = parseCsvToRows(pasteText);
    if (rows) {
      handleParsedRows(rows);
      setPasteText('');
      setShowPasteArea(false);
    }
  }, [pasteText, parseCsvToRows, handleParsedRows]);

  const handlePasteKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handlePasteApply();
    }
  }, [handlePasteApply]);

  if (fieldNames.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
        Add fields to the canvas first, then provide data here.
      </div>
    );
  }

  return (
    <div
      className="space-y-4 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag-over overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 bg-primary/10 border-2 border-primary border-dashed rounded-lg flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Upload className="h-4 w-4" />
            Drop CSV file to import
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-semibold text-sm">Data ({dataRows.length} rows)</h3>
        {confirmClear ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-destructive font-medium">Clear all data?</span>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 text-xs"
              onClick={() => { onDataChange([]); setConfirmClear(false); }}
            >
              Yes, clear
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setConfirmClear(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs cursor-pointer"
              onClick={() => document.getElementById('csv-upload')?.click()}
            >
              <Upload className="h-3 w-3" /> CSV
              <input
                id="csv-upload"
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleCsvUpload}
              />
            </Button>
            <Button
              variant={showPasteArea ? 'secondary' : 'outline'}
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => { setShowPasteArea(v => !v); setCsvError(null); }}
            >
              <Clipboard className="h-3 w-3" /> Paste
            </Button>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={addRow}>
              <Plus className="h-3 w-3" /> Row
            </Button>
            {dataRows.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
                onClick={() => setConfirmClear(true)}
              >
                <X className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Paste CSV area */}
      {showPasteArea && (
        <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
          <p className="text-xs font-medium">Paste CSV data</p>
          <textarea
            autoFocus
            className="w-full h-28 text-xs font-mono p-2 border rounded-md bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder={pasteAreaPlaceholder}
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            onKeyDown={handlePasteKeyDown}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={handlePasteApply} disabled={!pasteText.trim()}>
              Apply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => { setShowPasteArea(false); setPasteText(''); setCsvError(null); }}
            >
              Cancel
            </Button>
            <span className="text-xs text-muted-foreground">Ctrl+Enter to apply</span>
          </div>
        </div>
      )}

      {/* Replace vs Append prompt */}
      {pendingRows && (
        <div className="p-3 border rounded-lg bg-muted/30 space-y-2">
          <p className="text-xs font-medium">
            Import {pendingRows.length} row{pendingRows.length !== 1 ? 's' : ''} — replace existing data or append?
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={applyReplace}>
              Replace all
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={applyAppend}>
              Append
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={cancelPending}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {csvError && (
        <p className="text-xs text-destructive">{csvError}</p>
      )}

      {dataRows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {fieldNames.map((name) => (
                  <th key={name} className="text-left p-2 font-medium text-xs">
                    {name}
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b last:border-0">
                  {fieldNames.map((name) => (
                    <td key={name} className="p-1">
                      <Input
                        value={row[name] ?? ''}
                        onChange={(e) => updateCell(rowIdx, name, e.target.value)}
                        className="h-7 text-xs"
                      />
                    </td>
                  ))}
                  <td className="p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeRow(rowIdx)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dataRows.length === 0 && !showPasteArea && (
        <div className="text-xs text-muted-foreground text-center p-5 border border-dashed rounded-lg space-y-1">
          <Upload className="h-5 w-5 mx-auto opacity-40" />
          <p>Drag & drop a CSV file here, click <strong>CSV</strong> to browse,</p>
          <p>or click <strong>Paste</strong> to paste CSV text directly.</p>
          <p className="opacity-60">Column headers are matched case-insensitively.</p>
        </div>
      )}
    </div>
  );
}
