import GanttActivitySegment from "./GanttActivitySegment";
import GanttClass from "./GanttClass";

function GanttRow({classData, assignment}) {

    return (
        <tr className="gantt-row">
            <GanttClass classData={classData} assignment={assignment} />
        </tr>
    )
}

export default GanttRow