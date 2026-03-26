import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getProjectList,
  loadProject,
  saveProject,
  deleteProject,
  getStoredCurrentProjectId,
  storeCurrentProjectId,
} from '@/lib/projectStorage';
import {
  serializeTemplate,
  deserializeTemplate,
  serializeCustomFont,
  deserializeCustomFont,
} from '@/lib/projectSerializer';
import type {
  CertificateField,
  CustomFont,
  DataRow,
  Project,
  ProjectMeta,
  StoredCustomFont,
  TemplateData,
} from '@/types';

export interface LoadableState {
  template: TemplateData | null;
  fields: CertificateField[];
  dataRows: DataRow[];
  customFonts: CustomFont[];
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createBlankProject(name: string): Project {
  return {
    id: generateId(),
    name,
    lastModified: Date.now(),
    template: null,
    fields: [],
    dataRows: [],
    storedFonts: [],
  };
}

async function hydrateProject(project: Project): Promise<LoadableState> {
  const template = project.template
    ? await deserializeTemplate(project.template)
    : null;
  const customFonts: CustomFont[] = [];
  for (const sf of project.storedFonts) {
    const font = await deserializeCustomFont(sf);
    if (font) customFonts.push(font);
  }
  return { template, fields: project.fields, dataRows: project.dataRows, customFonts };
}

export function useProjectManager(
  currentTemplate: TemplateData | null,
  currentFields: CertificateField[],
  currentDataRows: DataRow[],
  currentCustomFonts: CustomFont[],
  onLoad: (state: LoadableState) => void,
) {
  const [projectList, setProjectList] = useState<ProjectMeta[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState('Untitled Project');
  const [isInitialized, setIsInitialized] = useState(false);

  // Always hold the latest values without causing effect re-runs
  const latestRef = useRef({ currentTemplate, currentFields, currentDataRows, currentCustomFonts });
  latestRef.current = { currentTemplate, currentFields, currentDataRows, currentCustomFonts };

  const refreshList = useCallback(() => {
    const list = getProjectList();
    list.sort((a, b) => b.lastModified - a.lastModified);
    setProjectList(list);
  }, []);

  // ── Core save ───────────────────────────────────────────────────────────────

  const persistProject = useCallback((id: string, name: string) => {
    const { currentTemplate, currentFields, currentDataRows, currentCustomFonts } = latestRef.current;
    const storedFonts: StoredCustomFont[] = currentCustomFonts
      .map(f => serializeCustomFont(f.family, f.source))
      .filter((f): f is StoredCustomFont => f !== null);

    const project: Project = {
      id,
      name,
      lastModified: Date.now(),
      template: currentTemplate ? serializeTemplate(currentTemplate) : null,
      fields: currentFields,
      dataRows: currentDataRows,
      storedFonts,
    };

    saveProject(project);
    refreshList();
  }, [refreshList]);

  // ── Initialisation (runs once on mount) ────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const allProjects = getProjectList();
      allProjects.sort((a, b) => b.lastModified - a.lastModified);

      // Try the explicitly stored current project first, then fall back to most recent
      const storedId = getStoredCurrentProjectId();
      const targetId = storedId ?? allProjects[0]?.id ?? null;

      if (targetId) {
        const project = loadProject(targetId);
        if (project) {
          const state = await hydrateProject(project);
          storeCurrentProjectId(project.id);
          setCurrentProjectId(project.id);
          setCurrentProjectName(project.name);
          refreshList();
          onLoad(state);
          setIsInitialized(true);
          return;
        }
      }

      // No existing project – create the default one
      const defaultProject = createBlankProject('Untitled Project');
      saveProject(defaultProject);
      storeCurrentProjectId(defaultProject.id);
      setCurrentProjectId(defaultProject.id);
      setCurrentProjectName(defaultProject.name);
      refreshList();
      setIsInitialized(true);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-save (1 s debounce) ────────────────────────────────────────────────

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const projectIdRef = useRef(currentProjectId);
  projectIdRef.current = currentProjectId;
  const projectNameRef = useRef(currentProjectName);
  projectNameRef.current = currentProjectName;

  useEffect(() => {
    if (!isInitialized || !currentProjectId) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      if (projectIdRef.current && projectNameRef.current) {
        persistProject(projectIdRef.current, projectNameRef.current);
      }
    }, 1000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTemplate, currentFields, currentDataRows, currentCustomFonts, currentProjectName, isInitialized, currentProjectId]);

  // ── Public API ──────────────────────────────────────────────────────────────

  const renameCurrentProject = useCallback((newName: string) => {
    setCurrentProjectName(newName);
    // Persist immediately so a refresh reflects the new name right away
    if (currentProjectId) persistProject(currentProjectId, newName);
  }, [currentProjectId, persistProject]);

  const createNewProject = useCallback(async () => {
    // Save current work before switching
    if (currentProjectId) persistProject(currentProjectId, currentProjectName);

    const existingNames = getProjectList().map(p => p.name);
    let name = 'Untitled Project';
    if (existingNames.includes(name)) {
      let i = 1;
      while (existingNames.includes(`Untitled Project (${i})`)) i++;
      name = `Untitled Project (${i})`;
    }

    const project = createBlankProject(name);
    saveProject(project);
    storeCurrentProjectId(project.id);
    setCurrentProjectId(project.id);
    setCurrentProjectName(project.name);
    refreshList();
    onLoad({ template: null, fields: [], dataRows: [], customFonts: [] });
  }, [currentProjectId, currentProjectName, onLoad, persistProject, refreshList]);

  const switchToProject = useCallback(async (id: string) => {
    if (id === currentProjectId) return;
    // Save current work before switching
    if (currentProjectId) persistProject(currentProjectId, currentProjectName);

    const project = loadProject(id);
    if (!project) return;
    const state = await hydrateProject(project);
    storeCurrentProjectId(id);
    setCurrentProjectId(id);
    setCurrentProjectName(project.name);
    refreshList();
    onLoad(state);
  }, [currentProjectId, currentProjectName, onLoad, persistProject, refreshList]);

  const deleteProjectById = useCallback(async (id: string) => {
    if (id === currentProjectId) {
      // Switch away FIRST so auto-save never re-creates the deleted project
      const remaining = getProjectList().filter(p => p.id !== id);
      remaining.sort((a, b) => b.lastModified - a.lastModified);
      if (remaining.length > 0) {
        await switchToProject(remaining[0].id);
      } else {
        await createNewProject();
      }
    }
    deleteProject(id);
    refreshList();
  }, [currentProjectId, createNewProject, switchToProject, refreshList]);

  const duplicateProject = useCallback((id: string) => {
    const project = loadProject(id);
    if (!project) return;
    const copy: Project = {
      ...project,
      id: generateId(),
      name: `${project.name} (copy)`,
      lastModified: Date.now(),
    };
    saveProject(copy);
    refreshList();
  }, [refreshList]);

  return {
    projectList,
    currentProjectId,
    currentProjectName,
    isInitialized,
    renameCurrentProject,
    createNewProject,
    switchToProject,
    deleteProjectById,
    duplicateProject,
  };
}
