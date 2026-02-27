import { useState } from 'react'
import { supabase } from './supabase'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!email || !password) {
      setError('Preencha email e senha')
      setLoading(false)
      return
    }

    // Tenta fazer login
    let { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // Se o usuário não existe ainda, cria a conta automaticamente
    if (signInError?.message?.includes('Invalid login credentials')) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError('Erro ao criar conta: ' + signUpError.message)
        setLoading(false)
        return
      }

      // Tenta login novamente após criar
      const { error: retryError } = await supabase.auth.signInWithPassword({
        email,
        password,
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
          Entre para acompanhar suas escovações ✨
        </p>

        <div className="login-tooth-decoration">
          <span className="line"></span>
          <span className="tooth">🦷</span>
          <span className="line"></span>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            className="login-input"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button className="btn-entrar" type="submit" disabled={loading}>
            {loading ? '⏳ Entrando...' : '🦷 Entrar'}
          </button>
        </form>

        {error && <p className="login-error">{error}</p>}

        <p className="login-info">
          🔒 Seus dados ficam seguros na nuvem
        </p>
      </div>
    </div>
  )
}

export default Login
