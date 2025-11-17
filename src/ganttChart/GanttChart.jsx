import GanttHeader from "./GanttHeader.jsx";
import GanttCustomer from "./GanttCustomer.jsx";


//data example




function GanttChart({data}) {

    const customers = [];

    data.customers.forEach(customer => {
        customers.push(<GanttCustomer customer={customer} />);
    });

    return (
        <div className="gantt-container">
            <table className="gantt-table">
                <GanttHeader weeks="8" />
                <tbody className="customers">
                    {customers}
                </tbody>
            </table>
        </div>
    )
}

export default GanttChart