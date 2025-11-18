import { useState, useEffect } from "react";
import GanttActivitySegment from "./GanttActivitySegment";
import GanttClass from "./GanttClass";

function GanttRow({ classData }) {

    const [assignments, setAssigments] = useState([])

    useEffect(() => {
        fetch("http://localhost:5027/api/Assignment/class/" + classData.id)
            .then(res => res.json())
            .then(setAssigments);
    }, [classData.id]);

    return (
        <tr className="gantt-row">
            {
                assignments.map(assignment => (
                    <GanttClass classData={classData} assignment={assignment} />
                ))
            }
        </tr>
    )
}

export default GanttRow