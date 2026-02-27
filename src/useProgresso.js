import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export function useProgresso(userId) {
  const [checkedSlots, setCheckedSlots] = useState({})
  const [loading, setLoading] = useState(!!userId)

  // Carregar dados do Supabase
  useEffect(() => {
    if (!userId) return

    async function fetchData() {
      const { data, error } = await supabase
        .from('progresso')
        .select('date_key, slot_key, checked')
        .eq('user_id', userId)

      if (error) {
        console.error('Erro ao carregar progresso:', error)
        setLoading(false)
        return
      }

      // Transforma array de registros em objeto { dateKey: { slotKey: true } }
      const slots = {}
      for (const row of data) {
        if (!slots[row.date_key]) slots[row.date_key] = {}
        slots[row.date_key][row.slot_key] = row.checked
      }
      setCheckedSlots(slots)
      setLoading(false)
    }

    fetchData()
  }, [userId])

  // Toggle um slot (marcar/desmarcar)
  const toggleSlot = useCallback(async (dateKey, slotKey) => {
    if (!userId) return

    const currentValue = checkedSlots[dateKey]?.[slotKey] || false
    const newValue = !currentValue

    // Atualiza estado local imediatamente (otimista)
    setCheckedSlots(prev => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || {}),
        [slotKey]: newValue
      }
    }))

    // Salva no Supabase via upsert
    const { error } = await supabase
      .from('progresso')
      .upsert(
        {
          user_id: userId,
          date_key: dateKey,
          slot_key: slotKey,
          checked: newValue,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id,date_key,slot_key' }
      )

    if (error) {
      console.error('Erro ao salvar progresso:', error)
      // Reverte em caso de erro
      setCheckedSlots(prev => ({
        ...prev,
        [dateKey]: {
          ...(prev[dateKey] || {}),
          [slotKey]: currentValue
        }
      }))
    }
  }, [userId, checkedSlots])

  return { checkedSlots, toggleSlot, loading }
}
