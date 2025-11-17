function GanttClass({ classData, assignment}) {
    return (
        <td>
            <span className="class-label">{classData.name} - {assignment.name}</span>
            <span className="class-meta">Distans • V35-50</span>
            <span className="consultant-name">Konsult: {assignment.consultant.name}</span>
        </td>
    )
}

export default GanttClass