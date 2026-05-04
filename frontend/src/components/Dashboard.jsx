import React from 'react'
import BalanceCards from './cards/BalanceCards'
import AddTransactionCard from './cards/AddTransactionCard'
import TransactionsList from './TransactionsList'
import ChartsPanel from './ChartsPanel'
import MonthSelector from './MonthSelector'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>Dashboard</h1>
        <MonthSelector />
      </div>
      <div className="top-row">
        <BalanceCards />
        <AddTransactionCard />
      </div>
      <div className="middle-row">
        <ChartsPanel />
        <TransactionsList />
      </div>
    </div>
  )
}
