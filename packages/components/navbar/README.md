# @zoplanner/navbar

Toppnavigation som visas på alla inloggade vyer. Innehåller logga, snabbikoner
(notiser, mörkt läge, språk), sidnavigation (Skrivbord/Admin/Meddelande/Notiser)
och profilbild som länkar till `/profile/:id`.

> Importera alltid från paketets rot: `import { Navbar } from "@zoplanner/navbar";`

---

## Vad finns här?

```
navbar/
├── index.js     ← Re-export av ui/
└── ui/
    ├── index.jsx
    └── index.css
```

---

## API

```jsx
<Navbar
  user={user}                       // krävs – render returnerar null om saknas
  activePage="dashboard"            // markerar vilken route-knapp som ska se aktiv ut
  setActivePage={...}               // (reserverad – används inte i nuvarande markup)
  onResetCalendarUser={() => ...}   // valfri – kallas när logga/Skrivbord klickas
                                    // för att nollställa "annans kalender"-vyer
/>
```

### Beteenden värda att känna till

- **Render returnerar `null` om `user` är falsy.** Vyer som monterar `<Navbar />`
  innan användardatan är klar kraschar därför inte.
- **Admin-knappen visas bara för managers.** Rollen tolkas case-okänsligt och
  `BOTH` räknas också som manager (se `normalizedRoles` i `ui/index.jsx`).
- **Notis- och språkknappen är "kommer snart"-stubbar.** Klick visar en kort
  bubbla `"Kommer inom kort"` i 2 sekunder. Funktionaliteten finns inte ännu.
- **Profilbild** hämtas via `useProfilePicture(user.id, user.profilePicture)`
  från `@zoplanner/app-hooks` så att uppladdningar slår igenom utan reload.
- **Utloggnings-dropdown är utkommenterad** i markup (sparad för framtiden).
  Logga ut sker idag genom att navigera till `/`.

---

## Förhållande till andra paket

- Importerar `<DarkModeButton />` från `@zoplanner/dark-mode-button`.
- Importerar `useProfilePicture` från `@zoplanner/app-hooks`.
- Importerar `<ConfirmPopup />` med relativ sökväg från
  `components/confirm-popup` (för utloggningsbekräftelsen som idag är
  utkommenterad men finns i markup-trädet).
- Hämtar `homeRoute` från `@zoplanner/app-routes/appRoutes.config`.

Konsumeras av sidor som har en inloggad layout: `home-page`, `dashboard`
(via `DashboardLayout`), `admin-page`, `courses-page`, `messages-page`,
`profile-page`.

---

## Konventioner

- BEM-klassnamn (`navbar__route-btn--active` osv).
- All UI-text på svenska.
- `Navbar` exporteras som _named_ via `ui/index.jsx` och re-exporteras från
  paketroten.
