# @zoplanner/sidebar

Sidopanelen som visas bredvid kalendern på inloggade vyer. Innehåller
profilkort, konsultlista (för managers), "lägg till aktivitet"-knapp och en
månadsvy.

> Importera alltid från paketets rot: `import { Sidebar } from "@zoplanner/sidebar";`

---

## Vad finns här?

```
sidebar/
├── index.js     ← Re-export av ui/
└── ui/
    ├── index.jsx
    └── index.css
```

---

## API

```jsx
<Sidebar
  user={user}                                  // krävs – render returnerar null om saknas
  onSelectCalendarUser={(consultant) => ...}   // valfri – kallas när manager väljer
                                               // en konsult i listan (för korskalender-vy)
/>
```

---

## Beteenden värda att känna till

- **Render returnerar `null` om `user` är falsy.**
- **Konsultlistan visas bara för managers.** Rollen tolkas case-okänsligt och
  `BOTH` räknas också som manager (`normalizedRoles` i `ui/index.jsx`).
- **Konsulter laddas via `userService.getAll()`.** Den inloggade användaren
  filtreras bort ur listan.
- **`AddActivityButton` öppnar `MonthCalendar`s inbäddade modal.** Det görs
  genom `addActivityOpenKey` som inkrementeras vid klick — `<MonthCalendar />`
  reagerar på ändringar i `openRequestKey` och öppnar formuläret.
- **`handleSubmitActivity`** anropar `activityService.create()` och
  `emitActivitiesUpdated(user.id)` från `@zoplanner/calendar` så att andra
  kalendervyer laddar om sin data.

---

## Förhållande till andra paket

- `<ProfileCard />` från `@zoplanner/profile-card`
- `<UserProfile />` från `@zoplanner/user-profile` (variant `compact` för
  konsultlistan)
- `<AddActivityButton />` från `@zoplanner/activity-creation`
- `<MonthCalendar />` från `@zoplanner/month-calendar`
- `userService` + `activityService` från `@zoplanner/api`
- `emitActivitiesUpdated` från `@zoplanner/calendar` (event-bus för
  cross-calendar-uppdateringar)

Konsumeras av sidor med en inloggad layout: `home-page`, `dashboard`
(via `DashboardLayout`).

---

## Konventioner

- BEM-klassnamn (`sidebar__users__toggle` osv).
- All UI-text på svenska.
- `Sidebar` exporteras som _named_ via `ui/index.jsx` och re-exporteras från
  paketroten.
