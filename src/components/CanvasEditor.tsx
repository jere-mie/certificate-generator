import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect, Line, Group } from 'react-konva';
import type Konva from 'konva';
import type { CertificateField, TemplateData, DataRow } from '@/types';

// Width allocated for each text field in template coordinate space.
// Large enough to avoid clipping long text; alignment anchors to field.x.
const FIELD_WIDTH_PTS = 1000;
// Distance in screen pixels within which a field snaps to an alignment guide.
const SNAP_THRESHOLD_PX = 8;

interface SnapLine { type: 'v' | 'h'; pos: number; }

function getDisplayX(field: CertificateField): number {
  switch (field.textAlign) {
    case 'center': return field.x - FIELD_WIDTH_PTS / 2;
    case 'right':  return field.x - FIELD_WIDTH_PTS;
    default:       return field.x; // left
  }
}

function getAlignmentOffset(align: CertificateField['textAlign']): number {
  if (align === 'center') return FIELD_WIDTH_PTS / 2;
  if (align === 'right') return FIELD_WIDTH_PTS;
  return 0;
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
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);

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

  const handleGroupDragMove = useCallback((
    e: Konva.KonvaEventObject<DragEvent>,
    field: CertificateField,
  ) => {
    const node = e.target;
    const alignOffset = getAlignmentOffset(field.textAlign);
    const anchorX = node.x() / scale + alignOffset;
    const anchorY = node.y() / scale;

    // Snap targets: canvas centre + all other fields' anchor positions
    const snapTargetsX: number[] = [
      template.width / 2,
      ...fields.filter(f => f.id !== field.id).map(f => f.x),
    ];
    const snapTargetsY: number[] = [
      template.height / 2,
      ...fields.filter(f => f.id !== field.id).map(f => f.y),
    ];

    const newSnapLines: SnapLine[] = [];
    let snappedDisplayX = node.x() / scale;
    let snappedY = anchorY;

    for (const tx of snapTargetsX) {
      if (Math.abs((anchorX - tx) * scale) < SNAP_THRESHOLD_PX) {
        snappedDisplayX = tx - alignOffset;
        newSnapLines.push({ type: 'v', pos: tx * scale });
        break;
      }
    }
    for (const ty of snapTargetsY) {
      if (Math.abs((anchorY - ty) * scale) < SNAP_THRESHOLD_PX) {
        snappedY = ty;
        newSnapLines.push({ type: 'h', pos: ty * scale });
        break;
      }
    }

    node.x(snappedDisplayX * scale);
    node.y(snappedY * scale);
    setSnapLines(newSnapLines);
  }, [fields, scale, template.width, template.height]);

  // Arrow-key nudging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedFieldId) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      const step = e.shiftKey ? 10 : 1;
      let dx = 0, dy = 0;
      switch (e.key) {
        case 'ArrowLeft':  dx = -step; break;
        case 'ArrowRight': dx =  step; break;
        case 'ArrowUp':    dy = -step; break;
        case 'ArrowDown':  dy =  step; break;
        default: return;
      }
      e.preventDefault();
      const field = fields.find(f => f.id === selectedFieldId);
      if (!field) return;
      onFieldMove(selectedFieldId, field.x + dx, field.y + dy);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFieldId, fields, onFieldMove]);

  const handleGroupDragEnd = useCallback((
    e: Konva.KonvaEventObject<DragEvent>,
    field: CertificateField,
  ) => {
    setSnapLines([]);
    const alignOffset = getAlignmentOffset(field.textAlign);
    onFieldMove(field.id, e.target.x() / scale + alignOffset, e.target.y() / scale);
  }, [scale, onFieldMove]);

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
            // X position of the anchor line relative to the group's origin
            const anchorOffsetX = (field.x - displayX) * scale;

            return (
              <Group
                key={field.id}
                x={displayX * scale}
                y={field.y * scale}
                draggable
                onClick={(e) => {
                  e.cancelBubble = true;
                  onFieldSelect(field.id);
                }}
                onDragStart={() => {
                  if (field.id !== selectedFieldId) onFieldSelect(field.id);
                }}
                onDragMove={(e) => handleGroupDragMove(e, field)}
                onDragEnd={(e) => handleGroupDragEnd(e, field)}
              >
                {isSelected && (
                  <Rect
                    x={0}
                    y={0}
                    width={FIELD_WIDTH_PTS * scale}
                    height={lineHeight * scale}
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    dash={[5, 4]}
                    fill="rgba(59,130,246,0.05)"
                    listening={false}
                  />
                )}
                {isSelected && (
                  <Line
                    points={[
                      anchorOffsetX, -10 * scale,
                      anchorOffsetX, (lineHeight + 10) * scale,
                    ]}
                    stroke="#3b82f6"
                    strokeWidth={1}
                    dash={[3, 3]}
                    opacity={0.7}
                    listening={false}
                  />
                )}
                <Text
                  x={0}
                  y={0}
                  width={FIELD_WIDTH_PTS * scale}
                  height={lineHeight * scale}
                  text={text}
                  fontSize={field.fontSize * scale}
                  fontFamily={`'${field.fontFamily}'`}
                  fontStyle={field.fontWeight}
                  fill={field.fontColor}
                  align={field.textAlign}
                  verticalAlign="middle"
                  listening={true}
                />
              </Group>
            );
          })}
          {snapLines.map((line, i) => (
            <Line
              key={`snap-${i}`}
              points={
                line.type === 'v'
                  ? [line.pos, 0, line.pos, stageSize.height]
                  : [0, line.pos, stageSize.width, line.pos]
              }
              stroke="#22c55e"
              strokeWidth={1}
              dash={[6, 3]}
              opacity={0.8}
              listening={false}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
