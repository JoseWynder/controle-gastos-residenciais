import './App.css'
import { PessoasList } from './components/PessoasList'

function App() {
  return (
    <main className="app-shell">
      <section className="intro" aria-labelledby="app-title">
        <p className="eyebrow">Pessoas</p>
        <h1 id="app-title">Controle de Gastos Residenciais</h1>
        <p className="support">Listagem de pessoas cadastradas na API.</p>
      </section>

      <section className="people-section" aria-labelledby="people-title">
        <h2 id="people-title">Pessoas cadastradas</h2>
        <PessoasList />
      </section>
    </main>
  )
}

export default App