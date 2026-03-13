import {useState} from "react";
import { buildCourseDraft } from "../utils/courseDraft.helpers";

export function useCourseSetupForm (onSave) {
    const [courseName, setCourseName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [durationWeeks, setDurationWeeks] = useState("");
    const [totalHours, setTotalHours] = useState("");
    const [selectedWeekdays, setSelectedWeekdays] = useState([]);

    function handleWeekdayToggle(day) {
  setSelectedWeekdays((prev) =>
    prev.includes(day)
      ? prev.filter((weekday) => weekday !== day)
      : [...prev, day]
  );
}

    function handleChange (event) {
        const {name, value} = event.target;

        switch (name) {
            case "courseName":
            setCourseName(value);
            break;

            case "startDate":
            setStartDate(value);
            break;

            case "durationWeeks":
            setDurationWeeks(value);
            break;

            case "totalHours":
            setTotalHours(value);
            break;


            default:
                break;
        }
    }

    function handleSubmit (event) {
        event.preventDefault();

        const courseDraft = buildCourseDraft({
            
            courseName,
            startDate,
            durationWeeks,
            totalHours,
            selectedWeekdays,

        });
        

        console.log("Saved course draft:", courseDraft);

        onSave?.(courseDraft);

        setCourseName("");
        setStartDate("");
        setDurationWeeks("");
        setTotalHours("");
        setSelectedWeekdays([]);
  

    }

    return {
        courseName,
        startDate,
        durationWeeks,
        totalHours,
        selectedWeekdays,
        handleChange,
        handleSubmit,
        handleWeekdayToggle,
    };
}

