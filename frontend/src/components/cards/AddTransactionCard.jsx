import React from 'react'
import TransactionForm from '../TransactionForm'

export default function AddTransactionCard(){
  return (
    <div className="add-card glass">
      <div className="add-header">Add Transaction</div>
      <div className="add-body">
        <TransactionForm />
      </div>
    </div>
  )
}
