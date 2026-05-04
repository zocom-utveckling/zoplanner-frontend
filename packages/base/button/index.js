// CSS-only paket. Importera "@zoplanner/button/buttons.css" en gång i app-roten
// (src/main.jsx) så är klasserna .button, .button_submit, .button_cancel m.fl.
// tillgängliga globalt.
//
// Användning i komponenter:
//   <button className="button button_submit">Spara</button>
//   <button className="button button_cancel">Avbryt</button>
//
// Inga JS-exports — den här filen finns bara så paketet löses ut korrekt av
// npm-workspaces.
export {};
