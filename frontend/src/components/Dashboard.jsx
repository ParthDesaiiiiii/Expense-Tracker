import React from 'react'
import BalanceCards from './cards/BalanceCards'
import AddTransactionCard from './cards/AddTransactionCard'
import TransactionsList from './TransactionsList'
import ChartsPanel from './ChartsPanel'
import MonthSelector from './MonthSelector'
import { downloadCSV, downloadPDF } from '../utils/exportUtils'
import { useTransactions } from '../contexts/TransactionContext'
import SavingsGoalCard from './SavingsGoalCard'

export default function Dashboard() {
  const { transactions, monthFilter } = useTransactions()
  const filtered = monthFilter === 'all' ? transactions : transactions.filter(t => t.date && t.date.slice(0,7) === monthFilter)
  return (
    <div className="dashboard">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>Dashboard</h1>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <MonthSelector />
          <div style={{display:'flex',gap:8}}>
            <button className="btn" onClick={() => downloadCSV(filtered, `transactions-${monthFilter}.csv`)}>CSV</button>
            <button className="btn" onClick={async () => {
              const el = document.querySelector('.dashboard')
              await downloadPDF(el, `transactions-${monthFilter}.pdf`)
            }}>PDF</button>
          </div>
        </div>
      </div>
      <div className="top-row">
        <BalanceCards />
        <AddTransactionCard />
      </div>
      <div style={{marginTop:10}}>
        <SavingsGoalCard />
      </div>
      <div className="middle-row">
        <ChartsPanel />
        <TransactionsList />
      </div>
    </div>
  )
}
