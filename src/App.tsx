import { useRef, useCallback } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { useProjectManager } from '@/hooks/useProjectManager';
import { TemplateUpload } from '@/components/TemplateUpload';
import { CanvasEditor } from '@/components/CanvasEditor';
import { FieldList } from '@/components/FieldList';
import { FieldProperties } from '@/components/FieldProperties';
import { DataEntry } from '@/components/DataEntry';
import { ExportPanel } from '@/components/ExportPanel';
import { ProjectManager } from '@/components/ProjectManager';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Award, ImageIcon, Loader2 } from 'lucide-react';
import { renderPdfPageToImage } from '@/lib/pdfPreview';
import type { TemplateData } from '@/types';

function App() {
  const {
    template,
    setTemplate,
    fields,
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
  } = useAppState();

  const {
    projectList,
    currentProjectId,
    currentProjectName,
    isInitialized,
    renameCurrentProject,
    createNewProject,
    switchToProject,
    deleteProjectById,
    duplicateProject,
  } = useProjectManager(template, fields, dataRows, customFonts, loadState);

  // ── Change template (preserves fields + data) ─────────────────────────────
  const changeTemplateInputRef = useRef<HTMLInputElement>(null);

  const handleChangeTemplateFile = useCallback(async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let newTemplate: TemplateData;

    if (file.type === 'application/pdf') {
      const { url, width, height } = await renderPdfPageToImage(bytes);
      newTemplate = { type: 'pdf', originalBytes: bytes, previewUrl: url, width, height };
    } else {
      const url = URL.createObjectURL(file);
      const img = document.createElement('img');
      await new Promise<void>(resolve => { img.onload = () => resolve(); img.src = url; });
      newTemplate = { type: 'image', originalBytes: bytes, previewUrl: url, width: img.naturalWidth, height: img.naturalHeight };
    }
    setTemplate(newTemplate);
  }, [setTemplate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Award className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold tracking-tight">Certificate Generator</h1>
          </div>
          <ProjectManager
            projectList={projectList}
            currentProjectId={currentProjectId}
            currentProjectName={currentProjectName}
            onRename={renameCurrentProject}
            onNew={createNewProject}
            onSwitch={switchToProject}
            onDelete={deleteProjectById}
            onDuplicate={duplicateProject}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {!isInitialized ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Loading project…</p>
            </div>
          </div>
        ) : !template ? (
          <div className="max-w-2xl mx-auto">
            <TemplateUpload onTemplateLoaded={setTemplate} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Left: Canvas + Data */}
            <div className="space-y-6">
              {/* Canvas toolbar */}
              <div className="flex items-center justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => changeTemplateInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4" />
                  Change Template
                </Button>
                <input
                  ref={changeTemplateInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleChangeTemplateFile(file);
                    e.target.value = '';
                  }}
                />
              </div>

              <CanvasEditor
                template={template}
                fields={fields}
                selectedFieldId={selectedFieldId}
                onFieldSelect={setSelectedFieldId}
                onFieldMove={(id, x, y) => updateField(id, { x, y })}
                onAddField={addField}
                dataRows={dataRows}
                previewIndex={previewIndex}
              />

              <div className="border rounded-lg p-4">
                <DataEntry
                  fields={fields}
                  dataRows={dataRows}
                  onDataChange={setDataRows}
                />
              </div>
            </div>

            {/* Right: Sidebar */}
            <aside className="space-y-4">
              <FieldList
                fields={fields}
                selectedFieldId={selectedFieldId}
                onSelect={setSelectedFieldId}
                onAdd={() => addField(template.width / 2, template.height / 2)}
              />
              <Separator />
              {selectedField ? (
                <FieldProperties
                  key={selectedFieldId}
                  field={selectedField}
                  onUpdate={updateField}
                  onRemove={removeField}
                  autoFocusName={selectedField.id === editingNameId}
                  onNameFocused={clearEditingName}
                  customFonts={customFonts}
                  onAddCustomFont={addCustomFont}
                />
              ) : (
                <p className="text-xs text-muted-foreground p-4 border border-dashed rounded-lg text-center">
                  Select a field to edit its properties.
                </p>
              )}
              <Separator />
              <ExportPanel
                template={template}
                fields={fields}
                dataRows={dataRows}
                previewIndex={previewIndex}
                onPreviewIndexChange={setPreviewIndex}
              />
            </aside>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          Created by{' '}
          <a
            href="https://jeremie.bornais.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            Jeremie Bornais
          </a>
          {' · '}
          <a
            href="https://github.com/jere-mie/certificate-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            Source Code
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;

