import { useState, useCallback } from 'react';
import type { CertificateField, CustomFont, TemplateData, DataRow } from '@/types';

const DEFAULT_FONT_SIZE = 24;
let fieldCounter = 0;

export function useAppState() {
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [fields, setFields] = useState<CertificateField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [dataRows, setDataRows] = useState<DataRow[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);

  const addCustomFont = useCallback((font: CustomFont) => {
    setCustomFonts(prev => prev.some(f => f.family === font.family) ? prev : [...prev, font]);
  }, []);

  const addField = useCallback((x: number, y: number) => {
    const count = ++fieldCounter;
    const id = `field-${count}-${Math.random().toString(36).slice(2, 7)}`;
    // Offset y so the click point becomes the vertical center of the field
    const centeredY = y - (DEFAULT_FONT_SIZE * 1.25) / 2;
    const newField: CertificateField = {
      id,
      name: `Field ${count}`,
      x,
      y: centeredY,
      fontFamily: 'Helvetica',
      fontSize: DEFAULT_FONT_SIZE,
      fontWeight: 'normal',
      fontColor: '#000000',
      textAlign: 'center',
    };
    setFields(prev => [...prev, newField]);
    setSelectedFieldId(id);
    setEditingNameId(id);
  }, []);

  const updateField = useCallback((id: string, updates: Partial<CertificateField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const removeField = useCallback((id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    setSelectedFieldId(prev => prev === id ? null : prev);
  }, []);

  const clearEditingName = useCallback(() => setEditingNameId(null), []);

  /** Replace all app state at once (used when loading a saved project). */
  const loadState = useCallback((state: {
    template: TemplateData | null;
    fields: CertificateField[];
    dataRows: DataRow[];
    customFonts: CustomFont[];
  }) => {
    // Sync the field counter so new fields don't collide with loaded ones
    const maxNum = state.fields.reduce((max, f) => {
      const m = f.name.match(/^Field (\d+)$/);
      return m ? Math.max(max, parseInt(m[1])) : max;
    }, 0);
    if (maxNum > fieldCounter) fieldCounter = maxNum;

    setTemplate(state.template);
    setFields(state.fields);
    setDataRows(state.dataRows);
    setCustomFonts(state.customFonts);
    setSelectedFieldId(null);
    setEditingNameId(null);
    setPreviewIndex(0);
  }, []);

  const selectedField = fields.find(f => f.id === selectedFieldId) ?? null;

  return {
    template,
    setTemplate,
    fields,
    setFields,
    selectedFieldId,
    setSelectedFieldId,
    editingNameId,
    clearEditingName,
    selectedField,
    addField,
    updateField,
    removeField,
    dataRows,
    setDataRows,
    previewIndex,
    setPreviewIndex,
    customFonts,
    addCustomFont,
    loadState,
  };
}
