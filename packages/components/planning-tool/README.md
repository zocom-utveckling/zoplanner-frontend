## Planning tool – current state and loose threads

### Current state
The planning tool is split into UI, hooks, services and utilities. The main draft, matching and publish flow is functional, but some areas are still fragile and should be treated as unfinished.

### Known issues / loose threads

#### Draft customer/class creation
Draft-related customer/class creation is sequential and not transactional. If a later step fails, temporary or partially created backend records may remain.

#### Calendar activity update
Calendar activity updates need stronger failure handling. Some update flows may fail silently if the backend request fails.

#### Half-finished refactor
Some action logic appears to exist both inline in the workspace and in `usePlannerActions`. This should be cleaned up later so there is one clear source of truth.

#### Draft persistence complexity
Planning drafts are stored in `localStorage` and transition into persisted assignments during publish. Draft cleanup and state synchronization have been partially stabilized, but the overall persistence flow is still somewhat complex and should be monitored during future refactors.

### Recently stabilized
- Added missing `notificationService` import for direct-message flow.
- Added cleanup of stale planning drafts after successful publish.
- Prevented false unsaved-change warnings after successful publish.

### Recommended next steps
1. Add stronger error handling and user feedback to calendar activity updates.
2. Review long-term draft persistence strategy and simplify localStorage synchronization where possible.
3. Later, finish or remove the `usePlannerActions` refactor to avoid duplicated action logic.
4. Consider moving transactional draft/customer/class orchestration to backend if possible.

----------------------------------------------------------------------------------

## Intended planning flow

The planning tool is designed as a combined scheduling and consultant-matching workflow.

### Current workflow
1. Create/select customer
2. Create order
3. Open planning tool with prefilled course/order information
4. Generate a suggested schedule
5. Adjust sessions manually through drag-and-drop or session editing
6. Match consultants against the generated schedule
7. Send availability/request activities to consultants
8. Track consultant responses directly in the planning calendar
9. Assign consultant to the course
10. Export planning as PDF

### Current implemented behavior
- Customer and order creation works.
- Planning tool pre-fills course/class/hour/date information from the order flow.
- Session generation and drag/drop editing work.
- Consultant request activities can be sent and appear in consultant calendars.
- Consultant responses update the planning overview state.
- Consultant assignment works.
- PDF export works.

### Known unfinished areas
- Direct consultant messaging flow is not completed.
- Subject/competence filtering exists in UI only; backend support for consultant subject areas is missing.
- Several admin/planning entry paths still behave more like prototypes than finalized UX flows.
- Some edit/navigation flows remain partially connected.

## Scheduling flexibility – future work

The current scheduling logic is intentionally based on a simple recurring pattern: same weekday, same time, repeated weekly as far as possible.

This was chosen as the first implementation because most courses are expected to follow a relatively stable weekly structure. It gives the planning tool a clear base flow that can later be expanded.

Current flexibility:
- Sessions can be moved with drag and drop.
- Session day/time can be edited manually.
- The generated schedule can be adjusted after creation.

Known limitations:
- If a session is removed, the tool does not yet warn that the total planned hours no longer match the ordered course hours.
- The tool does not yet suggest how to compensate missing hours, for example by extending other sessions or adding new sessions.
- More complex recurrence patterns are not supported yet, such as alternating weekdays every other week.
- There is no validation/summary that compares ordered hours against currently planned session hours after manual edits.

Recommended next steps:
- Add a planned-hours summary that compares total ordered hours with total scheduled hours.
- Warn when scheduled hours are below or above the ordered amount.
- Add tools for compensating missing hours, such as extending sessions or adding extra sessions.
- Explore support for alternating or custom recurrence patterns, for example Tuesday one week and Thursday the next.