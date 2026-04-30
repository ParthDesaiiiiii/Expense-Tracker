import React, { createContext, useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'et_transactions_v1'

const TransactionContext = createContext()

export function useTransactions() {
  return useContext(TransactionContext)
}

// helper: dedupe by id
function mergeTransactions(local = [], remote = []){
  const map = new Map()
  ;[...remote, ...local].forEach(tx => { if (tx && tx.id) map.set(tx.id, tx) })
  return Array.from(map.values()).sort((a,b)=> new Date(b.date) - new Date(a.date))
}

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [monthFilter, setMonthFilter] = useState('all')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setTransactions(JSON.parse(raw))
      else {
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
            // ignore
          }
        })()
      }
    } catch (err) {
      console.error('Failed to load transactions', err)
    }
  }, [])

  // merge remote backup with local when both exist (non-destructive)
  useEffect(() => {
    ;(async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const local = raw ? JSON.parse(raw) : []
        const listRes = await fetch('http://localhost:4000/api/backups')
        if (!listRes.ok) return
        const listJson = await listRes.json()
        const files = Array.isArray(listJson.files) ? listJson.files : []
        // iterate files in order and pick the first non-empty backup
        for (const f of files){
          try{
            const txt = await (await fetch(`http://localhost:4000/backups/${f}`)).text()
            const remote = JSON.parse(txt)
            if (Array.isArray(remote) && remote.length > 0){
              const merged = mergeTransactions(local, remote)
              setTransactions(merged)
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
              break
            }
          }catch(e){ continue }
        }
      } catch (err){ /* ignore when backend not available */ }
    })()
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
    ;(async () => {
      try {
        await fetch('http://localhost:4000/api/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactions)
        })
      } catch (err) {}
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

  const value = { transactions, addTransaction, updateTransaction, deleteTransaction, setTransactions, monthFilter, setMonthFilter }
  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>
}
