import React, { useMemo } from 'react'
import { useTransactions } from '../contexts/TransactionContext'
import dayjs from 'dayjs'

export default function TransactionsList(){
  const { transactions, deleteTransaction } = useTransactions()

  const sorted = useMemo(() => transactions.slice().sort((a,b) => new Date(b.date) - new Date(a.date)), [transactions])

  return (
    <div className="transactions glass">
      <div className="tx-header">Transactions</div>
      <div className="tx-list">
        {sorted.map(tx => (
          <div className="tx" key={tx.id}>
            <div className="tx-left">
              <div className="tx-desc">{tx.description || tx.category}</div>
              <div className="tx-meta">{tx.category} • {dayjs(tx.date).format('MMM D, YYYY')}</div>
            </div>
            <div className="tx-right">
              <div className={`tx-amount ${tx.type === 'income' ? 'income' : 'expense'}`}>${Number(tx.amount).toFixed(2)}</div>
              <button className="btn small" onClick={() => deleteTransaction(tx.id)}>Delete</button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <div className="empty">No transactions yet — add your first one.</div>}
      </div>
    </div>
  )
}
