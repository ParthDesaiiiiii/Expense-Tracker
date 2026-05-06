import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTransactions } from './TransactionContext'
import { useBudgets } from './BudgetContext'

const AlertContext = createContext()
export function useAlerts(){ return useContext(AlertContext) }

function weekAgoDate(days=7){ const d = new Date(); d.setDate(d.getDate()-days); return d }

export function AlertProvider({ children }){
  const { transactions, monthlySummaries } = useTransactions()
  const { budgets } = useBudgets()
  const [alerts, setAlerts] = useState([])
  const [dismissed, setDismissed] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('et_alerts_dismissed_v1')||'[]') }catch(e){return []}
  })

  useEffect(() => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`

    const newAlerts = []

    // 1) Budget alerts for current month
    if (budgets && Object.keys(budgets).length > 0){
      const expensesThisMonth = {}
      transactions.filter(t => t.type === 'expense' && t.date && t.date.slice(0,7) === currentMonth)
        .forEach(t => { expensesThisMonth[t.category] = (expensesThisMonth[t.category]||0) + Number(t.amount||0) })
      Object.entries(budgets).forEach(([cat, limit]) => {
        const spent = expensesThisMonth[cat] || 0
        if (limit > 0 && spent > limit){
          newAlerts.push({ id: `budget-${currentMonth}-${cat}`, type:'budget', title:`Exceeded budget: ${cat}`, message:`You spent $${spent.toFixed(2)} on ${cat} this month (budget $${limit}).`, severity:'high' })
        }
      })
    }

    // 2) Weekly spending spike: compare last 7 days vs previous 7 days
    const end = new Date()
    const start = weekAgoDate(7)
    const prevStart = weekAgoDate(14)
    const prevEnd = weekAgoDate(7)
    const toNumber = v => Number(v||0)
    const inRange = (d, a, b) => (d >= a && d < b)
    const last7 = transactions.filter(t => t.type === 'expense' && t.date && inRange(new Date(t.date), start, end)).reduce((s,t)=>s+toNumber(t.amount),0)
    const prev7 = transactions.filter(t => t.type === 'expense' && t.date && inRange(new Date(t.date), prevStart, prevEnd)).reduce((s,t)=>s+toNumber(t.amount),0)
    if (prev7 > 0){
      const pct = Math.round(((last7 - prev7)/prev7)*100)
      if (pct > 20 && last7 > 20){
        newAlerts.push({ id: `weekly-spike-${start.toISOString().slice(0,10)}`, type:'trend', title:'High spending detected this week', message:`Your expenses this week rose ${pct}% vs the previous week.`, severity:'medium' })
      }
    }

    // 3) Low savings warning for current month
    const msum = monthlySummaries && monthlySummaries[currentMonth]
    if (msum){
      const income = Number(msum.income||0)
      const savings = Number(msum.savings||0)
      const ratio = income > 0 ? Math.round((savings / income) * 100) : 0
      if (ratio < 15){
        newAlerts.push({ id: `low-savings-${currentMonth}`, type:'savings', title:'Low savings warning', message:`You're saving only ${ratio}% this month. Aim for 20–30%.`, severity:'high' })
      }
    }

    // Filter out dismissed alerts
    const visible = newAlerts.filter(a => !dismissed.includes(a.id))
    setAlerts(visible)
  }, [transactions, budgets, monthlySummaries, dismissed])

  function dismissAlert(id){
    setDismissed(s => { const next = [...s, id]; try{ localStorage.setItem('et_alerts_dismissed_v1', JSON.stringify(next)) }catch(e){}; return next })
    setAlerts(a => a.filter(x => x.id !== id))
  }

  return (
    <AlertContext.Provider value={{ alerts, dismissAlert }}>{children}</AlertContext.Provider>
  )
}

export default AlertContext
