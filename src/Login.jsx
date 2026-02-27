import { useState } from 'react'
import { supabase } from './supabase'
import './Login.css'

const FIXED_EMAIL = import.meta.env.VITE_APP_EMAIL
const FIXED_PASSWORD = import.meta.env.VITE_APP_PASSWORD

function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    // Tenta fazer login
    let { error: signInError } = await supabase.auth.signInWithPassword({
      email: FIXED_EMAIL,
      password: FIXED_PASSWORD,
    })

    // Se o usuário não existe ainda, cria a conta automaticamente
    if (signInError?.message?.includes('Invalid login credentials')) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: FIXED_EMAIL,
        password: FIXED_PASSWORD,
      })

      if (signUpError) {
        setError('Erro ao criar conta: ' + signUpError.message)
        setLoading(false)
        return
      }

      // Tenta login novamente após criar
      const { error: retryError } = await supabase.auth.signInWithPassword({
        email: FIXED_EMAIL,
        password: FIXED_PASSWORD,
      })

      if (retryError) {
        setError('Erro ao entrar: ' + retryError.message)
        setLoading(false)
        return
      }
    } else if (signInError) {
      setError('Erro ao entrar: ' + signInError.message)
      setLoading(false)
      return
    }

    setLoading(false)
  }

  return (
    <div className="login">
      <div className="login-card">
        <div className="login-fairy">🧚‍♀️</div>
        <h1 className="login-title">Fada do Dente</h1>
        <p className="login-subtitle">
          Toque no botão para entrar e acompanhar suas escovações ✨
        </p>

        <div className="login-tooth-decoration">
          <span className="line"></span>
          <span className="tooth">🦷</span>
          <span className="line"></span>
        </div>

        <button className="btn-entrar" onClick={handleLogin} disabled={loading}>
          {loading ? '⏳ Entrando...' : '🦷 Entrar'}
        </button>

        {error && <p className="login-error">{error}</p>}

        <p className="login-info">
          🔒 Seus dados ficam seguros na nuvem
        </p>
      </div>
    </div>
  )
}

export default Login
