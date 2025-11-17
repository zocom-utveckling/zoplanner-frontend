import GanttHeaderWeeks from "./GanttHeaderWeeks.jsx";

function GanttHeader({ weeks }) {
    const currentWeek = 35;
    const weekElements = [];

    for (var i = 35; i < currentWeek + parseInt(weeks); i++) {
        weekElements.push(<GanttHeaderWeeks week={i}></GanttHeaderWeeks>)
    }

    return (
        <thead class="gantt-header">

            <tr className="gantt-header">
                <th>Kund / Klass</th>
                {weekElements}
            </tr>
        </thead>
    )

}

export default GanttHeader