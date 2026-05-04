import React from 'react'
import { useSavingsGoals } from '../contexts/SavingsGoalContext'
import { useTransactions } from '../contexts/TransactionContext'

function pct(part, total){ if (total <= 0) return 0; return Math.min(100, Math.round((part/total)*100)) }

export default function SavingsGoalCard(){
  const { goals, deleteGoal } = useSavingsGoals()
  const { transactions } = useTransactions()

  // compute total savings available (simple: sum of positive balance across months)
  const totalSaved = Math.max(0, transactions.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0) - transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0))

  return (
    <div className="goals card glass" style={{padding:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div className="card-title">Savings Goals</div>
      </div>
      {goals.length === 0 && <div className="empty" style={{padding:12}}>No goals yet. Set a goal in the sidebar.</div>}
      {goals.map(g => {
        const progress = Math.min(g.target ? ( (g.saved||0) / g.target) * 100 : 0, 100)
        const remaining = Math.max(0, (g.target||0) - (g.saved||0) - totalSaved)
        // estimate months remaining if user saves avg monthly (use simple heuristic)
        const monthlySavings = Math.max(1, Math.round(totalSaved / Math.max(1, new Date().getMonth()+1)))
        const months = Math.ceil(remaining / Math.max(1, monthlySavings))
        return (
          <div key={g.id} style={{marginTop:12}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div style={{fontWeight:700}}>{g.title}</div>
              <div style={{fontWeight:700}}>${(g.saved||0) + totalSaved} / ${g.target}</div>
            </div>
            <div className="progress" style={{height:10,background:'rgba(255,255,255,0.06)',borderRadius:8,overflow:'hidden',marginTop:8}}>
              <div style={{width:`${pct((g.saved||0)+totalSaved, g.target)}%`,height:'100%',background:'linear-gradient(90deg,#4f46e5,#06b6d4)'}} />
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--muted)',marginTop:8}}>
              <div>Remaining: ${remaining.toFixed(2)}</div>
              <div>Est: {months} month(s)</div>
            </div>
            <div style={{display:'flex',gap:8,marginTop:8}}>
              <button className="btn small" onClick={() => deleteGoal(g.id)}>Remove</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
