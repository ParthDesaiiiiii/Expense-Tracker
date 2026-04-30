import React, { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'et_budgets_v1'
const BudgetContext = createContext()

export function useBudgets(){
  return useContext(BudgetContext)
}

export function BudgetProvider({ children }){
  const [budgets, setBudgets] = useState({})

  useEffect(() => {
    try{
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setBudgets(JSON.parse(raw))
    }catch(err){}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets))
  }, [budgets])

  function setBudget(category, amount){
    setBudgets(s => ({ ...s, [category]: Number(amount) }))
  }

  return <BudgetContext.Provider value={{ budgets, setBudget }}>{children}</BudgetContext.Provider>
}

export default BudgetContext
