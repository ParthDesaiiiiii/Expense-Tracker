import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useBudgets } from '../contexts/BudgetContext'
import { useSavingsGoals } from '../contexts/SavingsGoalContext'
import AlertsPane from './AlertsPane'

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme()
  const [cat, setCat] = React.useState('Food')
  const [amt, setAmt] = React.useState('')
  const { setBudget } = useBudgets()
  const { addGoal } = useSavingsGoals()
  const [goalTitle, setGoalTitle] = React.useState('')
  const [goalTarget, setGoalTarget] = React.useState('')
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">ET</div>
        <div className="title">ExpenseTracker</div>
      </div>
      <nav className="nav">
        <NavLink to="/" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Dashboard</NavLink>
        <NavLink to="/add" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Add Transaction</NavLink>
        <NavLink to="/analytics" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Analytics</NavLink>
  <NavLink to="/recommendations" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Recommendations</NavLink>
  <NavLink to="/backups" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Backups</NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-section">
          <div className="sidebar-tools">
            <button className="btn" onClick={toggleTheme}>{theme === 'dark' ? '🌤️ Light' : '🌙 Dark'} Mode</button>
            <div className="btn-group">
              <button className="btn" onClick={() => {
                const data = localStorage.getItem('et_transactions_v1') || '[]'
                const blob = new Blob([data], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'transactions-backup.json'
                a.click()
                URL.revokeObjectURL(url)
              }}>⬇️ Export</button>
              <label className="btn" style={{cursor:'pointer'}}>
                ⬆️ Import
                <input type="file" accept="application/json" style={{display:'none'}} onChange={async (e) => {
                  const f = e.target.files && e.target.files[0]
                  if (!f) return
                  try {
                    const text = await f.text()
                    const parsed = JSON.parse(text)
                    if (Array.isArray(parsed)) {
                      localStorage.setItem('et_transactions_v1', JSON.stringify(parsed))
                      window.location.reload()
                    } else {
                      alert('Invalid file format — expected an array of transactions')
                    }
                  } catch (err) { alert('Failed to import: ' + err.message) }
                }} />
              </label>
            </div>
          </div>

          <div className="sidebar-backups">
            <div className="btn-group">
              <button className="btn" onClick={async () => {
                try {
                  const payload = JSON.parse(localStorage.getItem('et_transactions_v1') || '[]')
                  const res = await fetch('http://localhost:4000/api/backup', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                  const data = await res.json()
                  if (data.ok) alert('Saved backup: ' + data.filename)
                  else alert('Failed to save backup')
                } catch (err) { alert('Save failed: ' + err.message) }
              }}>💾 Save</button>
              <button className="btn" onClick={async () => {
                try {
                  const res = await fetch('http://localhost:4000/api/backups/latest')
                  if (!res.ok) return alert('No backups found on server')
                  const text = await res.text()
                  const parsed = JSON.parse(text)
                  if (Array.isArray(parsed)) {
                    localStorage.setItem('et_transactions_v1', JSON.stringify(parsed))
                    window.location.reload()
                  } else alert('Invalid backup format')
                } catch (err) { alert('Restore failed: ' + err.message) }
              }}>🔁 Restore</button>
              <button className="btn" onClick={async () => {
                if (!confirm('Restore first non-empty server backup and merge with local data?')) return
                try{
                  const res = await fetch('http://localhost:4000/api/backups/best')
                  if (!res.ok) return alert('No non-empty backups found')
                  const text = await res.text()
                  const parsed = JSON.parse(text)
                  if (!Array.isArray(parsed)) return alert('Unexpected backup format')
                  const local = JSON.parse(localStorage.getItem('et_transactions_v1') || '[]')
                  const map = new Map()
                  ;[...parsed, ...local].forEach(tx => { if (tx && tx.id) map.set(tx.id, tx) })
                  const merged = Array.from(map.values()).sort((a,b)=> new Date(b.date) - new Date(a.date))
                  localStorage.setItem('et_transactions_v1', JSON.stringify(merged))
                  alert('Restored and merged backup. Reloading...')
                  window.location.reload()
                }catch(e){ alert('Restore failed: ' + e.message) }
              }}>🩹 Merge Restore</button>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <div style={{fontSize:12,color:'var(--muted)',marginBottom:6}}>Set Budget</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <input className="sidebar-input" placeholder="Category" value={cat} onChange={e=>setCat(e.target.value)} />
            <input className="sidebar-input" placeholder="Amount" value={amt} onChange={e=>setAmt(e.target.value)} />
            <button className="btn" onClick={() => { if (setBudget){ setBudget(cat, Number(amt)) ; setAmt('') } }}>Set</button>
          </div>
        </div>

        <div className="sidebar-section">
          <div style={{fontSize:12,color:'var(--muted)',marginBottom:6}}>Create Savings Goal</div>
          <input className="sidebar-input" placeholder="Title (e.g. Laptop)" value={goalTitle} onChange={e=>setGoalTitle(e.target.value)} />
          <input className="sidebar-input" placeholder="Target amount" type="number" value={goalTarget} onChange={e=>setGoalTarget(e.target.value)} />
          <div style={{display:'flex',gap:8}}>
            <button className="btn small" onClick={()=>{ setGoalTitle(''); setGoalTarget(''); }}>Clear</button>
            <button className="btn primary" onClick={()=>{ if (!goalTitle || !goalTarget) return alert('Enter title and target'); addGoal({ title:goalTitle, target:Number(goalTarget), saved:0 }); setGoalTitle(''); setGoalTarget('') }}>Add Goal</button>
          </div>
        </div>
        <AlertsPane />
      </div>
    </aside>
  )
}
