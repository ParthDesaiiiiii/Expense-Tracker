import React from 'react'
import { useTransactions } from '../../contexts/TransactionContext'
import { motion } from 'framer-motion'

function format(n) { return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) }

export default function BalanceCards() {
  const { transactions } = useTransactions()
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense
  const savings = Math.max(0, balance)

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
      <motion.div className="card glass" whileHover={{ y: -6 }}>
        <div className="card-title">Estimated Savings</div>
        <div className="card-value">{format(savings)}</div>
      </motion.div>
    </div>
  )
}
