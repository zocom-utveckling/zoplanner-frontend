## Temporary assignment ↔ course name fallback

`devCourseAssignmentLink` is a temporary frontend fallback used because backend assignment responses do not always return a valid `course.name` relationship after create/update operations.

The utility stores a local mapping between:

```txt
assignmentId -> courseName

---------------------------------------------------------

### Dev onboarding flow (temporary)

This is a temporary development-only solution to simulate consultant onboarding.

`QuickDevRegisterEntry` (admin/dev)
  → selects manager and email
- Onboarding: `ConsultantOnboarding`
  → creates user and links consultant to manager
- Manager setup: `DevManagerRegister`
  → creates manager accounts during development

All actions are executed using the currently logged-in manager’s token.

#### Next step

This flow simulates a future invite-based onboarding system.

The intended solution is that the backend generates a secure, time-limited invite link (token-based), which the consultant uses to create their account.  
The token should contain or resolve the necessary context (e.g. manager relation) without requiring a logged-in manager session.

This dev flow will be replaced once such an invite system is implemented.