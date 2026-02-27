import { useState } from 'react'
import './MeuProgresso.css'
import { useProgresso } from './useProgresso'

const SLOTS = [
  { key: 'acordar', label: 'Ao acordar', icon: '🌅' },
  { key: 'almoco', label: 'Após o almoço', icon: '🍽️' },
  { key: 'dormir', label: 'Antes de dormir', icon: '🌙' },
]

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function generateDays(startDate) {
  const days = []
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)

  // 28 dias a partir de hoje
  for (let i = 0; i < 28; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    days.push(date)
  }

  return days
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function MeuProgresso({ userId, onBack }) {
  const today = new Date()
  const days = generateDays(today)

  const { checkedSlots, loading } = useProgresso(userId)

  const [selectedDay, setSelectedDay] = useState(null)

  const getCompletionCount = (dateKey) => {
    const daySlots = checkedSlots[dateKey] || {}
    return Object.values(daySlots).filter(Boolean).length
  }

  const isToday = (date) => {
    return formatDateKey(date) === formatDateKey(today)
  }

  // Get the month(s) displayed
  const firstDay = days[0]
  const lastDay = days[days.length - 1]
  const monthLabel = firstDay.getMonth() === lastDay.getMonth()
    ? `${MONTHS[firstDay.getMonth()]} ${firstDay.getFullYear()}`
    : `${MONTHS[firstDay.getMonth()]} - ${MONTHS[lastDay.getMonth()]} ${lastDay.getFullYear()}`

  // Count how many of the 28 days are fully complete (3/3 slots)
  const completedDays = days.filter(date => {
    const dateKey = formatDateKey(date)
    return getCompletionCount(dateKey) === 3
  }).length
  const remaining = 28 - completedDays
  const progressPercent = Math.round((completedDays / 28) * 100)
  const goalReached = completedDays === 28

  // Split days into calendar weeks (aligned to weekdays)
  const weeks = []
  const startDow = days[0].getDay() // 0=Dom, 1=Seg, ...
  // First week: pad with nulls so day lands on the correct column
  const firstWeek = [...Array(startDow).fill(null), ...days.slice(0, 7 - startDow)]
  weeks.push(firstWeek)
  // Remaining days in chunks of 7
  let idx = 7 - startDow
  while (idx < days.length) {
    weeks.push(days.slice(idx, idx + 7))
    idx += 7
  }


  return (
    <div className="progresso">
      {loading ? (
        <div className="loading-screen">
          <div className="loading-fairy">🧚‍♀️</div>
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando progresso...</p>
        </div>
      ) : (
      <>
      <header className="progresso-header">
        <button className="back-btn" onClick={onBack}>
          ← Voltar
        </button>
        <h1 className="progresso-title">📊 Meu Progresso</h1>
        <p className="progresso-subtitle">Acompanhe suas escovações 🦷</p>
      </header>

      <div className="calendar-container">
        <div className="calendar-month-label">{monthLabel}</div>

        <div className="calendar-weekdays">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="weekday-label">{day}</div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="calendar-week">
            {week.map((date, di) => {
              if (!date) {
                return <div key={`empty-${di}`} className="calendar-day empty" />
              }
              const dateKey = formatDateKey(date)
              const count = getCompletionCount(dateKey)
              const todayClass = isToday(date) ? 'is-today' : ''
              const completionClass = count === 3
                ? 'complete'
                : count > 0
                  ? 'partial'
                  : ''

              return (
                <button
                  key={dateKey}
                  className={`calendar-day ${todayClass} ${completionClass}`}
                  onClick={() => setSelectedDay(selectedDay === dateKey ? null : dateKey)}
                >
                  <span className="day-number">{date.getDate()}</span>
                  {count === 3 ? (
                    <span className="day-star">⭐</span>
                  ) : (
                    <div className="day-dots">
                      {SLOTS.map(slot => (
                        <span
                          key={slot.key}
                          className={`dot ${checkedSlots[dateKey]?.[slot.key] ? 'dot-checked' : ''}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className={`countdown-container ${goalReached ? 'goal-reached' : ''}`}>
        {goalReached ? (
          <>
            <div className="countdown-icon gift-open">🎁</div>
            <h3 className="countdown-title">Parabéns, Maitê! 🎉</h3>
            <p className="countdown-text">Você completou os 28 dias!</p>
            <p className="countdown-text">Você ganhou seu presente! 🧚‍♀️✨</p>
            <div className="confetti">
              <span>🎊</span><span>⭐</span><span>🦷</span><span>✨</span><span>🎊</span>
            </div>
          </>
        ) : (
          <>
            <div className="countdown-icon">{remaining <= 7 ? '🎁' : '🎁'}</div>
            <h3 className="countdown-title">Contagem para o Presente!</h3>
            <div className="countdown-progress-bar">
              <div
                className="countdown-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="countdown-stats">
              <span className="countdown-done">⭐ {completedDays}</span>
              <span className="countdown-separator">/</span>
              <span className="countdown-total">28 dias</span>
            </div>
            <p className="countdown-remaining">
              {remaining === 1
                ? 'Falta só 1 dia! 🤩'
                : remaining <= 7
                  ? `Faltam apenas ${remaining} dias! Quase lá! 🌟`
                  : `Faltam ${remaining} dias para ganhar o presente 🎁`}
            </p>
          </>
        )}
      </div>

      {selectedDay && (
        <div className="day-detail">
          <h3 className="day-detail-title">
            🦷 {new Date(selectedDay + 'T12:00:00').getDate()} de{' '}
            {MONTHS[new Date(selectedDay + 'T12:00:00').getMonth()]}
          </h3>
          <div className="slots-list">
            {SLOTS.map(slot => {
              const isChecked = checkedSlots[selectedDay]?.[slot.key] || false
              return (
                <div
                  key={slot.key}
                  className={`slot-item slot-readonly ${isChecked ? 'slot-checked' : ''}`}
                >
                  <span className="slot-icon">{slot.icon}</span>
                  <span className="slot-label">{slot.label}</span>
                  <span className="slot-check">{isChecked ? '✅' : '⬜'}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="legend">
        <div className="legend-item">
          <span className="legend-dot legend-dot-empty"></span>
          <span>Nenhuma</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-dot-partial"></span>
          <span>Parcial</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-dot-complete"></span>
          <span>Completo</span>
        </div>
      </div>
      </>
      )}
    </div>
  )
}

export default MeuProgresso
