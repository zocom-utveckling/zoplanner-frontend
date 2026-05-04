# @zoplanner/button

CSS-only paket som tillhandahåller appens delade knapp-stilar. Här bor alla
`.button*`-klasser som komponenter använder för att rendera knappar utan att
behöva en egen wrapper-komponent.

## Plats

`packages/base/button/`

## Användning

CSS:en importeras **en gång** i app-roten:

```js
// src/main.jsx
import "@zoplanner/button/buttons.css";
```

Sedan används klasserna direkt på vanliga `<button>`-element:

```jsx
<button className="button button_submit">Spara</button>
<button className="button button_cancel">Avbryt</button>
<button className="button button_send">Skicka</button>
<button className="button button_close-btn">×</button>
<button className="button button_reply-btn">Svara</button>
<button className="button button_delete-btn">Radera</button>
```

## Tillgängliga klasser

| Klass | Beskrivning |
| --- | --- |
| `.button` | Basklass — typografi, fokusring, transitions. Måste vara med på alla varianter. |
| `.button_submit` | Stor primär submit-knapp (full bredd). |
| `.button_cancel` | Sekundär/avbryt-knapp. |
| `.button_send` | Action-knapp (skicka, bekräfta). |
| `.button_close-btn` | Stängningsknapp (×) i modaler. |
| `.button_reply-btn` | Svara-knapp i meddelanden. |
| `.button_delete-btn` | Destruktiv knapp (radera). |

## Designbeslut

- **Inget React-API.** Tidigare fanns en `<Button>`-wrapper men den togs bort
  eftersom den bara förmedlade props till `<button>` — dubbel abstraktion utan
  värde. CSS-klasser räcker.
- **Färger via CSS-variabler.** Alla färger refererar tokens (`--accent`,
  `--surface-muted`, `--delete-bg` m.fl.) som definieras i
  [src/style.css](../../../src/style.css). Det gör att dark mode "bara
  fungerar" utan extra varianter här.
- **Globala klassnamn (ingen scoping).** Knappar är så grundläggande att vi
  medvetet bryter mot BEM-scoping-konventionen i resten av kodbasen.

## Lägga till en ny variant

1. Lägg till `.button_<namn>` i `buttons.css`.
2. Återanvänd CSS-variabler i stället för hårdkodade färger.
3. Dokumentera klassen i tabellen ovan.
