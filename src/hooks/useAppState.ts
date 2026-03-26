import { useState, useCallback } from 'react';
import type { CertificateField, TemplateData, DataRow } from '@/types';

let fieldCounter = 0;

export function useAppState() {
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [fields, setFields] = useState<CertificateField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [dataRows, setDataRows] = useState<DataRow[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const addField = useCallback((x: number, y: number) => {
    const id = `field-${++fieldCounter}`;
    const newField: CertificateField = {
      id,
      name: `Field ${fieldCounter}`,
      x,
      y,
      fontFamily: 'Helvetica',
      fontSize: 24,
      fontWeight: 'normal',
      fontColor: '#000000',
      textAlign: 'center',
    };
    setFields(prev => [...prev, newField]);
    setSelectedFieldId(id);
  }, []);

  const updateField = useCallback((id: string, updates: Partial<CertificateField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const removeField = useCallback((id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    setSelectedFieldId(prev => prev === id ? null : prev);
  }, []);

  const selectedField = fields.find(f => f.id === selectedFieldId) ?? null;

  return {
    template,
    setTemplate,
    fields,
    setFields,
    selectedFieldId,
    setSelectedFieldId,
    selectedField,
    addField,
    updateField,
    removeField,
    dataRows,
    setDataRows,
    previewIndex,
    setPreviewIndex,
  };
}
