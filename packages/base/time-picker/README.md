# @zoplanner/time-picker

Återanvändbar tidväljare för ZoPlanner. Wrappar MUI:s `<TimePicker>` med
svensk lokalisering, 24-timmarsformat och en API-form som matchar
vanliga `<input type="time">`-fält så att den kan droppas in i befintliga
formulär utan special-hantering.

## Beskrivning

- Öppnas som popper i desktop-läge och dialog i mobil.
- 24-timmars (`ampm={false}`), minutsteg om 5.
- Lokaliserad på svenska via `date-fns/locale/sv`.
- Stänger automatiskt när tid valts (`closeOnSelect`), ingen separat
  "OK"-knapp.
- `onChange` får ett **syntetiskt event** med formen
  `{ target: { name, value: "HH:mm" } }` — samma signatur som vanliga
  HTML-inputs, så samma `handleChange` kan användas i ett formulär.

## Användning

```jsx
import ZoTimePicker from "@zoplanner/time-picker";

function ActivityForm() {
  const [form, setForm] = useState({ startTime: "", endTime: "" });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <>
      <ZoTimePicker
        label="Starttid *"
        name="startTime"
        value={form.startTime}
        onChange={handleChange}
        required
      />
      <ZoTimePicker
        label="Sluttid *"
        name="endTime"
        value={form.endTime}
        onChange={handleChange}
        required
      />
    </>
  );
}
```

> Komponenten exporteras som **default**:
> `import ZoTimePicker from "@zoplanner/time-picker";`

## Props

| Prop       | Typ               | Default | Beskrivning                                                                             |
| ---------- | ----------------- | ------- | --------------------------------------------------------------------------------------- |
| `value`    | `string`          | —       | Tid i formatet `"HH:mm"`. Tomt eller ogiltigt → tomt fält                               |
| `onChange` | `(event) => void` | —       | Anropas med `{ target: { name, value } }` där `value` är `"HH:mm"` eller `""` om rensat |
| `label`    | `string`          | —       | Etikett som visas över fältet                                                           |
| `name`     | `string`          | —       | Fältets namn — skickas tillbaka i `event.target.name`                                   |
| `disabled` | `boolean`         | `false` | Inaktiverar fältet                                                                      |
| `required` | `boolean`         | `false` | Markerar fältet som obligatoriskt i formulär                                            |

## Filstruktur

```
time-picker/
├── index.js         # default-export från ./ui
├── package.json
└── ui/
    ├── index.jsx    # ZoTimePicker
    └── index.css    # styling-overrides
```

## Konsumenter

- [@zoplanner/sidebar-mini-calendar](../sidebar-mini-calendar)
- [@zoplanner/activity-creation](../add-activity-button) (`ActivityModal`)
- [@zoplanner/calendar](../../components/calendar) (`BookingEditModal`)
- [@zoplanner/planning-tool](../../components/planning-tool) (`SessionModal`, `CourseSetupForm`)

## Beroenden

- `react`, `react-dom`
- `@mui/x-date-pickers`, `@mui/material`, `@emotion/react`, `@emotion/styled`
- `date-fns` (för parsing/formatering och svensk lokalisering)
