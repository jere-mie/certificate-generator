import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CertificateField } from '@/types';
import { FONT_FAMILIES } from '@/types';

interface Props {
  field: CertificateField;
  onUpdate: (id: string, updates: Partial<CertificateField>) => void;
  onRemove: (id: string) => void;
}

export function FieldProperties({ field, onUpdate, onRemove }: Props) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Field Properties</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive"
          onClick={() => onRemove(field.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="field-name" className="text-xs">Field Name</Label>
        <Input
          id="field-name"
          value={field.name}
          onChange={(e) => onUpdate(field.id, { name: e.target.value })}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Font Family</Label>
        <Select
          value={field.fontFamily}
          onValueChange={(v) => { if (v) onUpdate(field.id, { fontFamily: v }); }}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="font-size" className="text-xs">Font Size</Label>
          <Input
            id="font-size"
            type="number"
            value={field.fontSize}
            onChange={(e) => onUpdate(field.id, { fontSize: Number(e.target.value) })}
            className="h-8 text-sm"
            min={8}
            max={200}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Weight</Label>
          <Select
            value={field.fontWeight}
            onValueChange={(v) => onUpdate(field.id, { fontWeight: v as 'normal' | 'bold' })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="font-color" className="text-xs">Color</Label>
          <div className="flex items-center gap-2">
            <input
              id="font-color"
              type="color"
              value={field.fontColor}
              onChange={(e) => onUpdate(field.id, { fontColor: e.target.value })}
              className="w-8 h-8 rounded border cursor-pointer"
            />
            <Input
              value={field.fontColor}
              onChange={(e) => onUpdate(field.id, { fontColor: e.target.value })}
              className="h-8 text-sm flex-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Alignment</Label>
          <Select
            value={field.textAlign}
            onValueChange={(v) => onUpdate(field.id, { textAlign: v as 'left' | 'center' | 'right' })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-muted-foreground">
        <div>X: {Math.round(field.x)}</div>
        <div>Y: {Math.round(field.y)}</div>
      </div>
    </div>
  );
}
