function GanttHeaderWeeks({ week }) {
    return (
        <th>
            <div className="week-info">
                    <span className="week-num">{week}</span>
                    <span className="week-dates">28/8-1/9</span>
            </div>
        </th>
    )
}

export default GanttHeaderWeeks