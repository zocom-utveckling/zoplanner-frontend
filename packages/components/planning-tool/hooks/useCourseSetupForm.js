import {useState} from "react";
import { buildCourseDraft } from "../utils/courseDraft.helpers";

export function useCourseSetupForm (onSave) {
    const [courseName, setCourseName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [durationWeeks, setDurationWeeks] = useState("");
    const [totalHours, setTotalHours] = useState("");
    const [sessionCount, setSessionCount] = useState("");

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

            case "sessionCount":
            setSessionCount(value);
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
            sessionCount,
        });
        

        console.log("Saved course draft:", courseDraft);

        onSave?. (courseDraft);

        setCourseName("");
        setStartDate("");
        setDurationWeeks("");
        setTotalHours("");
        setSessionCount("");

    }

    return {
        courseName,
        startDate,
        durationWeeks,
        totalHours,
        sessionCount,
        handleChange,
        handleSubmit,
    };
}

