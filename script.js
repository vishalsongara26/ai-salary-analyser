document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const salaryForm = document.getElementById('salaryForm');
    const addExpenseBtn = document.getElementById('addExpense');
    const expensesList = document.getElementById('expensesList');
    const resultSection = document.getElementById('resultSection');
    const annualReportSection = document.getElementById('annualReport');
    const generateAnnualBtn = document.getElementById('generateAnnualReport');
    const backToAnalysisBtn = document.getElementById('backToAnalysis');
    const aiTipsSection = document.getElementById('aiTips');
    const annualDataSection = document.getElementById('annualData');
    
    let salaryChart = null;
    let monthlyData = []; // Stores all monthly entries

    // Expense Categories (Suggestions)
    const expenseCategories = [
        "Rent", "Groceries", "Transport", "Utilities", 
        "Entertainment", "Health", "Education", "Travel"
    ];

    // Add Expense Field
    addExpenseBtn.addEventListener('click', function() {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        
        // Create a datalist for suggestions
        const datalistId = `expenseSuggestions-${expensesList.children.length}`;
        expenseItem.innerHTML = `
            <input type="text" list="${datalistId}" placeholder="Expense Category" required>
            <datalist id="${datalistId}">
                ${expenseCategories.map(cat => `<option value="${cat}">`).join('')}
            </datalist>
            <input type="number" placeholder="Amount (₹)" required>
            <button type="button" class="remove-expense">×</button>
        `;
        
        expensesList.appendChild(expenseItem);

        // Add remove functionality
        const removeBtn = expenseItem.querySelector('.remove-expense');
        removeBtn.addEventListener('click', function() {
            expensesList.removeChild(expenseItem);
        });
    });

    // Form Submission
    salaryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const month = document.getElementById('month').value;
        const salary = parseFloat(document.getElementById('salary').value);
        
        // Get all expenses
        const expenseItems = expensesList.querySelectorAll('.expense-item');
        const expenses = [];
        
        expenseItems.forEach(item => {
            const inputs = item.querySelectorAll('input');
            const name = inputs[0].value;
            const amount = parseFloat(inputs[1].value);
            
            if (name && !isNaN(amount)) {
                expenses.push({ name, amount });
            }
        });
        
        // Calculate totals
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const savings = salary - totalExpenses;
        
        // Store this month's data
        const monthData = {
            month,
            salary,
            expenses,
            totalExpenses,
            savings
        };
        
        monthlyData.push(monthData);
        
        // Display results
        displayResults(monthData);
        
        // Generate AI tips
        generateAITips(monthData);
    });

    // Display Results with Chart
    function displayResults(data) {
        resultSection.classList.remove('hidden');
        annualReportSection.classList.add('hidden');
        
        const { month, salary, expenses, savings } = data;
        
        // Prepare chart data
        const labels = expenses.map(exp => exp.name);
        const amounts = expenses.map(exp => exp.amount);
        
        if (savings > 0) {
            labels.push('Savings');
            amounts.push(savings);
        }
        
        // Colors for chart
        const backgroundColors = generateColors(labels.length);
        
        // Create or update chart
        const ctx = document.getElementById('salaryChart').getContext('2d');
        
        if (salaryChart) {
            salaryChart.destroy();
        }
        
        salaryChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: amounts,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const percentage = Math.round((value / salary) * 100);
                                return `${label}: ₹${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Display summary
        const summaryDetails = document.getElementById('summaryDetails');
        summaryDetails.innerHTML = '';
        
        addSummaryItem(summaryDetails, 'Month', month);
        addSummaryItem(summaryDetails, 'Total Salary', `₹${salary.toFixed(2)}`);
        
        expenses.forEach(expense => {
            const percentage = ((expense.amount / salary) * 100).toFixed(2);
            addSummaryItem(summaryDetails, expense.name, `₹${expense.amount.toFixed(2)} (${percentage}%)`);
        });
        
        const savingsPercentage = ((savings / salary) * 100).toFixed(2);
        addSummaryItem(summaryDetails, 'Savings', `₹${savings.toFixed(2)} (${savingsPercentage}%)`);
    }

    // Generate AI-Powered Tips (Mock API Call)
    function generateAITips(data) {
        const { salary, savings, expenses } = data;
        
        // Simulate AI analysis (in a real app, call an API)
        setTimeout(() => {
            let tips = [];
            
            if (savings < salary * 0.2) {
                tips.push("💡 <strong>Increase Savings:</strong> Try to save at least 20% of your income.");
            }
            
            const highSpending = expenses.find(e => e.amount > salary * 0.3);
            if (highSpending) {
                tips.push(`💡 <strong>Reduce ${highSpending.name}:</strong> This category takes ${Math.round((highSpending.amount/salary)*100)}% of your income.`);
            }
            
            if (tips.length === 0) {
                tips.push("🎉 <strong>Great job!</strong> Your budget looks well-balanced.");
            }
            
            aiTipsSection.innerHTML = tips.map(tip => `<div class="ai-tip">${tip}</div>`).join('');
        }, 1000);
    }

    // Generate Annual Report
    generateAnnualBtn.addEventListener('click', function() {
        if (monthlyData.length < 2) {
            alert("Add at least 2 months of data to generate an annual report.");
            return;
        }
        
        resultSection.classList.add('hidden');
        annualReportSection.classList.remove('hidden');
        
        // Calculate annual totals
        const totalSalary = monthlyData.reduce((sum, month) => sum + month.salary, 0);
        const totalExpenses = monthlyData.reduce((sum, month) => sum + month.totalExpenses, 0);
        const totalSavings = monthlyData.reduce((sum, month) => sum + month.savings, 0);
        
        // Prepare annual report HTML
        let reportHTML = `
            <div class="summary-item">
                <span>Total Salary (Year):</span>
                <span>₹${totalSalary.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Total Expenses (Year):</span>
                <span>₹${totalExpenses.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Total Savings (Year):</span>
                <span>₹${totalSavings.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Average Monthly Savings:</span>
                <span>₹${(totalSavings/monthlyData.length).toFixed(2)}</span>
            </div>
            
            <h3 style="margin-top: 20px;">Monthly Breakdown</h3>
            <div class="monthly-breakdown">
                ${monthlyData.map(month => `
                    <div class="month-card">
                        <h4>${month.month}</h4>
                        <p>Salary: ₹${month.salary.toFixed(2)}</p>
                        <p>Expenses: ₹${month.totalExpenses.toFixed(2)}</p>
                        <p>Savings: ₹${month.savings.toFixed(2)}</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="ai-tip" style="margin-top: 20px;">
                <h3>🤖 Annual AI Insights</h3>
                ${generateAnnualAITips(totalSalary, totalSavings)}
            </div>
        `;
        
        annualDataSection.innerHTML = reportHTML;
    });

    // Generate Annual AI Tips
    function generateAnnualAITips(totalSalary, totalSavings) {
        const savingsRate = (totalSavings / totalSalary) * 100;
        let tips = [];
        
        if (savingsRate < 15) {
            tips.push("⚠️ <strong>Low Savings Rate:</strong> You're saving less than 15% of your income. Consider reducing discretionary spending.");
        } else if (savingsRate > 25) {
            tips.push("🎉 <strong>Excellent Savings Rate:</strong> You're saving more than 25% of your income! Consider investing some of these savings.");
        } else {
            tips.push("👍 <strong>Good Savings Rate:</strong> You're saving a healthy portion of your income. Keep it up!");
        }
        
        return tips.join('<br>');
    }

    // Helper Functions
    function addSummaryItem(container, label, value) {
        const item = document.createElement('div');
        item.className = 'summary-item';
        item.innerHTML = `<span>${label}:</span><span>${value}</span>`;
        container.appendChild(item);
    }

    function generateColors(count) {
        const colors = [];
        const hueStep = 360 / count;
        
        for (let i = 0; i < count; i++) {
            const hue = i * hueStep;
            colors.push(`hsl(${hue}, 70%, 65%)`);
        }
        
        return colors;
    }

    // Back to Analysis
    backToAnalysisBtn.addEventListener('click', function() {
        annualReportSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
    });

    // Add first expense field on load
    addExpenseBtn.click();
});