import { useAppState } from '@/hooks/useAppState';
import { TemplateUpload } from '@/components/TemplateUpload';
import { CanvasEditor } from '@/components/CanvasEditor';
import { FieldList } from '@/components/FieldList';
import { FieldProperties } from '@/components/FieldProperties';
import { DataEntry } from '@/components/DataEntry';
import { ExportPanel } from '@/components/ExportPanel';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award } from 'lucide-react';

function App() {
  const {
    template,
    setTemplate,
    fields,
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
  } = useAppState();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold tracking-tight">Certificate Generator</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {!template ? (
          <div className="max-w-2xl mx-auto">
            <TemplateUpload onTemplateLoaded={setTemplate} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Left: Canvas + Data */}
            <div className="space-y-6">
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

              <Tabs defaultValue="data" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="data">Data</TabsTrigger>
                  <TabsTrigger value="export">Export</TabsTrigger>
                </TabsList>
                <TabsContent value="data" className="border rounded-lg p-4 mt-2">
                  <DataEntry
                    fields={fields}
                    dataRows={dataRows}
                    onDataChange={setDataRows}
                  />
                </TabsContent>
                <TabsContent value="export" className="border rounded-lg p-4 mt-2">
                  <ExportPanel
                    template={template}
                    fields={fields}
                    dataRows={dataRows}
                    previewIndex={previewIndex}
                    onPreviewIndexChange={setPreviewIndex}
                  />
                </TabsContent>
              </Tabs>
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
                  field={selectedField}
                  onUpdate={updateField}
                  onRemove={removeField}
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
