import { Calculator } from './Calculator'

function App() {
  return (
    <main className="app">
      <div className="window">
        <header className="titlebar">
          <h1>calculator.exe</h1>
          <div className="titlebar-controls" aria-hidden="true">
            <span>_</span>
            <span>□</span>
            <span>×</span>
          </div>
        </header>
        <Calculator />
      </div>
    </main>
  )
}

export default App