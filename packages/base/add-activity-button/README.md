# @zoplanner/activity-creation

Roten till **allt som har med att skapa eller redigera en aktivitet** i appen.

> Mappen heter fortfarande `packages/base/add-activity-button/` av historiska
> skäl, men npm-paketnamnet är `@zoplanner/activity-creation`.

> **Importera ALLTID från paketets rot (`@zoplanner/activity-creation`).**
> Importera aldrig från interna sökvägar.

---

## Vad finns här?

```
add-activity-button/
├── index.js              ← Publika exporter (det enda externa filer ska importera)
├── ui/                   ← <AddActivityButton /> – knappen i sidopanelen
├── modals/
│   ├── ActivityModal.jsx ← Skapa/redigera/visa aktivitet
│   └── ModalOverlay.jsx  ← Delad overlay-komponent (används även av kalender-modaler)
├── hooks/
│   └── useActivityForm.js ← Formulär-state-hook (create/edit/view)
└── utils/
    └── eventColors.js    ← Färgpaletten för aktiviteter (ACTIVITY_COLOR_OPTIONS m.m.)
```

> Sidopanelens månadsvy bor i [@zoplanner/month-calendar](../month-calendar/README.md)
> och importerar färgpaletten härifrån.

---

## Publika API:t (`index.js`)

```js
import {
  // Komponenter
  AddActivityButton,
  ActivityModal,
  ModalOverlay,

  // Hook
  useActivityForm,

  // Färgtema
  ACTIVITY_COLOR_OPTIONS,
  DEFAULT_ACTIVITY_COLOR,
  normalizeActivityColor,
  getActivityColorTokens,
  getDashboardEventColorVars,
  getAllSchedulesEventColorVars,
  getBookingWeekdayColorVars,
} from "@zoplanner/activity-creation";
```

---

## Hur paketet hänger ihop med övriga paket

- **`@zoplanner/calendar`** importerar härifrån (`ActivityModal`,
  `useActivityForm`, `ModalOverlay`, färger). Paketet är alltså _basen_ —
  kalendern bygger ovanpå.
- **`@zoplanner/month-calendar`** importerar färgpaletten härifrån.
- **`@zoplanner/sidebar`** monterar `<AddActivityButton />` (och
  `<MonthCalendar />` från månadsvy-paketet).
- **`@zoplanner/profile-page`** använder `useActivityForm` + `ActivityModal`.

`useActivityForm` har en kvarstående beroendepil tillbaka till
`@zoplanner/calendar` för datum-helpern `toLocalDateTime`. Det är medvetet
(en enkel funktion, ingen cykel uppstår eftersom kalendern inte importerar
hooken vidare in).

---

## Konventioner

- Komponenter `.jsx` i `PascalCase`, hooks `.js` med `useXxx`-prefix.
- BEM-klassnamn för CSS (`month-calendar-modal__header` osv).
- All UI-text och kommentarer på svenska.
- CSS för `<ActivityModal />` ligger fortfarande i
  `@zoplanner/calendar/ui/scheduler.css` och importeras av sidor som renderar
  modalen (Dashboard, AllSchedules, profile-page).
