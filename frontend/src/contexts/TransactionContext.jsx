import React, { createContext, useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'et_transactions_v1'

const TransactionContext = createContext()

export function useTransactions() {
  return useContext(TransactionContext)
}

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setTransactions(JSON.parse(raw))
    } catch (err) {
      console.error('Failed to load transactions', err)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  function addTransaction(tx) {
    const newTx = { ...tx, id: uuidv4() }
    setTransactions((s) => [newTx, ...s])
    return newTx
  }

  function updateTransaction(id, patch) {
    setTransactions((s) => s.map(t => t.id === id ? { ...t, ...patch } : t))
  }

  function deleteTransaction(id) {
    setTransactions((s) => s.filter(t => t.id !== id))
  }

  const value = { transactions, addTransaction, updateTransaction, deleteTransaction, setTransactions }
  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>
}
