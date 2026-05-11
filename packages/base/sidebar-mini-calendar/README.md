# @zoplanner/sidebar-mini-calendar

Den lilla månadskalendern som visas i **sidopanelen** (vänster sida i
dashboarden). Inte att förväxla med den stora månadsvyn i kalendern
(`MonthView` i `@zoplanner/calendar`), som täcker hela huvudytan.

> Tidigare hette paketet `@zoplanner/month-calendar`, vilket var
> missvisande eftersom det krockade med dashboardens stora månadsvy.

## Beskrivning

`SidebarMiniCalendar` renderar ett klickbart månads-grid i kompakt
format. När användaren klickar på en dag öppnas en modal med ett
formulär för att skapa en ny aktivitet på den valda dagen.

Färgpalett, modalstil och formulärfält återanvänds från
[@zoplanner/activity-creation](../add-activity-button) — själva
skapande-logiken (validering, fält) ligger där, och denna komponent
ansluter bara grid + modal till en `onSubmit`-callback.

## Användning

```jsx
import { SidebarMiniCalendar } from "@zoplanner/sidebar-mini-calendar";

function Sidebar({ onCreateActivity }) {
  return (
    <aside>
      <SidebarMiniCalendar
        variant="sidebar"
        onSubmit={async (formData) => {
          const ok = await onCreateActivity(formData);
          return ok; // returnera false så visas felmeddelande i modalen
        }}
      />
    </aside>
  );
}
```

## Props

| Prop             | Typ                                      | Default     | Beskrivning                                                                              |
| ---------------- | ---------------------------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| `variant`        | `"sidebar" \| "page"`                    | `"sidebar"` | Stilvariant — `sidebar` är kompakt, `page` är för fristående sidor                       |
| `onSubmit`       | `(formData) => Promise<boolean \| void>` | —           | Anropas vid submit. Returnera `false` för att visa felmeddelande och hålla modalen öppen |
| `openRequestKey` | `number`                                 | `0`         | Öka värdet (t.ex. `Date.now()`) för att öppna modalen programmatiskt utifrån             |

`formData` innehåller `title`, `description`, `date`, `startTime`,
`endTime`, `type`, `color`.

## Filstruktur

```
sidebar-mini-calendar/
├── index.js         # re-exporterar SidebarMiniCalendar
├── package.json
└── ui/
    ├── index.jsx    # komponent + modal
    └── index.css    # styling (CSS-prefix: month-calendar-*)
```

> Internt prefixas CSS-klasserna fortfarande `month-calendar-*` av
> historiska skäl — detta är en intern implementationsdetalj och rör
> inte konsumenter.

## Konsumenter

- [@zoplanner/sidebar](../../components/sidebar) — monterar kalendern i
  sidopanelen.

## Beroenden

- `react`, `react-dom` (peer)
- [@zoplanner/activity-creation](../add-activity-button) (`ACTIVITY_COLOR_OPTIONS`, `DEFAULT_ACTIVITY_COLOR`)
- [@zoplanner/time-picker](../time-picker) (`ZoTimePicker`)
