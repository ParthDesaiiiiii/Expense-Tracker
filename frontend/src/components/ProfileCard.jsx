import React, { useMemo } from 'react'
import { useTransactions } from '../contexts/TransactionContext'

function computeIncomeLevel(avgMonthlyIncome){
  if (avgMonthlyIncome >= 5000) return { label: 'High', color: '#10b981' }
  if (avgMonthlyIncome >= 2000) return { label: 'Medium', color: '#f59e0b' }
  return { label: 'Low', color: '#ef4444' }
}

function computeSpendingScore(expense, income){
  if (income <= 0) return 40
  const ratio = expense / income // >0
  // baseline: ratio 0.5 -> score 75, ratio 1.0 -> score 50, ratio 2.0 -> score 20
  let score = Math.round(100 - Math.min(80, (ratio - 0.2) * 60))
  score = Math.max(0, Math.min(100, score))
  return score
}

export default function ProfileCard(){
  const { transactions } = useTransactions()

  const stats = useMemo(() => {
    // compute monthly totals
    const map = {}
    transactions.forEach(t => {
      const m = t.date ? t.date.slice(0,7) : 'unknown'
      if (!map[m]) map[m] = { income:0, expense:0 }
      if (t.type === 'income') map[m].income += Number(t.amount||0)
      else map[m].expense += Number(t.amount||0)
    })
    const months = Object.keys(map).sort()
    const totalIncome = months.reduce((s,m)=>s + (map[m].income||0), 0)
    const totalExpense = months.reduce((s,m)=>s + (map[m].expense||0), 0)
    const avgMonthlyIncome = months.length ? (totalIncome / months.length) : 0
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0
    const spendingScore = computeSpendingScore(totalExpense / Math.max(1, months.length), avgMonthlyIncome)
    return { monthsCount: months.length, totalIncome, totalExpense, avgMonthlyIncome, savingsRate, spendingScore }
  }, [transactions])

  const incomeLevel = computeIncomeLevel(stats.avgMonthlyIncome)

  return (
    <div className="card glass" style={{padding:16,minWidth:260}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontWeight:700}}>Profile</div>
        <div style={{fontSize:12,color:'var(--muted)'}}>Financial Summary</div>
      </div>
      <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:8}}>
        <div>
          <div style={{fontSize:12,color:'var(--muted)'}}>Income level</div>
          <div style={{fontWeight:700,color:incomeLevel.color}}>{incomeLevel.label} — ${Math.round(stats.avgMonthlyIncome)}</div>
        </div>

        <div>
          <div style={{fontSize:12,color:'var(--muted)'}}>Savings rate</div>
          <div style={{fontWeight:700}}>{stats.savingsRate}%</div>
        </div>

        <div>
          <div style={{fontSize:12,color:'var(--muted)'}}>Spending score</div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{fontWeight:700}}>{stats.spendingScore}/100</div>
            <div style={{flex:1,height:10,background:'rgba(255,255,255,0.04)',borderRadius:6,overflow:'hidden'}}>
              <div style={{height:'100%',width:stats.spendingScore + '%',background: stats.spendingScore>70? '#10b981' : (stats.spendingScore>40 ? '#f59e0b' : '#ef4444')}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
