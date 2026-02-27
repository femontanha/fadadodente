import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabase'
import Login from './Login'
import MeuProgresso from './MeuProgresso'
import Diario from './Diario'

function App() {
  const [screen, setScreen] = useState('home')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verifica sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setScreen('home')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-fairy">🧚‍♀️</div>
        <div className="loading-spinner"></div>
        <p className="loading-text">Carregando...</p>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  if (screen === 'progresso') {
    return <MeuProgresso userId={user.id} onBack={() => setScreen('home')} />
  }

  if (screen === 'diario') {
    return <Diario userId={user.id} onBack={() => setScreen('home')} />
  }

  return (
    <div className="app">
      <div className="fairy-icon">🧚‍♀️</div>
      <h1 className="title">Fada do Dente</h1>
      <p className="subtitle">Olá Maitê ✨</p>

      <div className="tooth-decoration">
        <span className="line"></span>
        <span className="tooth">🦷</span>
        <span className="line"></span>
      </div>

      <div className="buttons-container">
        <button className="btn btn-diario" onClick={() => setScreen('diario')}>
          <span className="btn-icon">📖</span>
          Diário
        </button>

        <button className="btn btn-progresso" onClick={() => setScreen('progresso')}>
          <span className="btn-icon">📊</span>
          Meu Progresso
        </button>
      </div>

      <div className="stars-footer">⭐ ⭐ ⭐</div>

      <button className="logout-btn" onClick={handleLogout}>
        Sair
      </button>
    </div>
  )
}

export default App
