# @zoplanner/profile-card

Stort, dekorativt profilkort som visas högst upp i sidopanelen. Innehåller
användarens profilbild (eller initialer som fallback) och namn.

> Skiljer sig från [@zoplanner/user-profile](../user-profile) som är en
> kompakt rad med avatar + namn + titel. `ProfileCard` är det centrerade
> "kort"-formatet med stor avatar.

## Beskrivning

Komponenten:

- Visar profilbild om sådan finns på `user.profilePicture` /
  `user.profilePictureUrl`. Annars renderas initialerna (max två tecken)
  som fallback.
- Lyssnar på det globala fönster-eventet
  `zoplanner:profile-picture-updated` och uppdaterar bilden direkt om
  något annat ställe i appen (t.ex. profilsidan) laddar upp en ny bild.
  Eventet förväntas innehålla `{ detail: { userId, profilePicture } }`.
- Normaliserar URL:er via `VITE_API_BASE_URL` och `VITE_FILES_BASE_URL`
  så att relativa sökvägar (`/files/...`) pekar på rätt backend.

## Användning

```jsx
import { ProfileCard } from "@zoplanner/profile-card";

<ProfileCard user={user} />;
```

## Props

| Prop      | Typ      | Default | Beskrivning                                                                                          |
| --------- | -------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `user`    | `object` | —       | Användarobjekt med minst `id` och `name`. Bilden tas från `profilePicture` eller `profilePictureUrl` |
| `logoSrc` | `string` | `null`  | Reserverad för framtida bruk; används inte i nuvarande layout                                        |

Returnerar `null` om `user` saknas.

## Filstruktur

```
profile-card/
├── index.js         # re-exporterar ProfileCard
├── package.json
└── ui/
    ├── index.jsx
    └── index.css
```

## Konsumenter

- [@zoplanner/sidebar](../../components/sidebar)
- [@zoplanner/profile-page](../../pages/profile-page)

## Beroenden

- `react`, `react-dom` (peer)

## Miljövariabler

- `VITE_API_BASE_URL` (default `http://localhost:5027`) — backend som
  serverar `/User/...` och relativa URL:er som börjar på `/`.
- `VITE_FILES_BASE_URL` (default `http://localhost:8080`) — backend som
  serverar uppladdade filer under `/files/...`.
