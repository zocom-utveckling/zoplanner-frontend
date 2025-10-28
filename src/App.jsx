import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
    const [number, setNumber] = useState("Klicka för att slumpa ett tal")

    //Slumpar ett tal mellan 0-x
    const randomNumber = (x) => {
        setNumber(Math.round(Math.random() * x))
    }

    return (
        <>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => randomNumber(100)}>
                    {number}
                </button>

            </div>
        </>
    )
}

export default App
