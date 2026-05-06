import React, { useMemo } from 'react'
import { useTransactions } from '../contexts/TransactionContext'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Legend, CartesianGrid } from 'recharts'

const COLORS = ['#4f46e5','#06b6d4','#f97316','#ef4444','#10b981','#8b5cf6','#f43f5e','#f59e0b']

export default function ChartsPanel(){
  const { transactions, monthFilter } = useTransactions()

  const expenseCats = useMemo(() => {
    const map = {}
    const list = monthFilter === 'all' ? transactions : transactions.filter(t => t.date && t.date.slice(0,7) === monthFilter)
    list.filter(t => t.type === 'expense').forEach(t => { map[t.category] = (map[t.category] || 0) + Number(t.amount) })
    return Object.entries(map).map(([key, value]) => ({ name: key, value }))
  }, [transactions, monthFilter])

  const monthly = useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      const m = t.date ? t.date.slice(0,7) : 'unknown'
      if (!map[m]) map[m] = { month: m, income: 0, expense: 0 }
      if (t.type === 'income') map[m].income += Number(t.amount)
      else map[m].expense += Number(t.amount)
    })
    return Object.values(map).sort((a,b) => a.month.localeCompare(b.month))
  }, [transactions])

  return (
    <div className="charts panel glass">
      <div className="chart-left">
        <h4>Expenses by Category</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={expenseCats} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40} paddingAngle={2} isAnimationActive={true}>
              {expenseCats.map((entry, index) => <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} className="pie-cell" />)}
            </Pie>
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{background:'rgba(0,0,0,0.7)',border:'none'}} itemStyle={{color:'#fff'}} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-right">
        <h4>Monthly Income vs Expense</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthly} className="bar-chart">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip cursor={{ fill: 'transparent' }} wrapperStyle={{background:'rgba(0,0,0,0.7)',border:'none'}} contentStyle={{background:'transparent',border:'none'}} itemStyle={{color:'#fff'}} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" className="bar-income" />
            <Bar dataKey="expense" fill="#ef4444" className="bar-expense" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
