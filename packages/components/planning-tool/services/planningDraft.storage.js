const STORAGE_KEY = "planningDrafts";

export function loadPlanningDrafts() {
    const raw = localStorage.getItem(STORAGE_KEY);

    if(!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function savePlanningDrafts(drafts) {
    if(!Array.isArray(drafts)) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function upsertPlanningDraft(draft) {
    const drafts = loadPlanningDrafts();

    const updatedDrafts = drafts.some((item) => item.id === draft.id)
    ? drafts.map((item) => (item.id === draft.id ? draft : item))
    : [...drafts, draft];

    savePlanningDrafts(updatedDrafts);
}

export function removePlanningDraft(id) {
    const drafts = loadPlanningDrafts();
    const updatedDrafts = drafts.filter((draft) => draft.id !== id);

    savePlanningDrafts(updatedDrafts);
}

export function clearPlanningDrafts() {
    localStorage.removeItem(STORAGE_KEY);
}