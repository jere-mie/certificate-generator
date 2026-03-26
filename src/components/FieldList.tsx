import { Plus, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CertificateField } from '@/types';

interface Props {
  fields: CertificateField[];
  selectedFieldId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function FieldList({ fields, selectedFieldId, onSelect, onAdd }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Fields</h3>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={onAdd}>
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-xs text-muted-foreground flex items-center gap-2 p-3 border border-dashed rounded-lg">
          <MousePointerClick className="h-4 w-4 shrink-0" />
          Double-click on the canvas to add a field, or click "Add" above.
        </div>
      ) : (
        <div className="space-y-1">
          {fields.map((field) => (
            <button
              key={field.id}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                field.id === selectedFieldId
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => onSelect(field.id)}
            >
              {field.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
