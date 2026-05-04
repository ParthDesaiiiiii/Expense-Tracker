import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useBudgets } from '../contexts/BudgetContext'
import { useSavingsGoals } from '../contexts/SavingsGoalContext'

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
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <button className="btn" onClick={toggleTheme}>{theme === 'dark' ? 'Light' : 'Dark'} Mode</button>
          <div style={{display:'flex',gap:8}}>
            <button className="btn" onClick={() => {
              const data = localStorage.getItem('et_transactions_v1') || '[]'
              const blob = new Blob([data], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'transactions-backup.json'
              a.click()
              URL.revokeObjectURL(url)
            }}>Export</button>
            <label className="btn" style={{cursor:'pointer'}}>
              Import
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
          <div style={{display:'flex',gap:8,marginTop:6}}>
            <button className="btn" onClick={async () => {
              try {
                const payload = JSON.parse(localStorage.getItem('et_transactions_v1') || '[]')
                const res = await fetch('http://localhost:4000/api/backup', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                const data = await res.json()
                if (data.ok) alert('Saved backup: ' + data.filename)
                else alert('Failed to save backup')
              } catch (err) { alert('Save failed: ' + err.message) }
            }}>Save to Server</button>
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
            }}>Restore Latest</button>
          </div>
          <div style={{marginTop:10}}>
            <div style={{fontSize:12,color:'var(--muted)',marginBottom:6}}>Set Budget</div>
            <div style={{display:'flex',gap:8}}>
              <input placeholder="Category" value={cat} onChange={e=>setCat(e.target.value)} style={{padding:8,borderRadius:8}} />
              <input placeholder="Amount" value={amt} onChange={e=>setAmt(e.target.value)} style={{padding:8,borderRadius:8}} />
              <button className="btn" onClick={() => { if (setBudget){ setBudget(cat, Number(amt)) ; setAmt('') } }}>Set</button>
            </div>
          </div>
          <div style={{marginTop:12}}>
            <div style={{fontSize:12,color:'var(--muted)',marginBottom:6}}>Create Savings Goal</div>
            <input placeholder="Title (e.g. Laptop)" value={goalTitle} onChange={e=>setGoalTitle(e.target.value)} style={{width:'100%',padding:8,borderRadius:8,marginBottom:6}} />
            <input placeholder="Target amount" type="number" value={goalTarget} onChange={e=>setGoalTarget(e.target.value)} style={{width:'100%',padding:8,borderRadius:8,marginBottom:6}} />
            <div style={{display:'flex',gap:8}}>
              <button className="btn small" onClick={()=>{ setGoalTitle(''); setGoalTarget(''); }}>Clear</button>
              <button className="btn primary" onClick={()=>{ if (!goalTitle || !goalTarget) return alert('Enter title and target'); addGoal({ title:goalTitle, target:Number(goalTarget), saved:0 }); setGoalTitle(''); setGoalTarget('') }}>Add Goal</button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
