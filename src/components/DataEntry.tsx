import { useState, useCallback } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CertificateField, DataRow } from '@/types';

interface Props {
  fields: CertificateField[];
  dataRows: DataRow[];
  onDataChange: (rows: DataRow[]) => void;
}

export function DataEntry({ fields, dataRows, onDataChange }: Props) {
  const [csvError, setCsvError] = useState<string | null>(null);

  const fieldNames = fields.map(f => f.name);

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

  const handleCsvUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) {
        setCsvError('CSV must have a header row and at least one data row.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const rows: DataRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: DataRow = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] ?? '';
        });
        rows.push(row);
      }

      onDataChange(rows);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [onDataChange]);

  if (fieldNames.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
        Add fields to the canvas first, then provide data here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Data ({dataRows.length} rows)</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs cursor-pointer relative" onClick={() => document.getElementById('csv-upload')?.click()}>
            <Upload className="h-3 w-3" /> CSV
            <input id="csv-upload" type="file" accept=".csv" className="hidden absolute inset-0 opacity-0 cursor-pointer" onChange={handleCsvUpload} />
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={addRow}>
            <Plus className="h-3 w-3" /> Row
          </Button>
        </div>
      </div>

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

      {dataRows.length === 0 && (
        <div className="text-xs text-muted-foreground text-center p-3 border border-dashed rounded-lg">
          Upload a CSV file or add rows manually. CSV headers should match your field names.
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <Label className="text-xs font-normal">Tip: Upload a CSV with column headers matching your field names ({fieldNames.join(', ')}).</Label>
      </div>
    </div>
  );
}
