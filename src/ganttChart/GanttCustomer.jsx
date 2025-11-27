import { useState, useEffect } from "react";

import GanttRow from "./GanttRow.jsx";



function GanttCustomer({ customer }) {

    const [classes, setClasses] = useState([]);

    // customer.classes.forEach(classData => {
    //     classData.assignments.forEach(assignment => {
    //         classes.push(<GanttRow classData={{id: classData.id, name: classData.name}} assignment={assignment} consultant={assignment.consultant} />);
    //     });
    // });

    //Hämta kunder
    useEffect(() => {
        fetch("http://localhost:5027/api/Class/customer/" + customer.id)
            .then(res => res.json())
            .then(setClasses);
    }, [customer.id]);

    return (
        <>
            <tr>
                <td colSpan="9" className="customer-header">{customer.name} – {customer.city}</td>
            </tr>
            {
                classes.map(classData => (
                    <GanttRow classData={classData} />
                ))
            }
        </>
    )
}

export default GanttCustomer