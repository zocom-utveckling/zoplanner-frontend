import "./App.css"
import Header from "./Header.jsx"
import GanttChart from './ganttChart/GanttChart.jsx'

function App() {

    const weeks = 8;
    return (
        <div className="container">
            <Header />
            <main>
                <div className="content-header">
                    <h1 className="title">Översikt</h1>
                </div>
                <GanttChart weeks={weeks}/>
            </main>
        </div>
    )
}

export default App