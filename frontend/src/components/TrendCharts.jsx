import React, { useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, AreaChart, Area, CartesianGrid, BarChart, Bar } from 'recharts'
import { useTransactions } from '../contexts/TransactionContext'

function prettyMonth(m){
  // m is YYYY-MM
  const [y, mm] = m.split('-')
  try{ return new Date(Number(y), Number(mm)-1, 1).toLocaleString(undefined, { month: 'short', year: 'numeric' }) }catch(e){ return m }
}

export default function TrendCharts(){
  const { transactions, monthlySummaries } = useTransactions()

  const { months, series, categorySeries } = useMemo(() => {
    const monthsSet = new Set()
    // gather months from monthlySummaries and transactions
    if (monthlySummaries) Object.keys(monthlySummaries).forEach(m=>monthsSet.add(m))
    transactions.forEach(t => { if (t.date && t.date.length>=7) monthsSet.add(t.date.slice(0,7)) })
    const months = Array.from(monthsSet).sort()

    const series = months.map(m => ({
      month: m,
      expense: monthlySummaries && monthlySummaries[m] ? Number(monthlySummaries[m].expense||0) : transactions.filter(t=>t.type==='expense' && t.date && t.date.slice(0,7)===m).reduce((s,t)=>s+Number(t.amount||0),0),
      income: monthlySummaries && monthlySummaries[m] ? Number(monthlySummaries[m].income||0) : transactions.filter(t=>t.type==='income' && t.date && t.date.slice(0,7)===m).reduce((s,t)=>s+Number(t.amount||0),0),
      savings: monthlySummaries && monthlySummaries[m] ? Number(monthlySummaries[m].savings||0) : 0
    }))

    // determine top categories by total across timeframe
    const catTotals = {}
    transactions.forEach(t => { const c = t.category || 'Other'; catTotals[c] = (catTotals[c]||0) + (t.type === 'expense' ? Number(t.amount||0) : 0) })
    const topCats = Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x[0])

    const categorySeries = months.map(m => {
      const row = { month: m }
      topCats.forEach(cat => {
        row[cat] = transactions.filter(t => t.type === 'expense' && t.category === cat && t.date && t.date.slice(0,7) === m).reduce((s,t)=>s+Number(t.amount||0),0)
      })
      return row
    })

    return { months, series, categorySeries }
  }, [transactions, monthlySummaries])

  return (
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      <div className="card glass" style={{padding:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontWeight:700}}>Spending Trend</div>
          <div style={{fontSize:13,color:'var(--muted)'}}>Last {Math.max(1, months.length)} months</div>
        </div>
        <div style={{height:220}}>
          <ResponsiveContainer>
            <LineChart data={series} margin={{ top: 12, right: 18, left: 0, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
              <XAxis dataKey="month" tickFormatter={prettyMonth} />
              <YAxis />
              <Tooltip formatter={(v)=>typeof v === 'number' ? v.toFixed(2) : v} labelFormatter={l => prettyMonth(l)} />
              <Legend />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card glass" style={{padding:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontWeight:700}}>Savings Growth</div>
          <div style={{fontSize:13,color:'var(--muted)'}}>Monthly savings over time</div>
        </div>
        <div style={{height:180,marginTop:8}}>
          <ResponsiveContainer>
            <AreaChart data={series} margin={{ top: 12, right: 18, left: 0, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
              <XAxis dataKey="month" tickFormatter={prettyMonth} />
              <YAxis />
              <Tooltip formatter={(v)=>typeof v === 'number' ? v.toFixed(2) : v} labelFormatter={l => prettyMonth(l)} />
              <Area type="monotone" dataKey="savings" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.16} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card glass" style={{padding:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontWeight:700}}>Category Comparison</div>
          <div style={{fontSize:13,color:'var(--muted)'}}>Top categories across months</div>
        </div>
        <div style={{height:260,marginTop:8}}>
          <ResponsiveContainer>
            <BarChart data={categorySeries} margin={{ top: 12, right: 18, left: 0, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
              <XAxis dataKey="month" tickFormatter={prettyMonth} />
              <YAxis />
              <Tooltip formatter={(v)=>typeof v === 'number' ? v.toFixed(2) : v} labelFormatter={l => prettyMonth(l)} />
              <Legend />
              {categorySeries && categorySeries.length > 0 && Object.keys(categorySeries[0]).filter(k=>k!=='month').map((cat,i) => (
                <Bar key={cat} dataKey={cat} stackId="a" fill={["#60a5fa","#f97316","#f973a0","#a78bfa","#34d399"][i%5]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
