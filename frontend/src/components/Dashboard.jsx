import React from 'react'
import BalanceCards from './cards/BalanceCards'
import AddTransactionCard from './cards/AddTransactionCard'
import TransactionsList from './TransactionsList'
import ChartsPanel from './ChartsPanel'

export default function Dashboard() {
  return (
    <div className="dashboard">
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
