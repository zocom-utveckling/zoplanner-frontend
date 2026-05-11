# @zoplanner/dark-mode-button

Knapp för att växla mellan ljust och mörkt tema i ZoPlanner.

## Beskrivning

`DarkModeButton` är en självständig knappkomponent som hanterar appens
tema-tillstånd. Den läser och skriver `data-theme`-attributet på
`<html>`-elementet (`light` eller `dark`) samt persisterar valet i
`localStorage` under nyckeln `theme`. Vid första rendering används det
sparade värdet om det finns, annars systemets `prefers-color-scheme`.

Ikonen byts mellan måne och sol via `react-icons/fa`, och knappen
visar texten "Light" eller "Dark" beroende på aktivt läge.

## Användning

```jsx
import { DarkModeButton } from "@zoplanner/dark-mode-button";

function Navbar() {
  return (
    <nav>
      <DarkModeButton />
    </nav>
  );
}
```

Komponenten tar inga props – den hanterar sitt eget tillstånd. För att
dina komponenter ska reagera på temat, läs `[data-theme="dark"]` i CSS:

```css
.my-component {
  background: var(--surface);
  color: var(--text-primary);
}

[data-theme="dark"] .my-component {
  /* mörka tema-överstyrningar via CSS-variabler */
}
```

## Filstruktur

```
dark-mode-button/
├── index.js         # re-exporterar från ./ui
├── package.json
└── ui/
    ├── index.jsx    # DarkModeButton-komponenten
    └── index.css    # styling för knappen
```

## Konsumenter

- [@zoplanner/navbar](../../components/navbar) – placerar knappen i
  navigationsraden.

## Beroenden

- `react`, `react-dom` (peer)
- `react-icons` (för `FaMoon`, `FaSun`)
