# @zoplanner/profile-page

Profil-sidan för en användare (`/profile/:id`). Visar profilkort, kompetenser,
"Om mig", aktiviteter och bokade uppdrag.

> Sidan importeras via `@zoplanner/profile-page` och monteras i app-routes.

---

## Vad finns här?

```
profile-page/
├── index.js              ← Re-export av ui/
├── ui/
│   ├── index.jsx         ← Profile_Page (huvudkomponenten)
│   └── index.css
├── hooks/
│   ├── useProfileData.js          ← Laddar activities + assignments från API
│   ├── useProfileEdit.js          ← Redigeringsläge + spara kompetenser
│   └── useProfileActivityModal.js ← Wrapper runt useActivityForm från kalendern
├── utils/
│   └── profile.utils.js  ← Datum-/tidsformat, kompetens-hjälpare, localStorage-fallback
└── edit-profile/
    └── ui/index.(jsx|css)  ← Egen modal för att redigera namn/email/stad/roll/lösenord
```

---

## Hur datan flödar

```
Profile_Page
   │
   ├── useUserById(id, initialUser)        → user (från @zoplanner/app-hooks)
   ├── useProfilePicture(userId, url)      → bild-uppladdning
   ├── useProfileData(user)                → activities[], assignments[]
   ├── useProfileEdit(user, …)             → kompetens-redigering
   └── useProfileActivityModal(setActivities)
            │
            └── useActivityForm (från @zoplanner/activity-creation)
                  → ActivityModal renderas när manager redigerar en aktivitet
```

Bokningar (assignments) hanteras lokalt i `Profile_Page` via
`assignmentService` + `BookingEditModal` / `EventDetailsModal` från
`@zoplanner/calendar`. `ActivityModal` importeras från
`@zoplanner/activity-creation`.

---

## Kompetenser sparas både i backend OCH localStorage (workaround)

> **Detta är en workaround, inte en långsiktig lösning.**

Backend-fältet `competencies` är inte pålitligt idag:

- Det kan saknas på user-objektet beroende på vilken endpoint som hämtade datan.
- Andra flöden i appen anropar `userService.update(...)` med en payload där
  `competencies` inte är med, vilket riskerar att skriva över fältet.

För att kompetensvalen inte ska försvinna mellan reloads sparar
`profile.utils.js` därför en kopia i `localStorage` under nyckeln
`zoplanner.profileCompetencies.{userId}` och **prioriterar localStorage** vid
nästa rendering (se `normalizeSkills` och `saveStoredCompetencies`).

**Konsekvenser att känna till:**

- Per webbläsare/enhet — byter användaren dator ser de bara det som faktiskt
  finns i backend.
- I privat läge / vid full quota misslyckas skrivningen tyst.

**TODO (ta bort workarounden):** se till att backend alltid returnerar och
behåller `competencies` på user-objektet, och att alla `userService.update`-
anrop skickar med fältet. Då kan `getStoredCompetencies` /
`saveStoredCompetencies` plockas bort och `normalizeSkills` förenklas till
att enbart läsa från `user`.

---

## Var hör en ny ändring hemma?

| Du vill ändra…                                      | Filen du letar efter                      |
| --------------------------------------------------- | ----------------------------------------- |
| Layout/utseende på profil-sidan                     | `ui/index.jsx` + `ui/index.css`           |
| Hur user/aktiviteter/uppdrag laddas                 | `hooks/useProfileData.js`                 |
| Kompetens-redigering (välj/spara)                   | `hooks/useProfileEdit.js`                 |
| Aktivitetsmodalen (öppna/spara/ta bort)             | `hooks/useProfileActivityModal.js`        |
| Listan av valbara kompetenser (`COMPETENCY_GROUPS`) | `ui/index.jsx`                            |
| Datum-/tidsformat i listan                          | `utils/profile.utils.js`                  |
| Redigera namn/email/stad/roll                       | `edit-profile/ui/index.jsx`               |
| Bokningsmodalen (Edit/Details)                      | Tillhör `@zoplanner/calendar` — ändra där |

---

## Konventioner

- Komponenter `.jsx` i `PascalCase`, hooks `.js` med `useXxx`-prefix.
- All UI-text och kommentarer på svenska.
- Importera kalender-grejer från `@zoplanner/calendar`-paketroten och
  aktivitets-skapande från `@zoplanner/activity-creation` (aldrig
  djupa interna sökvägar).
- Profile_Page exporteras som `default` från `ui/index.jsx` och re-exporteras
  via `index.js`.
