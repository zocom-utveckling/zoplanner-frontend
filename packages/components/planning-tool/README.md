## Planning tool – current state and loose threads

### Current state
The planning tool is split into UI, hooks, services and utilities. The main draft, matching and publish flow is partly functional, but some areas are still fragile and should be treated as unfinished.

### Known issues / loose threads

#### Direct message flow
The workspace calls `notificationService.sendDirectMessage`, but the service/import path needs to be verified. If the service is not imported correctly, the message action can fail at runtime.

#### Draft cleanup after publish
Planning drafts are stored in `localStorage` and updated through id-based upsert logic. During publish, the draft id may be replaced with the created assignment id. The old draft id is not fully cleaned up, which can leave stale or duplicated drafts in storage.

#### Unsaved changes warning
The `beforeunload` warning is currently based mainly on whether `courseDraft` exists. If a draft remains after successful publish, users may still get an unsaved changes warning even when data has been saved.

#### Draft customer/class creation
Draft-related customer/class creation is sequential and not transactional. If a later step fails, temporary or partially created backend records may remain.

#### Calendar activity update
Calendar activity updates need stronger failure handling. Some update flows may fail silently if the backend request fails.

#### Half-finished refactor
Some action logic appears to exist both inline in the workspace and in `usePlannerActions`. This should be cleaned up later so there is one clear source of truth.

### Recommended next steps
1. Fix verified runtime errors first, especially missing service imports.
2. Review draft cleanup after publish and decide when drafts should be removed or transformed into saved assignments.
3. Adjust unsaved-change logic so saved/published drafts do not trigger warnings.
4. Add error handling to calendar activity updates.
5. Later, finish or remove the `usePlannerActions` refactor to avoid duplicated action logic.