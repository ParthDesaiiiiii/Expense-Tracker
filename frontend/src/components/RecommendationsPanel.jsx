import React, { useMemo, useState } from 'react'
import { useTransactions } from '../contexts/TransactionContext'
import { getRecommendations } from '../utils/api'

export default function RecommendationsPanel(){
  const { transactions } = useTransactions()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const summary = useMemo(() => {
    const income = transactions.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0)
    const expense = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
    const savings = Math.max(0, income - expense)
    const catMap = {}
    transactions.forEach(t=>{catMap[t.category]= (catMap[t.category]||0)+Number(t.amount)})
    const topCategories = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x[0])
    return { income, expense, savings, topCategories }
  }, [transactions])

  async function ask(){
    setLoading(true)
    const res = await getRecommendations(summary)
    setResult(res)
    setLoading(false)
  }

  return (
    <div className="recommendations glass">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3>Recommendations</h3>
        <button className="btn" onClick={ask}>{loading? 'Loading...' : 'Get Suggestions'}</button>
      </div>
      {result && (
        <div className="rec-list">
          {result.suggestions?.map((s,i) => (
            <div className="rec" key={i}><strong>{s.type.toUpperCase()}</strong>: {s.message}</div>
          ))}
        </div>
      )}
      {!result && <div className="empty">Click "Get Suggestions" to call the recommendations API.</div>}
    </div>
  )
}
