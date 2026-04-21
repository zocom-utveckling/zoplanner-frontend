import { useState, useEffect } from "react";
import { buildCourseDraft } from "../utils/courseDraft.helpers";

export function useCourseSetupForm(onSave, initialValues) {
  const [courseName, setCourseName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("UTKAST – ange kund");

  const [classId, setClassId] = useState("");
  const [className, setClassName] = useState("UTKAST – ange klass");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [selectedWeekdays, setSelectedWeekdays] = useState([]);

  // 🔥 Ladda in draft igen (fixar tomt formulär)
  useEffect(() => {
    if (!initialValues) return;

    setCourseName(initialValues.courseName ?? "");
    setCustomerId(initialValues.customerId ?? "");
    setCustomerName(initialValues.customerName ?? "UTKAST – ange kund");

    setClassId(initialValues.classId ?? "");
    setClassName(initialValues.className ?? "UTKAST – ange klass");

    setStartDate(initialValues.startDate ?? "");
    setEndDate(initialValues.endDate ?? "");
    setTotalHours(
      initialValues.totalHours != null
        ? String(initialValues.totalHours)
        : ""
    );
    setSelectedWeekdays(initialValues.selectedWeekdays ?? []);
  }, [initialValues]);

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
        item.day === day ? { ...item, startTime: value } : item
      )
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

      case "customerId":
        setCustomerId(value);
        break;

      case "customerName":
        setCustomerName(value);
        break;

      case "classId":
        setClassId(value);
        break;

      case "className":
        setClassName(value);
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

    const safeCourseName = courseName.trim() || "UTKAST – ange kursnamn";
    const safeCustomerName =
      customerName.trim() || "UTKAST – ange kund";
    const safeClassName = className.trim() || "UTKAST – ange klass";

    const parsedTotalHours = Number(totalHours);

    if (!courseName.trim()) {
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

    const hasMissingTime = selectedWeekdays.some(
      (item) => !item.startTime
    );

    if (hasMissingTime) {
      alert("Ange tid för alla valda dagar.");
      return;
    }

    const courseDraft = buildCourseDraft({
      courseName: safeCourseName,
      isDraftCourse: !courseName.trim(),

      customerId: customerId || null,
      customerName: safeCustomerName,
      isDraftCustomer: !customerId,

      classId: classId || null,
      className: safeClassName,
      isDraftClass: !classId,

      startDate,
      endDate,
      totalHours: parsedTotalHours,
      selectedWeekdays,
    });

    if (!courseDraft.sessionsDraft.length) {
      alert(
        "Det gick inte att skapa en planering med de valda uppgifterna."
      );
      return;
    }

    console.log("Saved course draft:", courseDraft);

    onSave?.(courseDraft);

    // reset (kan tas bort senare om du vill behålla state)
    setCourseName("");
    setCustomerId("");
    setCustomerName("UTKAST – ange kund");
    setClassId("");
    setClassName("UTKAST – ange klass");
    setStartDate("");
    setEndDate("");
    setTotalHours("");
    setSelectedWeekdays([]);
  }

  return {
    courseName,
    customerId,
    customerName,
    classId,
    className,
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