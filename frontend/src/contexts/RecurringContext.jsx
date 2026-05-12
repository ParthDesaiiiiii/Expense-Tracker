import React, { createContext, useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useTransactions } from './TransactionContext'

const STORAGE_KEY = 'et_recurring_v1'
const RecurringContext = createContext()
export function useRecurrings(){ return useContext(RecurringContext) }

function monthKey(d = new Date()){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` }
function daysInMonth(year, month){ return new Date(year, month, 0).getDate() }

export function RecurringProvider({ children }){
  const { addTransaction } = useTransactions()
  const [recurrings, setRecurrings] = useState(() => {
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }catch(e){ return [] }
  })

  useEffect(() => {
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(recurrings)) }catch(e){}
  }, [recurrings])

  // On mount, apply any recurrences that haven't been applied for the current month
  useEffect(() => {
    if (!recurrings || recurrings.length === 0) return
    const mk = monthKey()
    (async () => {
      const toUpdate = []
      for (const r of recurrings){
        try{
          if (r.lastApplied === mk) continue
          if (!r.frequency || r.frequency !== 'monthly') continue
          // determine day
          const today = new Date()
          const year = today.getFullYear()
          const month = today.getMonth() + 1
          const desiredDay = r.startDay || (new Date(r.startDate || Date.now())).getDate() || today.getDate()
          const dim = daysInMonth(year, month)
          const day = Math.min(desiredDay, dim)
          const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          // create transaction
          const tx = { type: r.type || 'expense', amount: Number(r.amount || 0), category: r.category || 'Other', description: r.name || '', date: dateStr }
          await addTransaction(tx)
          toUpdate.push(r.id)
        }catch(e){ console.error('recurring apply failed', e) }
      }
      if (toUpdate.length > 0){
        setRecurrings(prev => prev.map(r => toUpdate.includes(r.id) ? { ...r, lastApplied: monthKey() } : r))
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addRecurring(payload){
    const r = { id: uuidv4(), name: payload.name||payload.description||'Recurring', type: payload.type||'expense', amount: Number(payload.amount||0), category: payload.category||'Other', frequency: payload.frequency||'monthly', startDate: payload.startDate||new Date().toISOString().slice(0,10), startDay: payload.startDay || null, lastApplied: payload.lastApplied || null }
    setRecurrings(s => [r, ...s])
    return r
  }

  function updateRecurring(id, patch){ setRecurrings(s => s.map(r => r.id === id ? { ...r, ...patch } : r)) }
  function deleteRecurring(id){ setRecurrings(s => s.filter(r => r.id !== id)) }

  return (
    <RecurringContext.Provider value={{ recurrings, addRecurring, updateRecurring, deleteRecurring }}>{children}</RecurringContext.Provider>
  )
}

export default RecurringContext
