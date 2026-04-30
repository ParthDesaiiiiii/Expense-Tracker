import React, { useState } from 'react'
import { useTransactions } from '../contexts/TransactionContext'
import dayjs from 'dayjs'

const defaultCategories = ['Salary','Food','Rent','Bills','Shopping','Travel','Entertainment','Other']

export default function TransactionForm(){
  const { addTransaction } = useTransactions()
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))

  function onSubmit(e){
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) return alert('Enter a valid positive amount')
    const tx = { type, amount: value, category, description, date }
    addTransaction(tx)
    setAmount('')
    setDescription('')
  }

  return (
    <form className="tx-form" onSubmit={onSubmit}>
      <div className="row">
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input type="number" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
      </div>
      <div className="row">
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {defaultCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div className="row">
        <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="row actions">
        <button className="btn primary" type="submit">Add</button>
      </div>
    </form>
  )
}
