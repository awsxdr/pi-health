import './App.css'
import { HealthGraph } from './components'
import { TickContextProvider } from './contexts'

function App() {
  return (
    <>
      <TickContextProvider>
        <HealthGraph />
      </TickContextProvider>
    </>
  )
}

export default App
