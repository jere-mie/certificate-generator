import { useState, useRef, useCallback, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  Pencil,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { ProjectMeta } from '@/types';

interface Props {
  projectList: ProjectMeta[];
  currentProjectId: string | null;
  currentProjectName: string;
  onRename: (name: string) => void;
  onNew: () => void;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ProjectManager({
  projectList,
  currentProjectId,
  currentProjectName,
  onRename,
  onNew,
  onSwitch,
  onDelete,
  onDuplicate,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(currentProjectName);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const pendingFocusRef = useRef(false);

  const confirmDeleteProject = projectList.find(p => p.id === confirmDeleteId) ?? null;

  useEffect(() => {
    setNameInput(currentProjectName);
    if (pendingFocusRef.current) {
      pendingFocusRef.current = false;
      setIsEditing(true);
      setTimeout(() => nameInputRef.current?.select(), 0);
    } else {
      setIsEditing(false);
    }
  }, [currentProjectName]);

  const commitRename = useCallback(() => {
    const trimmed = nameInput.trim() || 'Untitled Project';
    setNameInput(trimmed);
    onRename(trimmed);
    setIsEditing(false);
  }, [nameInput, onRename]);

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') commitRename();
      if (e.key === 'Escape') {
        setNameInput(currentProjectName);
        setIsEditing(false);
      }
    },
    [commitRename, currentProjectName],
  );

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  }, []);

  const handleNewProject = useCallback(() => {
    pendingFocusRef.current = true;
    onNew();
    setDialogOpen(false);
  }, [onNew]);

  const handleConfirmedDelete = useCallback(() => {
    if (!confirmDeleteId) return;
    const wasActive = confirmDeleteId === currentProjectId;
    onDelete(confirmDeleteId);
    setConfirmDeleteId(null);
    if (wasActive) setDialogOpen(false);
  }, [confirmDeleteId, currentProjectId, onDelete]);

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex items-center gap-1 min-w-0">
        {isEditing ? (
          <Input
            ref={nameInputRef}
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleNameKeyDown}
            className="h-7 w-44 text-sm font-semibold px-2"
            autoFocus
          />
        ) : (
          <button
            onClick={startEditing}
            title="Click to rename project"
            className="flex items-center gap-1 text-sm font-semibold truncate max-w-[10rem] hover:text-primary transition-colors group"
          >
            <span className="truncate">{currentProjectName}</span>
            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 shrink-0" />
          </button>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 shrink-0"
        onClick={() => setDialogOpen(true)}
      >
        <FolderOpen className="h-4 w-4" />
        Projects
        <ChevronDown className="h-3 w-3" />
      </Button>

      {/* Projects list dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Projects</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Button size="sm" className="w-full gap-2" onClick={handleNewProject}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>

            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {projectList.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No saved projects.
                </p>
              )}
              {projectList.map(project => (
                <div
                  key={project.id}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    project.id === currentProjectId
                      ? 'border-primary/50 bg-primary/5'
                      : 'hover:bg-muted/50 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (project.id !== currentProjectId) {
                      onSwitch(project.id);
                      setDialogOpen(false);
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(project.lastModified)}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={e => e.stopPropagation()}
                  >
                    {project.id === currentProjectId && (
                      <span className="text-xs text-primary font-medium px-1">Active</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      title="Duplicate"
                      onClick={() => onDuplicate(project.id)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={() => setConfirmDeleteId(project.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDeleteId !== null}
        onOpenChange={open => { if (!open) setConfirmDeleteId(null); }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Project
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">
              {confirmDeleteProject?.name}
            </span>
            ? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmedDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}