import React, { createContext, useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'et_transactions_v1'
const DISABLE_AUTORESTORE_KEY = 'et_disable_autorestore_v1'

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
  const [monthlySummaries, setMonthlySummaries] = useState({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setTransactions(JSON.parse(raw))
      else {
        ;(async () => {
          try {
            // attempt: if a one-time force-restore JSON exists in public, use it (helps recovery)
            try{
              const fr = await fetch('/force-restore.json')
              if (fr.ok){
                const parsed = await fr.json()
                const applied = localStorage.getItem('et_force_restore_applied_v1')
                if (Array.isArray(parsed) && parsed.length > 0 && !applied){
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
                  setTransactions(parsed)
                  localStorage.setItem('et_force_restore_applied_v1', '1')
                  return
                }
              }
            }catch(e){ /* ignore missing force file */ }

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

  // URL-triggered restore helper: visit ?restore=latest or ?restore=<filename>
  useEffect(() => {
    try{
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      if (!params) return
      const r = params.get('restore')
      if (!r) return
      ;(async () => {
        try{
          if (r === 'latest'){
            const listRes = await fetch('http://localhost:4000/api/backups')
            if (!listRes.ok) return
            const listJson = await listRes.json()
            const files = Array.isArray(listJson.files) ? listJson.files : []
            for (const f of files){
              try{
                const txt = await (await fetch(`http://localhost:4000/backups/${f}`)).text()
                const remote = JSON.parse(txt)
                if (Array.isArray(remote) && remote.length > 0){
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(remote))
                  setTransactions(remote)
                  alert('Restored backup: ' + f)
                  window.location.href = window.location.pathname
                  return
                }
              }catch(e){ continue }
            }
            alert('No non-empty backups found')
          } else {
            // treat r as filename
            try{
              const txt = await (await fetch(`http://localhost:4000/backups/${r}`)).text()
              const remote = JSON.parse(txt)
              if (Array.isArray(remote)){
                localStorage.setItem(STORAGE_KEY, JSON.stringify(remote))
                setTransactions(remote)
                alert('Restored backup: ' + r)
                window.location.href = window.location.pathname
              } else alert('Backup format invalid')
            }catch(err){ alert('Failed to fetch backup: ' + err.message) }
          }
        }catch(e){ console.error('restore via URL failed', e) }
      })()
    }catch(e){}
  }, [])

  // Automatic restore with retries: if local is empty or remote is newer, try to apply best backup.
  useEffect(() => {
    let cancelled = false
    const attemptRestore = async () => {
      // respect explicit local protection flag
      try{ if (localStorage.getItem(DISABLE_AUTORESTORE_KEY) === '1') { console.info('[TransactionContext] Auto-restore disabled by flag'); return } }catch(e){}
      try{
        const raw = localStorage.getItem(STORAGE_KEY)
        const local = raw ? JSON.parse(raw) : []

        // helper to compute latest date
        const latestDate = (arr) => {
          if (!Array.isArray(arr) || arr.length === 0) return 0
          let max = 0
          arr.forEach(t => { if (t && t.date){ const v = new Date(t.date).getTime(); if (!isNaN(v) && v > max) max = v } })
          return max
        }

        // 1) If local empty, first try front-end force file (already handled above) then try server repeatedly
        if (!local || local.length === 0){
          // try server backups with retries in case backend starts slightly later
          const maxAttempts = 6
          let delay = 800
          for (let i=0;i<maxAttempts && !cancelled;i++){
            try{
              const listRes = await fetch('http://localhost:4000/api/backups')
              if (!listRes.ok) throw new Error('no list')
              const listJson = await listRes.json()
              const files = Array.isArray(listJson.files) ? listJson.files : []
              for (const f of files){
                try{
                  const txt = await (await fetch(`http://localhost:4000/backups/${f}`)).text()
                  const remote = JSON.parse(txt)
                  if (Array.isArray(remote) && remote.length > 0){
                    // apply
                    const now = new Date().toISOString().replace(/[:.]/g,'-')
                    try{ const cur = localStorage.getItem(STORAGE_KEY) || '[]'; localStorage.setItem('et_transactions_v1_backup_before_autorestore_' + now, cur) }catch(e){}
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(remote))
                    setTransactions(remote)
                    console.info('[TransactionContext] Auto-restored from server backup', f)
                    return
                  }
                }catch(e){ continue }
              }
            }catch(e){
              // wait and retry
            }
            await new Promise(r => setTimeout(r, delay))
            delay = Math.min(4000, delay * 1.8)
          }
        } else {
          // local exists; check server and apply if server has newer
          try{
            const listRes = await fetch('http://localhost:4000/api/backups')
            if (listRes.ok){
              const listJson = await listRes.json()
              const files = Array.isArray(listJson.files) ? listJson.files : []
              const localLatest = latestDate(local)
              for (const f of files){
                try{
                  const txt = await (await fetch(`http://localhost:4000/backups/${f}`)).text()
                  const remote = JSON.parse(txt)
                  if (Array.isArray(remote) && remote.length > 0){
                    const remoteLatest = latestDate(remote)
                    if (remoteLatest > localLatest){
                      const now = new Date().toISOString().replace(/[:.]/g,'-')
                      try{ const cur = localStorage.getItem(STORAGE_KEY) || '[]'; localStorage.setItem('et_transactions_v1_backup_before_autorestore_' + now, cur) }catch(e){}
                      const merged = mergeTransactions(local, remote)
                      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
                      setTransactions(merged)
                      console.info('[TransactionContext] Auto-merged newer server backup', f)
                    }
                    break
                  }
                }catch(e){ continue }
              }
            }
          }catch(e){ /* ignore */ }
        }
      }catch(e){ console.error('[TransactionContext] auto restore failed', e) }
    }
    attemptRestore()
    return () => { cancelled = true }
  // We only want to run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // merge remote backup with local when both exist (non-destructive)
  useEffect(() => {
    // respect explicit local protection flag
    try{ if (localStorage.getItem(DISABLE_AUTORESTORE_KEY) === '1') { console.info('[TransactionContext] Merge skipped because auto-restore disabled'); return } }catch(e){}
    ;(async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const local = raw ? JSON.parse(raw) : []
        const listRes = await fetch('http://localhost:4000/api/backups')
        if (!listRes.ok) return
        const listJson = await listRes.json()
        const files = Array.isArray(listJson.files) ? listJson.files : []

        // helper to get latest date from a list
        const latestDate = (arr) => {
          if (!Array.isArray(arr) || arr.length === 0) return 0
          let max = 0
          arr.forEach(t => { if (t && t.date){ const v = new Date(t.date).getTime(); if (!isNaN(v) && v > max) max = v } })
          return max
        }

        for (const f of files){
          try{
            const txt = await (await fetch(`http://localhost:4000/backups/${f}`)).text()
            const remote = JSON.parse(txt)
            if (Array.isArray(remote) && remote.length > 0){
              const localLatest = latestDate(local)
              const remoteLatest = latestDate(remote)
              // Only apply remote if local empty OR remote has newer data
              if (local.length === 0 || remoteLatest > localLatest){
                console.info('[TransactionContext] Applying remote backup', f, { localLatest, remoteLatest })
                const merged = mergeTransactions(local, remote)
                setTransactions(merged)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
              } else {
                console.info('[TransactionContext] Skipping remote backup (local is newer or equal)', f, { localLatest, remoteLatest })
              }
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

  // compute monthly summaries whenever transactions change
  useEffect(() => {
    const map = {}
    transactions.forEach(t => {
      const m = t.date ? t.date.slice(0,7) : 'unknown'
      if (!map[m]) map[m] = { income: 0, expense: 0 }
      if (t.type === 'income') map[m].income += Number(t.amount)
      else map[m].expense += Number(t.amount)
    })
    const summaries = {}
    Object.entries(map).forEach(([m, v]) => {
      summaries[m] = { income: v.income, expense: v.expense, savings: Math.max(0, v.income - v.expense) }
    })
    setMonthlySummaries(summaries)
    try{ localStorage.setItem('et_monthly_summaries_v1', JSON.stringify(summaries)) }catch(e){}
  }, [transactions])

  function addTransaction(tx) {
    const newTx = { ...tx, id: uuidv4() }
    setTransactions((s) => [newTx, ...s])
    try{ localStorage.setItem(DISABLE_AUTORESTORE_KEY, '1') }catch(e){}
    return newTx
  }

  function updateTransaction(id, patch) {
    setTransactions((s) => s.map(t => t.id === id ? { ...t, ...patch } : t))
  }

  function deleteTransaction(id) {
    setTransactions((s) => s.filter(t => t.id !== id))
  }

  const value = { transactions, addTransaction, updateTransaction, deleteTransaction, setTransactions, monthFilter, setMonthFilter, monthlySummaries }
  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>
}
