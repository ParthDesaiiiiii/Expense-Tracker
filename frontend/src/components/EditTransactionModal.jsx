import React, { useState, useEffect } from 'react'
import { useTransactions } from '../contexts/TransactionContext'
import dayjs from 'dayjs'

export default function EditTransactionModal({ tx, onClose }){
  const { updateTransaction } = useTransactions()
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Other')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))

  useEffect(() => {
    if (!tx) return
    setType(tx.type || 'expense')
    setAmount(String(tx.amount || ''))
    setCategory(tx.category || 'Other')
    setDescription(tx.description || '')
    setDate(tx.date ? tx.date.slice(0,10) : dayjs().format('YYYY-MM-DD'))
  }, [tx])

  if (!tx) return null

  function onSave(e){
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) return alert('Enter a valid positive amount')
    updateTransaction(tx.id, { type, amount: value, category, description, date })
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal glass">
        <div className="modal-header">Edit Transaction</div>
        <form onSubmit={onSave}>
          <div className="row">
            <select value={type} onChange={e=>setType(e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} />
          </div>
          <div className="row">
            <input value={category} onChange={e=>setCategory(e.target.value)} />
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
          </div>
          <div className="row">
            <input value={description} onChange={e=>setDescription(e.target.value)} />
          </div>
          <div className="row actions">
            <button className="btn" type="button" onClick={onClose}>Cancel</button>
            <button className="btn primary" type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
