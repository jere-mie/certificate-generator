import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect, Line } from 'react-konva';
import type Konva from 'konva';
import type { CertificateField, TemplateData, DataRow } from '@/types';

// Width allocated for each text field in template coordinate space.
// Large enough to avoid clipping long text; alignment anchors to field.x.
const FIELD_WIDTH_PTS = 1000;

function getDisplayX(field: CertificateField): number {
  switch (field.textAlign) {
    case 'center': return field.x - FIELD_WIDTH_PTS / 2;
    case 'right':  return field.x - FIELD_WIDTH_PTS;
    default:       return field.x; // left
  }
}

interface Props {
  template: TemplateData;
  fields: CertificateField[];
  selectedFieldId: string | null;
  onFieldSelect: (id: string | null) => void;
  onFieldMove: (id: string, x: number, y: number) => void;
  onAddField: (x: number, y: number) => void;
  dataRows: DataRow[];
  previewIndex: number;
}

export function CanvasEditor({
  template,
  fields,
  selectedFieldId,
  onFieldSelect,
  onFieldMove,
  onAddField,
  dataRows,
  previewIndex,
}: Props) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const img = new window.Image();
    img.src = template.previewUrl;
    img.onload = () => setImage(img);
  }, [template.previewUrl]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const scale = containerWidth / template.width;
      setStageSize({
        width: containerWidth,
        height: template.height * scale,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [template.width, template.height]);

  const scale = stageSize.width / template.width;

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage() || e.target.name() === 'template-bg') {
      onFieldSelect(null);
    }
  }, [onFieldSelect]);

  const handleStageDblClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    if (e.target !== stage && e.target.name() !== 'template-bg') return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    onAddField(pointer.x / scale, pointer.y / scale);
  }, [onAddField, scale]);

  const currentRow = dataRows[previewIndex];

  return (
    <div ref={containerRef} className="w-full border rounded-lg overflow-hidden bg-muted/30">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onClick={handleStageClick}
        onDblClick={handleStageDblClick}
      >
        <Layer>
          {image && (
            <KonvaImage
              image={image}
              width={stageSize.width}
              height={stageSize.height}
              name="template-bg"
            />
          )}

          {fields.map((field) => {
            const text = currentRow?.[field.name] ?? field.name;
            const isSelected = field.id === selectedFieldId;
            const displayX = getDisplayX(field);
            const lineHeight = field.fontSize * 1.25;

            return [
              // Selection outline – a dashed rect around the rendered text area
              isSelected && (
                <Rect
                  key={`sel-rect-${field.id}`}
                  x={displayX * scale}
                  y={field.y * scale}
                  width={FIELD_WIDTH_PTS * scale}
                  height={lineHeight * scale}
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  dash={[5, 4]}
                  fill="rgba(59,130,246,0.05)"
                  listening={false}
                />
              ),
              // Anchor guide line – shows exactly where field.x is
              isSelected && (
                <Line
                  key={`sel-line-${field.id}`}
                  points={[
                    field.x * scale, (field.y - 10) * scale,
                    field.x * scale, (field.y + lineHeight + 10) * scale,
                  ]}
                  stroke="#3b82f6"
                  strokeWidth={1}
                  dash={[3, 3]}
                  opacity={0.7}
                  listening={false}
                />
              ),
              // The text itself (width + align makes alignment actually work)
              <Text
                key={field.id}
                x={displayX * scale}
                y={field.y * scale}
                width={FIELD_WIDTH_PTS * scale}
                text={text}
                fontSize={field.fontSize * scale}
                fontFamily={field.fontFamily}
                fontStyle={field.fontWeight}
                fill={field.fontColor}
                align={field.textAlign}
                draggable
                onClick={(e) => {
                  e.cancelBubble = true;
                  onFieldSelect(field.id);
                }}
                onDragEnd={(e) => {
                  // Convert dragged displayX back to the alignment anchor
                  const newDisplayX = e.target.x() / scale;
                  let newAnchorX = newDisplayX;
                  if (field.textAlign === 'center') newAnchorX += FIELD_WIDTH_PTS / 2;
                  else if (field.textAlign === 'right') newAnchorX += FIELD_WIDTH_PTS;
                  onFieldMove(field.id, newAnchorX, e.target.y() / scale);
                }}
              />,
            ];
          })}
        </Layer>
      </Stage>
    </div>
  );
}
