import React, { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'et_savings_goals_v1'
const SavingsGoalContext = createContext()

export function useSavingsGoals(){ return useContext(SavingsGoalContext) }

export function SavingsGoalProvider({ children }){
  const [goals, setGoals] = useState([])

  useEffect(() => {
    try{ const raw = localStorage.getItem(STORAGE_KEY); if (raw) setGoals(JSON.parse(raw)) }catch(e){}
  }, [])

  useEffect(() => { try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(goals)) }catch(e){} }, [goals])

  function addGoal(goal){
    setGoals(s => [{ id: Date.now().toString(), ...goal }, ...s])
  }

  function updateGoal(id, patch){ setGoals(s => s.map(g => g.id === id ? { ...g, ...patch } : g)) }

  function deleteGoal(id){ setGoals(s => s.filter(g => g.id !== id)) }

  return (
    <SavingsGoalContext.Provider value={{ goals, addGoal, updateGoal, deleteGoal }}>{children}</SavingsGoalContext.Provider>
  )
}

export default SavingsGoalContext
