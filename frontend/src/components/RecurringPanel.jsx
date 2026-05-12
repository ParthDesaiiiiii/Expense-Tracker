import React from 'react'
import { useRecurrings } from '../contexts/RecurringContext'

export default function RecurringPanel(){
  const { recurrings, addRecurring, deleteRecurring } = useRecurrings()
  const [name, setName] = React.useState('Rent')
  const [amount, setAmount] = React.useState('')
  const [category, setCategory] = React.useState('Rent')

  return (
    <div style={{marginTop:12}}>
      <div style={{fontSize:13,fontWeight:700}}>Recurring</div>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <input className="sidebar-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
        <input className="sidebar-input" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" />
      </div>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <input className="sidebar-input" value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" />
        <button className="btn" onClick={()=>{ if(!amount) return alert('Enter amount'); addRecurring({ name, amount: Number(amount), category, frequency:'monthly' }); setAmount('') }}>Add</button>
      </div>
      <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:8}}>
        {recurrings && recurrings.map(r => (
          <div key={r.id} className="alert-item">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:700}}>{r.name} — ${Number(r.amount).toFixed(2)}</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>{r.frequency} • {r.category}</div>
              </div>
              <div>
                <button className="btn small" onClick={()=>deleteRecurring(r.id)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
