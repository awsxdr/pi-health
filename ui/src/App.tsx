import './App.scss'
import { ConnectionsContextProvider, TickContextProvider } from '@contexts'
import { DashboardPage } from '@pages'

function App() {
  return (
    <>
      <ConnectionsContextProvider>
        <TickContextProvider>
          <DashboardPage />
        </TickContextProvider>
      </ConnectionsContextProvider>
    </>
  )
}

export default App
