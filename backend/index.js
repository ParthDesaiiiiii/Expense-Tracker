const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const fs = require('fs')
const path = require('path')
const BACKUP_DIR = path.join(__dirname, 'backups')

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

// POST /api/recommendations
// Expects: { income, expenses, savings, topCategories }
// Returns rule-based suggestions
app.post('/api/recommendations', (req, res) => {
  try {
    // Accept richer payload: transactions OR summary
    const { transactions = null, income = 0, expenses = 0, savings = 0, topCategories = [] } = req.body;

    // If transactions provided, compute monthly totals
    let incomeNum = Number(income) || 0;
    let expensesNum = Number(expenses) || 0;
    let savingsNum = Number(savings) || 0;
    let computedTop = Array.isArray(topCategories) ? topCategories : [];

    if (Array.isArray(transactions) && transactions.length > 0){
      const map = {}
      transactions.forEach(t => {
        if (t.type === 'income') incomeNum += Number(t.amount || 0)
        else expensesNum += Number(t.amount || 0)
        if (t.category) map[t.category] = (map[t.category] || 0) + Number(t.amount || 0)
      })
      savingsNum = Math.max(0, incomeNum - expensesNum)
      computedTop = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x[0])
    }

    // month-over-month change calculation requires monthlySummary in payload
    // payload.monthlySummaries expected as { '2026-04': {income, expense}, ... }
    const monthlySummaries = req.body.monthlySummaries || {}
    const months = Object.keys(monthlySummaries).sort().reverse()
    let monthChangePct = null
    if (months.length >= 2){
      const cur = monthlySummaries[months[0]] || { income:0, expense:0 }
      const prev = monthlySummaries[months[1]] || { income:0, expense:0 }
      const curExpense = Number(cur.expense || 0)
      const prevExpense = Number(prev.expense || 0)
      if (prevExpense > 0) monthChangePct = Math.round(((curExpense - prevExpense) / prevExpense) * 100)
      else if (curExpense > 0) monthChangePct = 100
    }

    const suggestions = []

    const savingRatio = incomeNum > 0 ? Math.round((savingsNum / incomeNum) * 100) : 0
    if (savingRatio < 20){
      suggestions.push({ type:'savings', message: `You're saving only ${savingRatio}% of your income. Aim for at least 20–30% by automating transfers and trimming discretionary spend.` })
    } else if (savingRatio < 50){
      suggestions.push({ type:'savings', message: `Good — ${savingRatio}% saved. If comfortable, gradually increase the saving rate toward long-term goals.` })
    } else {
      suggestions.push({ type:'savings', message: `Excellent — ${savingRatio}% saved. Consider diversifying to investments and retirement vehicles.` })
    }

    // month change insight
    if (monthChangePct !== null){
      if (monthChangePct > 0) suggestions.push({ type:'trend', message: `Your expenses increased by ${monthChangePct}% compared to last month.` })
      else if (monthChangePct < 0) suggestions.push({ type:'trend', message: `Good — your expenses decreased by ${Math.abs(monthChangePct)}% vs last month.` })
    }

    // top categories share
    if (Array.isArray(computedTop) && computedTop.length > 0){
      // compute top2 share
      const map = {}
      transactions && transactions.forEach(t => { if (t.type === 'expense') map[t.category] = (map[t.category]||0) + Number(t.amount||0) })
      const totalExpense = Object.values(map).reduce((s,v)=>s+v,0) || expensesNum
      const sorted = Object.entries(map).sort((a,b)=>b[1]-a[1])
      if (sorted.length > 0){
        const top2 = sorted.slice(0,2)
        const top2sum = top2.reduce((s,v)=>s+v[1],0)
        const pct = totalExpense > 0 ? Math.round((top2sum/totalExpense)*100) : null
        if (pct !== null) suggestions.push({ type:'category', message: `Top ${top2.length} spending categories (${top2.map(x=>x[0]).join(', ')}) account for ${pct}% of your total expenses.` })
      }
    }

    // actionable tips
    if (expensesNum > incomeNum * 0.8){
      suggestions.push({ type:'optimization', message: `Expenses are using over 80% of income. Review subscriptions and recurring charges; consider a 30‑day expense audit.` })
    } else {
      suggestions.push({ type:'optimization', message: `You're in a comfortable position. Consider small investment allocations if you have spare cash.` })
    }

    suggestions.push({ type:'challenge', message: `Try a no‑spend weekend or swap two paid coffees for homebrew this week to save immediately.` })

    res.json({ suggestions, savingRatio, monthChangePct })
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Backup endpoints
app.post('/api/backup', (req, res) => {
  try {
    const payload = req.body || {}
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup-${ts}.json`
    const full = path.join(BACKUP_DIR, filename)
    fs.writeFileSync(full, JSON.stringify(payload, null, 2), 'utf8')
    res.json({ ok: true, filename })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to write backup' })
  }
})

app.get('/api/backups', (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json')).sort().reverse()
    res.json({ files })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to list backups' })
  }
})

app.get('/api/backups/latest', (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json')).sort().reverse()
    if (files.length === 0) return res.status(404).json({ error: 'No backups' })
    const latest = files[0]
    const data = fs.readFileSync(path.join(BACKUP_DIR, latest), 'utf8')
    res.setHeader('Content-Type', 'application/json')
    res.send(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load latest backup' })
  }
})

// Return first non-empty backup (useful when many backups are empty)
app.get('/api/backups/best', (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json')).sort().reverse()
    for (const f of files){
      try{
        const txt = fs.readFileSync(path.join(BACKUP_DIR, f), 'utf8')
        const parsed = JSON.parse(txt)
        if (Array.isArray(parsed) && parsed.length > 0){
          res.setHeader('Content-Type', 'application/json')
          return res.send(txt)
        }
      }catch(e){ continue }
    }
    return res.status(404).json({ error: 'No non-empty backups found' })
  } catch (err){
    console.error(err)
    res.status(500).json({ error: 'Failed to search backups' })
  }
})

// Serve individual backup files for download/restore
app.get('/backups/:file', (req, res) => {
  try {
    const file = req.params.file
    const full = path.join(BACKUP_DIR, file)
    if (!fs.existsSync(full)) return res.status(404).json({ error: 'Not found' })
    res.sendFile(full)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send backup' })
  }
})

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Recommendations API running on http://localhost:${PORT}`));
