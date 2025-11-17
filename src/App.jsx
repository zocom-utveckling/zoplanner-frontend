import "./App.css"
import Header from "./Header.jsx"
import GanttChart from './ganttChart/GanttChart.jsx'

const data = {
    weeks: {
        start: 36,
        end: 38
    },
    customers: [
        {
            id: 1001,
            name: "Jensen yrkeshögskola Malmö",
            city: "Malmö",
            classes: [
                {
                    id: 1001,
                    name: "SYTEST24",
                    assignments: [
                        {
                            id: 1003,
                            name: "Självledarskap grund",
                            consultant: {
                                id: 1001,
                                name: "Sven Svensson",
                                city: "Malmö"
                            }
                        }
                    ]
                },
                {
                    id: 1002,
                    name: "SYSÄK24",
                    assignments: [
                        {
                            id: 1002,
                            name: "Programmering C# grund",
                            consultant: {
                                id: 1002,
                                name: "Eric Eriksson",
                                city: "Åkarp"
                            }
                        }
                    ]
                }
            ]
        }
    ]
};

function App() {
    return (
        <div className="container">
            <Header />
            <main>
                <div className="content-header">
                    <h1 className="title">Översikt</h1>
                </div>
                <GanttChart data={data}/>
            </main>
        </div>
    )
}

export default App