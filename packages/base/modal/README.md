# @zoplanner/modal

Delad modal-overlay för ZoPlanners frontend. Hanterar backdrop, klick-utanför
och (frivilligt) Escape-stängning. All visuell stil ligger kvar i kalenderns
CSS (`.scheduler-modal-overlay` / `.scheduler-modal-content`) — paketet är
rent strukturellt.

---

## Mappstruktur

```
modal/
├── index.js          ← Publika exporter (det enda externa filer ska importera)
├── package.json
└── ui/
    └── Modal.jsx     ← Compound-komponenten (<Modal> + <Modal.Content>)
```

---

## Publika API:t (`index.js`)

```js
import { Modal } from "@zoplanner/modal";
```

### `<Modal>`

Renderar bakgrunden (overlay). Stänger vid klick utanför innehållet och
(om `closeOnEscape`) vid Escape-tangent.

| Prop            | Typ          | Default | Beskrivning                                       |
| --------------- | ------------ | ------- | ------------------------------------------------- |
| `onClose`       | `() => void` | —       | Anropas när användaren stänger modalen.           |
| `closeOnEscape` | `boolean`    | `false` | Lyssna på Escape och anropa `onClose`.            |
| `children`      | `ReactNode`  | —       | Innehållet — vanligen ett `<Modal.Content>`-barn. |

### `<Modal.Content>`

Standard innehållsruta — vit kort med `role`/`aria-label` och
`stopPropagation` så klick inuti inte stänger modalen. Modaler som vill
rendera sin egen ruta (t.ex. `RequestActivityModal`) hoppar över
`<Modal.Content>` och lägger sitt eget innehåll direkt under `<Modal>`.

| Prop        | Typ         | Default | Beskrivning                                                     |
| ----------- | ----------- | ------- | --------------------------------------------------------------- |
| `role`      | `string`    | —       | ARIA-roll, t.ex. `"dialog"`. Sätts då även `aria-modal="true"`. |
| `ariaLabel` | `string`    | —       | Tillgänglighetsetikett.                                         |
| `children`  | `ReactNode` | —       | Modalens innehåll (header, formulär, knappar osv).              |

---

## Användning

### Standardfall — innehåll i en kortruta

```jsx
import { Modal } from "@zoplanner/modal";

<Modal onClose={handleClose} closeOnEscape>
  <Modal.Content role="dialog" ariaLabel="Detaljer">
    <h2>Detaljer</h2>
    {/* ...resten av modalen... */}
  </Modal.Content>
</Modal>;
```

### Specialfall — modalen ritar sin egen ruta

```jsx
<Modal onClose={handleClose}>
  <RequestActivityModal {...props} />
</Modal>
```

---

## Hur paketet hänger ihop med övriga paket

- **`@zoplanner/activity-creation`** använder `<Modal>` i `ActivityModal`.
- **`@zoplanner/calendar`** använder `<Modal>` i `EventDetailsModal`,
  `BookingEditModal` och `DashboardScheduler` (för `RequestActivityModal`).

Paketet har inga egna beroenden utöver React.

---

## Konventioner

- All UI-text och kommentarer på svenska.
- CSS-klasserna (`scheduler-modal-overlay`, `scheduler-modal-content`)
  bor i kalenderns CSS — paketet definierar ingen egen stil.
- Inga ARIA-roller sätts automatiskt; det är upp till varje modal att
  ange `role` och `ariaLabel` på `<Modal.Content>` när det behövs.
