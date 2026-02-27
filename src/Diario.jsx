import { useState } from 'react'
import './Diario.css'
import { useProgresso } from './useProgresso'

const SLOTS = [
  { key: 'acordar', label: 'Ao acordar', icon: '🌅', description: 'Escovou ao acordar?' },
  { key: 'almoco', label: 'Após o almoço', icon: '🍽️', description: 'Escovou após o almoço?' },
  { key: 'dormir', label: 'Antes de dormir', icon: '🌙', description: 'Escovou antes de dormir?' },
]

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function Diario({ userId, onBack }) {
  const today = new Date()
  const dateKey = formatDateKey(today)

  const { checkedSlots, toggleSlot, loading } = useProgresso(userId)
  const [justChecked, setJustChecked] = useState(null)

  const todaySlots = checkedSlots[dateKey] || {}
  const completedCount = Object.values(todaySlots).filter(Boolean).length

  const handleToggle = (slotKey) => {
    toggleSlot(dateKey, slotKey)
    setJustChecked(slotKey)
    setTimeout(() => setJustChecked(null), 600)
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia! ☀️'
    if (hour < 18) return 'Boa tarde! 🌤️'
    return 'Boa noite! 🌙'
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-fairy">🧚‍♀️</div>
        <div className="loading-spinner"></div>
        <p className="loading-text">Carregando diário...</p>
      </div>
    )
  }

  return (
    <div className="diario">
      <header className="diario-header">
        <button className="back-btn" onClick={onBack}>
          ← Voltar
        </button>
        <h1 className="diario-title">📖 Diário</h1>
        <p className="diario-greeting">{greeting()}</p>
      </header>

      <div className="diario-date-card">
        <div className="date-icon">📅</div>
        <div className="date-info">
          <span className="date-weekday">{WEEKDAYS[today.getDay()]}</span>
          <span className="date-full">
            {today.getDate()} de {MONTHS[today.getMonth()]} de {today.getFullYear()}
          </span>
        </div>
      </div>

      <div className="diario-progress-bar">
        <div className="progress-label">
          <span>Escovações hoje</span>
          <span className="progress-count">{completedCount}/3</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${(completedCount / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="diario-slots">
        {SLOTS.map(slot => {
          const isChecked = todaySlots[slot.key] || false
          const isAnimating = justChecked === slot.key
          return (
            <button
              key={slot.key}
              className={`diario-slot ${isChecked ? 'slot-done' : ''} ${isAnimating ? 'slot-animate' : ''}`}
              onClick={() => handleToggle(slot.key)}
            >
              <div className="slot-left">
                <span className="slot-emoji">{slot.icon}</span>
                <div className="slot-text">
                  <span className="slot-name">{slot.label}</span>
                  <span className="slot-desc">{slot.description}</span>
                </div>
              </div>
              <div className="slot-toggle">
                {isChecked ? '✅' : '⬜'}
              </div>
            </button>
          )
        })}
      </div>

      {completedCount === 3 && (
        <div className="diario-congrats">
          <span className="congrats-icon">🧚‍♀️✨</span>
          <p className="congrats-text">
            Parabéns! A Fada do Dente está orgulhosa de você! 🦷💖
          </p>
        </div>
      )}

      {completedCount > 0 && completedCount < 3 && (
        <div className="diario-encouragement">
          <p>Continue assim! Faltam {3 - completedCount} escovação(ões) 💪</p>
        </div>
      )}
    </div>
  )
}

export default Diario
