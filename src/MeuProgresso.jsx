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

function generateDays(startDate, weeks) {
  const days = []
  const start = new Date(startDate)
  const dayOfWeek = start.getDay()
  start.setDate(start.getDate() - dayOfWeek)

  const totalDays = weeks * 7
  for (let i = 0; i < totalDays; i++) {
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
  const days = generateDays(today, 4)

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

  // Split days into weeks
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const endDate = new Date(today)
  endDate.setDate(today.getDate() + 27) // 4 weeks

  const isInRange = (date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    const start = new Date(today)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)
    return d >= start && d <= end
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
            {week.map((date) => {
              const dateKey = formatDateKey(date)
              const count = getCompletionCount(dateKey)
              const inRange = isInRange(date)
              const todayClass = isToday(date) ? 'is-today' : ''
              const outOfRange = !inRange ? 'out-of-range' : ''
              const completionClass = inRange
                ? count === 3
                  ? 'complete'
                  : count > 0
                    ? 'partial'
                    : ''
                : ''

              return (
                <button
                  key={dateKey}
                  className={`calendar-day ${todayClass} ${outOfRange} ${completionClass}`}
                  onClick={() => inRange && setSelectedDay(selectedDay === dateKey ? null : dateKey)}
                  disabled={!inRange}
                >
                  <span className="day-number">{date.getDate()}</span>
                  {inRange && (
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
