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
      else {
        // Attempt to restore from backend backup if localStorage is empty
        ;(async () => {
          try {
            const res = await fetch('http://localhost:4000/api/backups/latest')
            if (!res.ok) return
            const text = await res.text()
            const parsed = JSON.parse(text)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTransactions(parsed)
              localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
            }
          } catch (err) {
            // backend not available — ignore
            // console.log('No backend restore available', err)
          }
        })()
      }
    } catch (err) {
      console.error('Failed to load transactions', err)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
    // Also attempt to save a backup to the backend if available (non-blocking)
    ;(async () => {
      try {
        await fetch('http://localhost:4000/api/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactions)
        })
      } catch (err) {
        // ignore if backend is not running
      }
    })()
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
