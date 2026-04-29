import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { sv } from "date-fns/locale";
import { parse, format, isValid } from "date-fns";

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
        disabled={disabled}
        slotProps={{
          textField: {
            required,
            size: "small",
            fullWidth: true,
            sx: {
              "& .MuiInputLabel-root": {
                fontFamily: "Poppins, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--text-muted)",
                "&.Mui-focused": { color: "var(--active-bg)" },
              },
              "& .MuiOutlinedInput-root": {
                fontFamily: "Poppins, sans-serif",
                fontSize: "14px",
                color: "var(--text-primary)",
                backgroundColor: "var(--surface)",
                borderRadius: "8px",
                "& fieldset": {
                  borderColor: "var(--border-color)",
                },
                "&:hover fieldset": {
                  borderColor: "var(--border-strong)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--active-bg)",
                  borderWidth: "2px",
                },
                "&.Mui-disabled": {
                  backgroundColor: "var(--surface-muted)",
                  "& fieldset": { borderColor: "var(--border-subtle)" },
                },
              },
              "& .MuiInputBase-input": {
                padding: "10px 12px",
                color: "var(--text-primary)",
              },
              "& .MuiSvgIcon-root": {
                color: "var(--text-muted)",
              },
            },
          },
          popper: {
            sx: {
              "& .MuiPaper-root": {
                backgroundColor: "var(--surface)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
                boxShadow: "var(--elevation-modal)",
                fontFamily: "Poppins, sans-serif",
              },
              "& .MuiClock-root": {
                backgroundColor: "var(--surface)",
              },
              "& .MuiClockNumber-root": {
                color: "var(--text-primary)",
                fontFamily: "Poppins, sans-serif",
              },
              "& .MuiClockPointer-root": {
                backgroundColor: "var(--active-bg)",
              },
              "& .MuiClock-pin": {
                backgroundColor: "var(--active-bg)",
              },
              "& .MuiClockPointer-thumb": {
                backgroundColor: "var(--active-bg)",
                borderColor: "var(--active-bg)",
              },
              "& .MuiClockNumber-root.Mui-selected": {
                backgroundColor: "var(--active-bg)",
                color: "var(--active-fg)",
              },
              "& .MuiPickersToolbar-root": {
                backgroundColor: "var(--surface-alt)",
              },
              "& .MuiTimePickerToolbar-hourMinuteLabel button": {
                color: "var(--text-primary)",
                fontFamily: "Poppins, sans-serif",
              },
              "& .MuiPickersToolbar-content .Mui-selected": {
                color: "var(--accent)",
              },
            },
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
