# @zoplanner/month-calendar

Sidopanelens månadsvy. Renderar ett klickbart månads-grid och öppnar ett
inbäddat skapa-aktivitet-formulär när användaren väljer en dag.

> Importera alltid från paketets rot: `import { MonthCalendar } from "@zoplanner/month-calendar";`

---

## Vad finns här?

```
month-calendar/
├── index.js     ← Publik export (MonthCalendar)
└── ui/
    ├── index.jsx
    └── index.css
```

---

## Förhållande till andra paket

- Importerar `ACTIVITY_COLOR_OPTIONS` + `DEFAULT_ACTIVITY_COLOR` från
  [@zoplanner/activity-creation](../add-activity-button/README.md). All
  skapande-logik (form-state, validering, modalstil) ligger där.
- Konsumeras av [@zoplanner/sidebar](../../components/sidebar) som monterar
  vyn i sidopanelen.

---

## API

```jsx
<MonthCalendar
  variant="sidebar" // "sidebar" | "page"
  onSubmit={async (data) => {
    /* spara aktivitet */
  }}
  openRequestKey={n} // öka för att öppna modalen programmatiskt
/>
```

`onSubmit` får ett normaliserat formulärobjekt
(`title`, `description`, `date`, `startTime`, `endTime`, `type`, `color`) och
ska returnera `false` om sparning misslyckas — då visas ett felmeddelande
istället för att stänga modalen.
