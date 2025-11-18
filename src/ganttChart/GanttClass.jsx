import { useEffect, useState } from "react"

function GanttClass({ classData, assignment}) {

    const [consultant, setConsultant] = useState("ingen");

    useEffect(() => {
                console.log(assignment.consultantId);

        fetch("http://localhost:5027/api/User/" + assignment.consultantId)
            .then(res => res.json())
            .then(setConsultant);
    });

    return (
        <td>
            <span className="class-label">{classData.name} - {assignment.courseName}</span>
            <span className="class-meta">{assignment.dateStart} – {assignment.dateEnd}</span>
            <span className="consultant-name">Konsult: {consultant.name}</span>
        </td>
    )   
}

export default GanttClass