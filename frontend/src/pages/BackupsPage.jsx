import React, { useEffect, useState } from 'react'

export default function BackupsPage(){
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('http://localhost:4000/api/backups')
      .then(r => r.json())
      .then(d => setFiles(d.files || []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false))
  }, [])

  async function restore(name){
    try{
      const res = await fetch(`http://localhost:4000/backups/${name}`)
      if (!res.ok) return alert('Failed to download backup')
      const text = await res.text()
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)){
        localStorage.setItem('et_transactions_v1', JSON.stringify(parsed))
        window.location.reload()
      } else alert('Invalid backup format')
    }catch(err){alert('Restore failed: '+err.message)}
  }

  return (
    <div style={{padding:20}}>
      <h2>Backups</h2>
      {loading && <div>Loading backups...</div>}
      {!loading && files.length === 0 && <div className="empty">No backups available.</div>}
      <ul>
        {files.map(f => (
          <li key={f} style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
            <div style={{flex:1}}>{f}</div>
            <a className="btn" href={`http://localhost:4000/backups/${f}`} download>Download</a>
            <button className="btn" onClick={() => restore(f)}>Restore</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
