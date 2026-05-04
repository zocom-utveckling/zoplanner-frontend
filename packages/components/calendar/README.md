# @zoplanner/calendar

Detta paket innehåller **alla kalender-vyer och tillhörande logik** i frontend.
Det är skrivet i React och använder `date-fns` för datumhantering.

> **Importera ALLTID från paketets rot (`@zoplanner/calendar`).**
> Importera aldrig från interna sökvägar som `@zoplanner/calendar/core/...` —
> de räknas som privat implementation och kan ändras när som helst.

---

## Vad finns här?

```
calendar/
├── index.js              ← Publika exporter (det enda externa filer ska importera)
├── package.json
└── ui/                   ← All logik och CSS
    ├── scheduler.css     ← Global scheduler-styling (delas av båda vyerna + profile-page)
    ├── dashboard/        ← Schemavy för en användare (Dashboard-sidan)
    │   ├── DashboardScheduler.{jsx,css}
    │   ├── topbar/       ← DashboardTopbar + QuickMessageModal
    │   └── views/        ← MonthView, TimeGridView, EventBlock, DashboardCalendarContent
    ├── all-schedules/    ← Schemavy för flera konsulter (Hem-sidan, admin)
    │   ├── AllSchedulesScheduler.{jsx,css}
    │   ├── topbar/       ← AllSchedulesTopbar
    │   └── views/        ← AllSchedulesView, AllSchedulesCalendarContent
    └── core/             ← Delade byggstenar för båda vyerna
        ├── data/         ← Datahämtning & normalisering från API
        ├── hooks/        ← React-hooks (state, navigation, filter, CRUD)
        ├── modals/       ← Modaler (EventDetailsModal, BookingEditModal)
        └── utils/        ← Rena hjälpfunktioner (datum, färg, meta-parsning)
```

### Två vyer – två toppnivåkomponenter

| Komponent                   | Var används den?                      | Syfte                                                                           |
| --------------------------- | ------------------------------------- | ------------------------------------------------------------------------------- |
| `<DashboardScheduler />`    | `pages/dashboard`                     | En användares kalender. Hanterar dessutom korskalender (manager ↔ medarbetare). |
| `<AllSchedulesScheduler />` | `pages/home-page`, `components/admin` | Flera konsulter samtidigt med filter (stad, kompetens, period, …).              |

Båda komponenterna delar internt på samma hooks och modaler från `core/`.

---

## Publika API:t (`index.js`)

```js
import {
  // Schemavyer
  DashboardScheduler,
  AllSchedulesScheduler,

  // Modaler (för t.ex. profil-sidan)
  EventDetailsModal,
  BookingEditModal,

  // Datumhjälp
  toLocalDateTime,
} from "@zoplanner/calendar";
```

> Allt som rör att **skapa/redigera en aktivitet** (ActivityModal,
> `useActivityForm`, `MonthCalendar`, `AddActivityButton`, färgpaletten,
> `ModalOverlay`) bor i [@zoplanner/activity-creation](../../base/add-activity-button/README.md).

---

## Hur datan flödar

```
┌─────────────────────────────┐
│ <DashboardScheduler /> /    │   useSchedulerEvents → fetchSchedulerEvents
│ <AllSchedulesScheduler />   │   useSchedulerFilters → filtrerar + sorterar
└────────────┬────────────────┘   useSchedulerNavigation → datum + vyläge
             │                    useActivityForm → formulärstate
             ▼                    useEventDetailsModal → "vald event"-state
   ┌────────────────────┐
   │ DashboardCalendar- │   ← MonthView / TimeGridView ritar gridet
   │ Content (eller     │
   │ AllSchedulesCal-   │
   │ endarContent)      │
   └────────────────────┘
             │
             ▼
   ┌────────────────────────────────────────────┐
   │ ActivityModal / EventDetailsModal /         │
   │ BookingEditModal (öppnas vid klick)         │
   └────────────────────────────────────────────┘
```

### Live-uppdatering mellan kalendrar

När en aktivitet skapas/uppdateras/raderas dispatchas
`zoplanner:activities:updated` på `window`. Andra `useSchedulerEvents`-instanser
i appen lyssnar och laddar om sin data. All sådan eventing går genom
[`core/utils/activityEvents.js`](./ui/core/utils/activityEvents.js) — använd
`emitActivitiesUpdated(userId)` därifrån, **skriv aldrig egna `dispatchEvent`-anrop**.

---

## Var hör en ny ändring hemma?

> Sökvägarna nedan är relativa till `ui/`.

| Du vill ändra…                            | Filen du letar efter                                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Hur ett aktivitets-event ser ut visuellt  | `dashboard/views/EventBlock.jsx`                                                               |
| Hur dagar/timmar ritas ut                 | `dashboard/views/MonthView.jsx`, `dashboard/views/TimeGridView.jsx`                            |
| Filtreringen i Hem-vyn                    | `core/hooks/useSchedulerFilters.js`                                                            |
| API-anropen som hämtar events             | `core/data/schedulerData.js`                                                                   |
| Tolkning av API-fält (namnsynonymer m.m.) | `core/data/fieldNormalizers.js`                                                                |
| Korskalender-synk (manager ↔ medarbetare) | `core/hooks/useCrossCalendarSync.js`                                                           |
| Modal-overlay (gemensam för alla modaler) | Bor i `@zoplanner/activity-creation` (`modals/ModalOverlay.jsx`)                               |
| Datum-/tidsformatering                    | `core/utils/dateTimeUtils.js`                                                                  |
| Att skapa/uppdatera/radera en aktivitet   | `core/hooks/useSchedulerEvents.js`                                                             |
| Aktivitetsformuläret (steg, validering)   | Bor i `@zoplanner/activity-creation` (`hooks/useActivityForm.js` + `modals/ActivityModal.jsx`) |
| Att tolka ett event-id som "session-X-Y"  | `core/utils/bookingMeta.js`                                                                    |
| Färgvalet på aktivitet                    | Bor i `@zoplanner/activity-creation` (`utils/eventColors.js`)                                  |

---

## Konventioner

- **Filnamn**: komponenter `.jsx` i `PascalCase`, hooks `.js` med `useXxx`-prefix, utils `.js` i `camelCase`.
- **Exporter**: schedulers exporteras som _named_, modaler som _default_ (av historiska skäl). Båda re-exporteras enhetligt från `index.js`.
- **CSS**: BEM (`scheduler-modal__header` osv). All CSS är global – rör ej klassnamn lättvindigt.
- **Språk**: kommentarer och UI-text på svenska.
