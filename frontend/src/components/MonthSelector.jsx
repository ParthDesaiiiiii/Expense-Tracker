import React from 'react'
import { useTransactions } from '../contexts/TransactionContext'

function pretty(m){
  if (m === 'all') return 'All Months'
  const [y,mm] = m.split('-')
  const d = new Date(Number(y), Number(mm)-1, 1)
  return d.toLocaleString(undefined, { month: 'short', year: 'numeric' })
}

export default function MonthSelector(){
  const { transactions, monthFilter, setMonthFilter } = useTransactions()
  const months = React.useMemo(() => {
    const s = new Set()
    transactions.forEach(t => { if (t.date) s.add(t.date.slice(0,7)) })
    return ['all', ...Array.from(s).sort().reverse()]
  }, [transactions])

  return (
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <label style={{color:'var(--muted)'}}>Month</label>
      <select value={monthFilter} onChange={e=>setMonthFilter(e.target.value)} style={{padding:8,borderRadius:8,background:'transparent'}}>
        {months.map(m => <option key={m} value={m}>{pretty(m)}</option>)}
      </select>
    </div>
  )
}
