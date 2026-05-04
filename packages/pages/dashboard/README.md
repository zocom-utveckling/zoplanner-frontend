# @zoplanner/dashboard

Sidan **Dashboard** — den vy som visas när en inloggad användare landar på
startsidan eller navigerar till dashboard-rutten. Paketet är medvetet tunt:
hela kalender-, drag-and-drop- och aktivitetslogiken bor i
`@zoplanner/calendar`. Det här paketet är bara en tunn page-wrapper som
plockar upp props från routern och skickar vidare till `<DashboardScheduler />`.

## Publik API

```js
import { Dashboard } from "@zoplanner/dashboard";
```

### `<Dashboard />`

| Prop           | Typ      | Beskrivning                                                                                            |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `user`         | `object` | Inloggad användare. Komponenten returnerar `null` om den saknas.                                       |
| `calendarUser` | `object` | Den användare vars kalender ska visas (kan skilja sig från `user` om en manager tittar på en konsult). |
| `managerUser`  | `object` | Inloggad manager när `calendarUser` är någon annan — används av schemaläggaren för rättighetslogik.    |

Komponenten renderar inget eget — den är en pass-through till
`<DashboardScheduler user calendarUser managerUser />`.

## Beteenden värda att känna till

- **`null`-render om `user` saknas.** Skyddar mot blink innan auth har
  hunnit ladda.
- **All schemalogik ligger i `@zoplanner/calendar`.** Vill du ändra hur
  aktiviteter visas, redigeras eller skapas i dashboardvyn — gå dit, inte hit.
- **Sidan äger inte sin egen state.** Routern (`DashboardRoute`) sätter
  `calendarUser` baserat på `?user=`-parametern och skickar in.

## Förhållande till andra paket

- `@zoplanner/calendar` — tillhandahåller `<DashboardScheduler />`.

Konsumenter:

- `packages/app-routes/DashboardRoute.jsx` — primär route-wrapper.
- `packages/core/router/data/index.jsx` — registrerar routen.
- `packages/pages/home-page/ui/index.jsx` — använder `<Dashboard />` som
  startvy för inloggade användare.

## Ändringsguide

- Lägg **inte** till kalender- eller aktivitetslogik här. Det hör hemma i
  `@zoplanner/calendar`.
- Behöver dashboardvyn nya layout-element (sidopaneler, banners, widgets)
  — lägg dem i den här filen runt `<DashboardScheduler />`, inte i kalendern.
- Behöver ny prop skickas vidare till schemaläggaren — lägg till den i
  `<Dashboard />`-signaturen och i `DashboardRoute.jsx`.
