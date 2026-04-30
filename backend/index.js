const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// POST /api/recommendations
// Expects: { income, expenses, savings, topCategories }
// Returns rule-based suggestions
app.post('/api/recommendations', (req, res) => {
  try {
    const { income = 0, expenses = 0, savings = 0, topCategories = [] } = req.body;

    const incomeNum = Number(income) || 0;
    const expensesNum = Number(expenses) || 0;
    const savingsNum = Number(savings) || Math.max(0, incomeNum - expensesNum);

    const suggestions = [];

    // Savings recommendation
    const savingRatio = incomeNum > 0 ? Math.round((savingsNum / incomeNum) * 100) : 0;
    if (savingRatio < 20) {
      suggestions.push({
        type: 'savings',
        message: `You're saving only ${savingRatio}% of your income. Aim for at least 20-30% by cutting non-essential spending or automating transfers.`
      });
    } else if (savingRatio < 50) {
      suggestions.push({
        type: 'savings',
        message: `Good job — you're saving ${savingRatio}% of income. Consider increasing savings gradually toward 50% if your goals require it.`
      });
    } else {
      suggestions.push({
        type: 'savings',
        message: `Excellent — ${savingRatio}% saved. Diversify savings across emergency funds and long-term investments.`
      });
    }

    // Investment suggestion
    const investAmt = Math.max(0, Math.round((incomeNum - expensesNum) * 0.15));
    suggestions.push({
      type: 'investment',
      message: `Consider allocating around $${investAmt}/month into low-cost index funds or ETFs. Start small with automated contributions.`
    });

    // Travel planning idea based on savings
    if (savingsNum > 1000) {
      const days = Math.min(10, Math.max(3, Math.floor(savingsNum / 300)));
      suggestions.push({
        type: 'travel',
        message: `With current savings (~$${savingsNum}), you could plan a ${days}-day domestic trip or a short international trip if you find deals.`
      });
    }

    // Category insight
    if (Array.isArray(topCategories) && topCategories.length > 0) {
      suggestions.push({
        type: 'insight',
        message: `High spending detected in: ${topCategories.slice(0,3).join(', ')}. Try targeted budgeting or alternative cheaper providers.`
      });
    }

    // Optimization tips
    if (expensesNum > incomeNum * 0.8) {
      suggestions.push({
        type: 'optimization',
        message: `Expenses are using over 80% of income. Review subscriptions and recurring charges; try a 30-day expense audit.`
      });
    } else {
      suggestions.push({
        type: 'optimization',
        message: `You're in a comfortable position. Consider rebalancing savings vs investments based on your horizon.`
      });
    }

    // Challenge suggestion
    suggestions.push({
      type: 'challenge',
      message: `Try a no-spend weekend or reduce dining out for two weeks to see immediate savings improvements.`
    });

    res.json({ suggestions, savingRatio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Recommendations API running on http://localhost:${PORT}`));
