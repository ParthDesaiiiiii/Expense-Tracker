import React, { useMemo, useState } from 'react'
import { useTransactions } from '../contexts/TransactionContext'
import { getRecommendations } from '../utils/api'

const ICONS = {
  savings: '💰', investment: '📈', travel: '✈️', insight: '💡', optimization: '⚙️', challenge: '🏁', trend: '📊', category: '🗂️'
}

export default function RecommendationsPanel(){
  const { transactions, monthlySummaries } = useTransactions()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const summary = useMemo(() => {
    const income = transactions.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0)
    const expense = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
    const savings = Math.max(0, income - expense)
    const catMap = {}
    transactions.forEach(t=>{ if (t.type==='expense') catMap[t.category]= (catMap[t.category]||0)+Number(t.amount) })
    const topCategories = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x[0])
    return { income, expense, savings, topCategories }
  }, [transactions])

  async function ask(){
    setLoading(true)
    try{
      const res = await getRecommendations({ transactions, monthlySummaries, ...summary })
      setResult(res)
    }catch(e){ console.error(e); setResult({ error:e.message }) }
    setLoading(false)
  }

  return (
    <div className="recommendations glass">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3>Recommendations</h3>
        <button className="btn" onClick={ask}>{loading? 'Loading...' : 'Get Suggestions'}</button>
      </div>
      {result && result.suggestions && (
        <div className="rec-list">
          {result.suggestions.map((s,i) => (
            <div className="rec" key={i}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{fontSize:20}}>{ICONS[s.type] || '🔔'}</div>
                <div>
                  <div style={{fontWeight:700}}>{s.type.replace(/^[a-z]/,c=>c.toUpperCase())}</div>
                  <div style={{color:'var(--muted)'}}>{s.message}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {result && result.error && <div className="empty">Error: {result.error}</div>}
      {!result && <div className="empty">Click "Get Suggestions" to call the recommendations API.</div>}
    </div>
  )
}
