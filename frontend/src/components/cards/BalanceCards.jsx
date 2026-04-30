import React from 'react'
import { useTransactions } from '../../contexts/TransactionContext'
import { useBudgets } from '../../contexts/BudgetContext'
import { motion } from 'framer-motion'

function format(n) { return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) }

export default function BalanceCards() {
  const { transactions } = useTransactions()
  const { monthFilter } = useTransactions()
  const { budgets } = useBudgets()

  const filtered = monthFilter === 'all' ? transactions : transactions.filter(t => t.date && t.date.slice(0,7) === monthFilter)

  const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense
  const savings = Math.max(0, balance)
  const savingPct = income > 0 ? Math.round((savings / income) * 100) : 0

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
      </motion.div>
    </div>
  )
}
