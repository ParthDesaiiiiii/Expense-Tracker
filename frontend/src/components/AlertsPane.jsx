import React from 'react'
import { useAlerts } from '../contexts/AlertContext'

export default function AlertsPane(){
  const { alerts, dismissAlert } = useAlerts()
  if (!alerts || alerts.length === 0) return null
  return (
    <div style={{marginTop:12}}>
      <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Alerts</div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {alerts.map(a => (
          <div key={a.id} className="alert-item">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{fontWeight:700}}>{a.title}</div>
                <div style={{fontSize:13,color:'var(--muted)'}}>{a.message}</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6,marginLeft:12}}>
                <button className="btn small" onClick={() => dismissAlert(a.id)}>Dismiss</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
