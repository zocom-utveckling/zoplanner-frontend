import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { sv } from "date-fns/locale";
import { parse, format, isValid } from "date-fns";
import "./index.css";

/**
 * ZoTimePicker – en återanvändbar tidväljare för ZoPlanner.
 *
 * Props:
 *   value    {string}   Tid i formatet "HH:mm", t.ex. "09:30". Kan vara null/undefined.
 *   onChange {function} Anropas med ett syntetiskt event: { target: { name, value: "HH:mm" } }
 *                       – samma mönster som ett vanligt <input type="time"> använder.
 *   label    {string}   Etikett som visas ovanför fältet.
 *   name     {string}   Fältets namn (används i det syntetiska eventet).
 *   disabled {boolean}  Inaktiverar fältet.
 *   required {boolean}  Markerar fältet som obligatoriskt.
 */
export default function ZoTimePicker({
  value,
  onChange,
  label,
  name,
  disabled = false,
  required = false,
}) {
  // Konvertera "HH:mm"-sträng till Date-objekt (MUI kräver Date).
  // Använd ett godtyckligt referensdatum; bara tidsdelen är viktig.
  const dateValue = parseTimeString(value);

  function handleChange(newDate) {
    if (!newDate || !isValid(newDate)) {
      onChange({ target: { name, value: "" } });
      return;
    }
    const timeString = format(newDate, "HH:mm");
    onChange({ target: { name, value: timeString } });
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={sv}>
      <TimePicker
        label={label}
        value={dateValue}
        onChange={handleChange}
        ampm={false}
        minutesStep={5}
        closeOnSelect
        disabled={disabled}
        slotProps={{
          textField: {
            required,
            size: "small",
            fullWidth: true,
            className: "zo-time-picker__field",
          },
          dialog: {
            className: "zo-time-picker__dialog",
          },
          mobilePaper: {
            className: "zo-time-picker__mobile-paper",
          },
          actionBar: {
            actions: [],
          },
          popper: {
            className: "zo-time-picker__popper",
          },
        }}
      />
    </LocalizationProvider>
  );
}

/**
 * Konverterar en "HH:mm"-sträng till ett Date-objekt.
 * Returnerar null om värdet saknas eller är ogiltigt.
 */
function parseTimeString(timeString) {
  if (!timeString || typeof timeString !== "string") return null;
  const parsed = parse(timeString, "HH:mm", new Date());
  return isValid(parsed) ? parsed : null;
}
