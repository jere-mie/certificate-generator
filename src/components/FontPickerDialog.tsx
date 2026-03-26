import { useState, useRef, useCallback } from 'react';
import { Search, Upload, Link, X, Check, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CustomFont } from '@/types';
import { loadGoogleFont, loadFontFromFile } from '@/lib/customFontLoader';

const FONT_CATEGORIES: Record<string, string[]> = {
  'Sans-Serif': ['Helvetica', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Oswald', 'Nunito', 'Josefin Sans', 'Quicksand'],
  'Serif': ['Times-Roman', 'Merriweather', 'Playfair Display', 'EB Garamond', 'Libre Baskerville', 'PT Serif', 'Cormorant Garamond'],
  'Monospace': ['Courier'],
  'Display & Script': ['Cinzel', 'Dancing Script', 'Great Vibes', 'Pacifico', 'Lobster'],
};

const PREVIEW_TEXT = 'Certificate of Achievement';

interface Props {
  value: string;
  onChange: (font: string) => void;
  customFonts: CustomFont[];
  onAddCustomFont: (font: CustomFont) => void;
}

export function FontPickerDialog({ value, onChange, customFonts, onAddCustomFont }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [addMode, setAddMode] = useState<'none' | 'file' | 'google'>('none');
  const [googleUrl, setGoogleUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lowerSearch = search.toLowerCase();

  const matchesSearch = (family: string) =>
    !lowerSearch || family.toLowerCase().includes(lowerSearch);

  const handleSelect = useCallback((family: string) => {
    onChange(family);
    setOpen(false);
    setSearch('');
  }, [onChange]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setErrorMsg('');
    const result = await loadFontFromFile(file);
    setLoading(false);
    if (result.success) {
      onAddCustomFont({ family: result.family, source: 'upload' });
      onChange(result.family);
      setAddMode('none');
      setOpen(false);
    } else {
      setErrorMsg(result.error ?? 'Failed to load font file');
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onAddCustomFont, onChange]);

  const handleGoogleLoad = useCallback(async () => {
    if (!googleUrl.trim()) return;
    setLoading(true);
    setErrorMsg('');
    const result = await loadGoogleFont(googleUrl.trim());
    setLoading(false);
    if (result.success) {
      onAddCustomFont({ family: result.family, source: 'google' });
      onChange(result.family);
      setGoogleUrl('');
      setAddMode('none');
      setOpen(false);
    } else {
      setErrorMsg(result.error ?? 'Failed to load Google Font');
    }
  }, [googleUrl, onAddCustomFont, onChange]);

  const renderFontRow = (family: string) => {
    const isSelected = family === value;
    return (
      <button
        key={family}
        type="button"
        onClick={() => handleSelect(family)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors hover:bg-muted ${isSelected ? 'bg-primary/10 ring-1 ring-primary' : ''}`}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs text-muted-foreground font-sans truncate">{family}</span>
          <span
            className="text-base leading-tight truncate"
            style={{ fontFamily: `'${family}', serif` }}
          >
            {PREVIEW_TEXT}
          </span>
        </div>
        {isSelected && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
      </button>
    );
  };

  const renderCategory = (label: string, families: string[]) => {
    const visible = families.filter(matchesSearch);
    if (visible.length === 0) return null;
    return (
      <div key={label} className="space-y-1">
        <p className="px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2 pb-0.5">{label}</p>
        {visible.map(renderFontRow)}
      </div>
    );
  };

  const customVisible = customFonts.filter(f => matchesSearch(f.family));

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setSearch(''); setAddMode('none'); setErrorMsg(''); } }}>
      <DialogTrigger
        render={
          <Button variant="outline" className="w-full h-8 justify-between text-sm font-normal" />
        }
      >
        <span className="truncate min-w-0" style={{ fontFamily: `'${value}', serif` }}>{value}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50 ml-1" />
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-md max-h-[80vh] flex flex-col gap-3 p-4"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>Choose Font</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search fonts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
            autoFocus
          />
        </div>

        {/* Font list */}
        <div className="overflow-y-auto flex-1 space-y-0.5 px-0.5 -mx-0.5">
          {/* Built-in categorised */}
          {Object.entries(FONT_CATEGORIES).map(([label, families]) =>
            renderCategory(label, families)
          )}

          {/* Custom fonts */}
          {customVisible.length > 0 && (
            <div key="custom" className="space-y-1">
              <p className="px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2 pb-0.5">Custom Fonts</p>
              {customVisible.map(f => renderFontRow(f.family))}
            </div>
          )}
        </div>

        {/* Add custom font section */}
        <div className="border-t pt-3 space-y-2">
          {addMode === 'none' && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs gap-1.5"
                onClick={() => { setAddMode('file'); setErrorMsg(''); }}
              >
                <Upload className="h-3.5 w-3.5" /> Upload Font File
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs gap-1.5"
                onClick={() => { setAddMode('google'); setErrorMsg(''); }}
              >
                <Link className="h-3.5 w-3.5" /> Google Fonts URL
              </Button>
            </div>
          )}

          {addMode === 'file' && (
            <div className="space-y-2">
              <Label className="text-xs">Upload TTF / OTF / WOFF / WOFF2</Label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  disabled={loading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {loading ? 'Loading…' : 'Choose file…'}
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setAddMode('none'); setErrorMsg(''); }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {addMode === 'google' && (
            <div className="space-y-2">
              <Label className="text-xs">Google Fonts URL or family name</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://fonts.googleapis.com/css2?family=..."
                  value={googleUrl}
                  onChange={e => setGoogleUrl(e.target.value)}
                  className="h-8 text-xs flex-1"
                  onKeyDown={e => { if (e.key === 'Enter') handleGoogleLoad(); }}
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs shrink-0"
                  disabled={loading || !googleUrl.trim()}
                  onClick={handleGoogleLoad}
                >
                  {loading ? 'Loading…' : 'Load'}
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setAddMode('none'); setGoogleUrl(''); setErrorMsg(''); }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-destructive">{errorMsg}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
