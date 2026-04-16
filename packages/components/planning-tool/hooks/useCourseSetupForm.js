import { useState } from "react";
import { buildCourseDraft } from "../utils/courseDraft.helpers";

export function useCourseSetupForm(onSave) {
  const [courseName, setCourseName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [selectedWeekdays, setSelectedWeekdays] = useState([]);

  function handleWeekdayToggle(day) {
    setSelectedWeekdays((prev) => {
      const exists = prev.some((item) => item.day === day);

      if (exists) {
        return prev.filter((item) => item.day !== day);
      }

      return [...prev, { day, startTime: "" }];
    });
  }

  function handleWeekdayTimeChange(day, event) {
    const value = event.target.value;

    setSelectedWeekdays((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, startTime: value } : item,
      ),
    );
  }

  function getStartTimeForDay(day) {
    return selectedWeekdays.find((item) => item.day === day)?.startTime || "";
  }

  function isSelected(day) {
    return selectedWeekdays.some((item) => item.day === day);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    switch (name) {
      case "courseName":
        setCourseName(value);
        break;
      case "startDate":
        setStartDate(value);
        break;
      case "endDate":
        setEndDate(value);
        break;
      case "totalHours":
        setTotalHours(value);
        break;
      default:
        break;
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const safeCourseName = courseName.trim();
    const parsedTotalHours = Number(totalHours);

    if (!safeCourseName) {
      alert("Ange kursnamn.");
      return;
    }

    if (!startDate) {
      alert("Välj startdatum.");
      return;
    }

    if (!endDate) {
      alert("Välj slutdatum.");
      return;
    }

    if (Number.isNaN(parsedTotalHours) || parsedTotalHours < 1) {
      alert("Ange totalt antal undervisningstimmar.");
      return;
    }

    if (selectedWeekdays.length === 0) {
      alert("Välj minst en dag.");
      return;
    }

    const hasMissingTime = selectedWeekdays.some((item) => !item.startTime);

    if (hasMissingTime) {
      alert("Ange tid för alla valda dagar.");
      return;
    }

    const courseDraft = buildCourseDraft({
      courseName: safeCourseName,
      startDate,
      endDate,
      totalHours: parsedTotalHours,
      selectedWeekdays,
    });

    if (!courseDraft.sessionsDraft.length) {
      alert("Det gick inte att skapa en planering med de valda uppgifterna.");
      return;
    }

    console.log("Saved course draft:", courseDraft);

    onSave?.(courseDraft);

    setCourseName("");
    setStartDate("");
    setEndDate("");
    setTotalHours("");
    setSelectedWeekdays([]);
  }

  return {
    courseName,
    startDate,
    endDate,
    totalHours,
    selectedWeekdays,
    handleChange,
    handleSubmit,
    handleWeekdayToggle,
    handleWeekdayTimeChange,
    getStartTimeForDay,
    isSelected,
  };
}