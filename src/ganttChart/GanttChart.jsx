import { useState, useEffect } from "react";


import GanttHeader from "./GanttHeader.jsx";
import GanttCustomer from "./GanttCustomer.jsx";

//data example




function GanttChart({ weeks }) {

    const [customers, setCustomers] = useState([]);

    // data.customers.forEach(customer => {
    //     customers.push(<GanttCustomer customer={customer} />);
    // });

    //Hämta kunder
    useEffect(() => {
        fetch("http://localhost:5027/api/Customer")
            .then(res => res.json())
            .then(setCustomers);
    }, []);

    return (
        <div className="gantt-container">
            <table className="gantt-table">
                <GanttHeader weeks="8" />
                <tbody className="customers">
                    {
                        customers.map(customer => (
                            <GanttCustomer customer={customer} />
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}

export default GanttChart