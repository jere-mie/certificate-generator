import type { Project, ProjectMeta } from '@/types';

const PROJECT_LIST_KEY = 'cert-gen:project-list';
const CURRENT_PROJECT_ID_KEY = 'cert-gen:current-project-id';
const projectDataKey = (id: string) => `cert-gen:project:${id}`;

export function getProjectList(): ProjectMeta[] {
  try {
    return JSON.parse(localStorage.getItem(PROJECT_LIST_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function setProjectList(list: ProjectMeta[]) {
  localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(list));
}

export function loadProject(id: string): Project | null {
  try {
    const raw = localStorage.getItem(projectDataKey(id));
    return raw ? (JSON.parse(raw) as Project) : null;
  } catch {
    return null;
  }
}

/** Returns false if the save failed (e.g. storage quota exceeded). */
export function saveProject(project: Project): boolean {
  try {
    const meta: ProjectMeta = {
      id: project.id,
      name: project.name,
      lastModified: project.lastModified,
    };
    const list = getProjectList();
    const idx = list.findIndex(p => p.id === project.id);
    if (idx >= 0) list[idx] = meta;
    else list.unshift(meta);
    setProjectList(list);
    localStorage.setItem(projectDataKey(project.id), JSON.stringify(project));
    return true;
  } catch {
    return false;
  }
}

export function deleteProject(id: string) {
  setProjectList(getProjectList().filter(p => p.id !== id));
  localStorage.removeItem(projectDataKey(id));
}

export function getStoredCurrentProjectId(): string | null {
  return localStorage.getItem(CURRENT_PROJECT_ID_KEY);
}

export function storeCurrentProjectId(id: string) {
  localStorage.setItem(CURRENT_PROJECT_ID_KEY, id);
}
