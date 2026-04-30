import React, { useMemo } from 'react'
import { useTransactions } from '../contexts/TransactionContext'
import dayjs from 'dayjs'

export default function TransactionsList(){
  const { transactions, deleteTransaction, monthFilter, setMonthFilter } = useTransactions()

  const months = useMemo(() => {
    const s = new Set()
    transactions.forEach(t => { if (t.date) s.add(t.date.slice(0,7)) })
    return ['all', ...Array.from(s).sort().reverse()]
  }, [transactions])

  const sorted = useMemo(() => {
    const list = monthFilter === 'all' ? transactions : transactions.filter(t => t.date && t.date.slice(0,7) === monthFilter)
    return list.slice().sort((a,b) => new Date(b.date) - new Date(a.date))
  }, [transactions, monthFilter])

  return (
    <div className="transactions glass">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div className="tx-header">Transactions</div>
        <select value={monthFilter} onChange={e=>setMonthFilter(e.target.value)} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.04)',padding:8,borderRadius:8}}>
          {months.map(m => <option key={m} value={m}>{m === 'all' ? 'All Months' : m}</option>)}
        </select>
      </div>
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
