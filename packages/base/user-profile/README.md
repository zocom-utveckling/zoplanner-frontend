# @zoplanner/user-profile

Kompakt rad med avatar, namn och titel/roll. Används i listor och
sidopaneler där flera användare visas i tät layout.

> Skiljer sig från [@zoplanner/profile-card](../profile-card) som är ett
> stort, centrerat profilkort med dekorativ header. `UserProfile` är
> den smala "rad"-versionen.

## Beskrivning

- Visar profilbild om sådan finns, annars initialer (max två tecken).
- Visar formaterad titel via `user.title`, `user.jobTitle`,
  `user.position` eller `user.role` (i den ordningen). Specialfall:
  värdet `"both"` formateras som `"Manager + Consultant"`.
- Lyssnar på det globala fönster-eventet
  `zoplanner:profile-picture-updated` och uppdaterar bilden direkt om
  något annat ställe i appen laddar upp en ny.
- Normaliserar URL:er via `VITE_API_BASE_URL` och `VITE_FILES_BASE_URL`
  så att relativa sökvägar pekar på rätt backend.

## Användning

```jsx
import { UserProfile } from "@zoplanner/user-profile";

<UserProfile user={user} />; // standard – avatar, namn, titel
<UserProfile user={user} variant="compact" />; // utan titel, smalare
```

## Props

| Prop      | Typ                      | Default     | Beskrivning                                                                                                                     |
| --------- | ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `user`    | `object`                 | —           | Måste ha `id` och `name`. Bilden tas från `profilePicture`/`profilePictureUrl`. Titel från `title`/`jobTitle`/`position`/`role` |
| `variant` | `"default" \| "compact"` | `"default"` | `compact` döljer titeln och drar ihop layouten                                                                                  |

Returnerar `null` om `user` saknas.

## Filstruktur

```
user-profile/
├── index.js         # re-exporterar UserProfile
├── package.json
└── ui/
    ├── index.jsx
    └── index.css
```

## Konsumenter

- [@zoplanner/sidebar](../../components/sidebar) — visar listan av
  konsulter under manageröversikten.

## Beroenden

- `react`, `react-dom`

## Miljövariabler

- `VITE_API_BASE_URL` (default `http://localhost:5027`)
- `VITE_FILES_BASE_URL` (default `http://localhost:8080`)
