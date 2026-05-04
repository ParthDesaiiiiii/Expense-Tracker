import React from 'react'
import { useTransactions } from '../../contexts/TransactionContext'
import { useBudgets } from '../../contexts/BudgetContext'
import { motion } from 'framer-motion'

function format(n) { return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) }

export default function BalanceCards() {
  const { transactions, monthFilter, monthlySummaries } = useTransactions()
  const { budgets } = useBudgets()

  const filtered = monthFilter === 'all' ? transactions : transactions.filter(t => t.date && t.date.slice(0,7) === monthFilter)

  const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense
  const savings = Math.max(0, balance)
  const savingPct = income > 0 ? Math.round((savings / income) * 100) : 0
  // derive this month and last month keys
  const allMonths = Object.keys(monthlySummaries || {}).sort().reverse()
  const currentKey = monthFilter === 'all' ? (allMonths[0] || null) : monthFilter
  const idx = allMonths.indexOf(currentKey)
  const lastKey = idx >= 0 && idx + 1 < allMonths.length ? allMonths[idx+1] : null
  const thisMonth = currentKey ? (monthlySummaries[currentKey] || {income:0,expense:0,savings:0}) : null
  const lastMonth = lastKey ? (monthlySummaries[lastKey] || {income:0,expense:0,savings:0}) : null

  return (
    <div className="balance-cards">
      <motion.div className="card glass" whileHover={{ y: -6 }}>
        <div className="card-title">Balance</div>
        <div className="card-value">{format(balance)}</div>
      </motion.div>
      <motion.div className="card glass" whileHover={{ y: -6 }}>
        <div className="card-title">Income</div>
        <div className="card-value income">{format(income)}</div>
      </motion.div>
      <motion.div className="card glass" whileHover={{ y: -6 }}>
        <div className="card-title">Expenses</div>
        <div className="card-value expense">{format(expense)}</div>
      </motion.div>
      <motion.div className="card glass" whileHover={{ y: -6 }} style={{flexDirection:'column'}}>
        <div className="card-title">Estimated Savings</div>
        <div className="card-value">{format(savings)} <span style={{fontSize:12, color:'var(--muted)', marginLeft:8}}>{savingPct}%</span></div>
        <div style={{marginTop:12,fontSize:13,color:'var(--muted)'}}>
          {Object.keys(budgets).length === 0 ? 'No budgets set' : 'Budgets: '}
          {Object.entries(budgets).slice(0,3).map(([k,v]) => (
            <div key={k} style={{fontSize:12,color:'var(--muted)'}}>{k}: ${v}</div>
          ))}
        </div>
        {thisMonth && lastMonth && (
          <div style={{marginTop:12,fontSize:13}}>
            <div style={{fontSize:12,color:'var(--muted)'}}>This month vs Last</div>
            <div style={{display:'flex',gap:12,marginTop:8}}>
              <div>
                <div style={{fontSize:12,color:'var(--muted)'}}>Income</div>
                <div style={{fontWeight:700}}>${thisMonth.income.toFixed(2)}</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>Last: ${lastMonth.income.toFixed(2)}</div>
              </div>
              <div>
                <div style={{fontSize:12,color:'var(--muted)'}}>Expense</div>
                <div style={{fontWeight:700}}>${thisMonth.expense.toFixed(2)}</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>Last: ${lastMonth.expense.toFixed(2)}</div>
              </div>
              <div>
                <div style={{fontSize:12,color:'var(--muted)'}}>Savings</div>
                <div style={{fontWeight:700}}>${thisMonth.savings.toFixed(2)}</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>Last: ${lastMonth.savings.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
