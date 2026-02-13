import { RouterProvider } from "react-router-dom"
import "./App.css"
import Header from "./Header.jsx"
import GanttChart from './ganttChart/GanttChart.jsx'
import {router} from "@zoplanner/router"
function App() {

    return(
        <>
        <RouterProvider router={router}/>
        </>
    )

    /*const weeks = 8;
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
    )*/
}

export default App