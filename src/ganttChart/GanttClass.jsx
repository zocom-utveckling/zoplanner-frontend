import { useEffect, useState } from "react"

function GanttClass({ classData, assignment}) {

    const [consultant, setConsultant] = useState({});

    useEffect(() => {
                if (!assignment || !assignment.consultantId) return;

        fetch("http://localhost:5027/api/User/" + assignment.consultantId)
            .then(res => res.json())
            .then(setConsultant)
            .catch(() => setConsultant({}));
    }, [assignment?.consultantId]);

    return (
        <td>
            <span className="class-label">{classData.name} - {assignment.courseName}</span>
            <span className="class-meta">{assignment.dateStart} – {assignment.dateEnd}</span>
            <span className="consultant-name">Konsult: {consultant?.name || 'ingen'}</span>
        </td>
    )   
}

export default GanttClass