## Admin – current state and loose threads

### Current state
Admin is structurally in good shape: UI, hooks and services are separated, and no build-breaking issues were found.

### Loose threads

#### createPlanningOrder
Creates data sequentially: class -> course -> assignment. If the final assignment step fails, class/course may already have been created. This should ideally be handled transactionally in backend.

#### managerId dependency
`managerId` is required when creating assignments. If the current actor is not loaded or managerId is missing, the create flow can fail. Add/keep early validation before starting the create chain.

#### CustomerDetailsModal orders
The modal currently appears to show orders from local frontend state, not a fully hydrated backend history. After refresh, existing orders may not appear unless backend loading is added.

#### devCourseAssignmentLink
Temporary localStorage fallback that maps `assignmentId -> courseName` because backend does not always return correct `assignment.course.name`.

#### Internal admin import
Some admin code imports through `@zoplanner/admin` from inside the same package. This works, but is a bit fragile and should later be changed to direct relative imports.

#### ConsultantInviteModal
Email input may persist between modal openings. Low-priority UX issue.

### Recommended next steps
1. Add/verify early validation for `managerId`.
2. Decide whether order history should be loaded from backend.
3. Move createPlanningOrder orchestration/rollback responsibility to backend if possible.
4. Remove `devCourseAssignmentLink` once backend returns stable course data.
5. Clean up internal package-root imports later.