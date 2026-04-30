import React from 'react'
import Sidebar from './components/Sidebar'
import { motion } from 'framer-motion'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import AddTransactionPage from './pages/AddTransactionPage'
import AnalyticsPage from './pages/AnalyticsPage'
import RecommendationsPage from './pages/RecommendationsPage'
import BackupsPage from './pages/BackupsPage'

export default function App(){
  return (
    <div className="app-root">
      <Sidebar />
      <main className="main-area">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/add" element={<AddTransactionPage/>} />
            <Route path="/analytics" element={<AnalyticsPage/>} />
            <Route path="/recommendations" element={<RecommendationsPage/>} />
            <Route path="/backups" element={<BackupsPage/>} />
          </Routes>
        </motion.div>
      </main>
    </div>
  )
}
