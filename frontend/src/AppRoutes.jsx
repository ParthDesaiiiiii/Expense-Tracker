import React from 'react'
import Dashboard from './components/Dashboard'
import Analytics from './components/Analytics'
import RecommendationsPanel from './components/RecommendationsPanel'

export default function AppRoutes({ route = 'dashboard' }){
  // Minimal route handling: show Dashboard by default
  return (
    <div>
      <Dashboard />
      <RecommendationsPanel />
    </div>
  )
}
