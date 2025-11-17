import GanttRow from "./GanttRow.jsx";




function GanttCustomer({ customer }) {
 
    const classes = []

    customer.classes.forEach(classData => {
        classData.assignments.forEach(assignment => {
            classes.push(<GanttRow classData={{id: classData.id, name: classData.name}} assignment={assignment} consultant={assignment.consultant} />);
        });
    });

    return (
        <>
            <tr>
                <td colSpan="9" className="customer-header">{customer.name} – {customer.city}</td>
            </tr>
            {classes}
        </>
    )
}

export default GanttCustomer