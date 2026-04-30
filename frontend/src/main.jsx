import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { TransactionProvider } from './contexts/TransactionContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { BudgetProvider } from './contexts/BudgetContext'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <BudgetProvider>
          <TransactionProvider>
            <App />
          </TransactionProvider>
        </BudgetProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
