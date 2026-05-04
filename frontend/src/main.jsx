import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { TransactionProvider } from './contexts/TransactionContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { BudgetProvider } from './contexts/BudgetContext'
import { SavingsGoalProvider } from './contexts/SavingsGoalContext'
import ErrorBoundary from './components/ErrorBoundary'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <BudgetProvider>
          <SavingsGoalProvider>
            <TransactionProvider>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </TransactionProvider>
          </SavingsGoalProvider>
        </BudgetProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
