import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme()
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
      </nav>
      <div className="sidebar-footer">
        <button className="btn" onClick={toggleTheme}>{theme === 'dark' ? 'Light' : 'Dark'} Mode</button>
      </div>
    </aside>
  )
}
