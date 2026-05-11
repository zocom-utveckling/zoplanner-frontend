# @zoplanner/home-page

Sidan **HomePage** — toppnivå-shellen som renderas när en inloggad användare
landar på `/home/:id`. Den äger:

- Vilken vy som är aktiv (`dashboard`, `allSchedules`, `courses`, `messages`,
  `profile`).
- Vilken användare kalendern visar (`calendarUser`) — relevant när en manager
  klickar på en konsult i sidopanelen.
- Hämtning av den inloggade användarens profil från backend.

Layouten består av `<Navbar />` överst, `<Sidebar />` till vänster och en
växlande huvudpanel till höger som väljs via `activePage`-state.

## Plats

`packages/pages/home-page/`

## Publik API

```js
import { HomePage } from "@zoplanner/home-page";
```

### `<HomePage />`

Tar inga props. Läser:

- `useParams().id` — användar-id från URL:en (`/home/:id`).
- `useSearchParams().view` — valfri startvy via `?view=courses` etc.

Returnerar `<div>Laddar användare...</div>` tills profilen är hämtad, sedan
en `<DashboardLayout />` med aktuell vy som barn.

## Beteenden värda att känna till

- **Vy-routing sker via state, inte react-router.** `activePage` är en sträng
  som styrs av `?view=`-parametern och av `setActivePage`-anrop från barn
  (sidopaneler, navbar). Routern ser bara `/home/:id`.
- **`allSchedules` är manager-only.** Om en icke-manager försöker landa på
  den vyn (t.ex. via gammal länk) faller `resolvedActivePage` tillbaka till
  `"dashboard"`.
- **Manager-detektion är case-okänslig och accepterar `BOTH`.** Samma
  konvention som i Navbar/Sidebar.
- **`calendarUser` styr Dashboard-vyn.** När en manager klickar en konsult i
  sidopanelen sätts `calendarUser` och `<Dashboard />` får
  `user={calendarUser || user}` plus `managerUser={user}` så att
  schemaläggaren vet vem som tittar på vad.
- **`onResetCalendarUser`** skickas till Navbar — klick på logon/dashboard-
  knappen återställer till managerns egen kalender.

## Förhållande till andra paket

Konsumerar:

- `@zoplanner/navbar` — toppmeny (`<Navbar />`).
- `@zoplanner/sidebar` — vänsterpanel (`<Sidebar />`).
- `@zoplanner/calendar` — `<DashboardScheduler />` (default-vyn) och
  `<AllSchedulesScheduler />` (manager-vyn).
- `@zoplanner/courses-page`, `@zoplanner/messages-page` — sidvyer.
- `@zoplanner/profile-page` — `Profile_Page`.
- `@zoplanner/api` — `userService.getById()` för profilhämtning.

Konsumenter:

- `packages/core/router/data/index.jsx` — registrerar `/home/:id`.

## Ändringsguide

- **Lägg till en ny vy:** lägg ett `case` i `switch (resolvedActivePage)` och
  exponera knappen i Navbar/Sidebar.
- **Ändra layout:** redigera `<DashboardLayout />` i samma fil — den är
  privat för home-page och inte exporterad.
- **Behöver en vy egna routes (URL-segment, inte query-param):** flytta upp
  routingen till `packages/core/router/` istället för att utöka
  `activePage`-switchen.
