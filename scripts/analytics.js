/*
 * FinanceHub
 * Analytics Module
 *
 * Displays:
 * - Spending by Category
 * - Income vs Expenses
 * - Budget Usage
 * - Monthly Spending Trend
 */

import {
    getTransactions,
    getBudgets
} from "./storage.js";


/* =========================================================
   GLOBAL CHART REFERENCES
   ========================================================= */

let categoryChart = null;
let incomeExpenseChart = null;
let budgetChart = null;
let monthlyTrendChart = null;


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeAnalytics();

    }
);


/* =========================================================
   INITIALIZE ANALYTICS
   ========================================================= */

function initializeAnalytics() {

    setupAnalyticsFilter();

    setDefaultMonth();

    updateAnalytics();

}


/* =========================================================
   FILTER FORM
   ========================================================= */

function setupAnalyticsFilter() {

    const filterForm =
        document.querySelector(
            "#analytics-filter-form"
        );


    if (!filterForm) {
        return;
    }


    filterForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            updateAnalytics();

        }
    );

}


/* =========================================================
   DEFAULT MONTH
   ========================================================= */

function setDefaultMonth() {

    const monthInput =
        document.querySelector(
            "#analytics-month"
        );


    if (
        !monthInput ||
        monthInput.value
    ) {
        return;
    }


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    monthInput.value =
        `${year}-${month}`;

}


/* =========================================================
   MAIN ANALYTICS FUNCTION
   ========================================================= */

function updateAnalytics() {

    const transactions =
        getTransactions();


    const budgets =
        getBudgets();


    const selectedMonth =
        document.querySelector(
            "#analytics-month"
        )?.value || "";


    const filteredTransactions =
        selectedMonth
            ? transactions.filter(
                transaction =>
                    transaction.date?.startsWith(
                        selectedMonth
                    )
            )
            : transactions;


    updateSummary(
        filteredTransactions
    );


    createCategoryChart(
        filteredTransactions
    );


    createIncomeExpenseChart(
        filteredTransactions
    );


    createBudgetChart(
        budgets,
        selectedMonth
    );


    createMonthlyTrendChart(
        transactions
    );

}


/* =========================================================
   UPDATE SUMMARY
   ========================================================= */

function updateSummary(
    transactions
) {

    const income =
        transactions
            .filter(
                transaction =>
                    transaction.type === "income"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


    const expenses =
        transactions
            .filter(
                transaction =>
                    transaction.type === "expense"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


    const balance = income - expenses;

    updateElement(
        "#analytics-income",
        formatCurrency(income)
    );


    updateElement(
        "#analytics-expenses",
        formatCurrency(expenses)
    );


    updateElement(
        "#analytics-balance",
        formatCurrency(balance)
    );
}




/* =========================================================
   SPENDING BY CATEGORY
   ========================================================= */

function createCategoryChart(
    transactions
) {

    const canvas =
        document.querySelector(
            "#spending-category-chart"
        );


    if (!canvas) {
        return;
    }


    const categoryTotals = {};


    transactions
        .filter(
            transaction =>
                transaction.type === "expense"
        )
        .forEach(
            transaction => {

                const category =
                    transaction.category ||
                    "Other";


                categoryTotals[category] =
                    (
                        categoryTotals[category] ||
                        0
                    ) +
                    Number(
                        transaction.amount || 0
                    );

            }
        );


    const labels =
        Object.keys(
            categoryTotals
        );


    const values =
        Object.values(
            categoryTotals
        );


    if (categoryChart) {

        categoryChart.destroy();

    }


    categoryChart =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels,

                    datasets: [
                        {
                            label:
                                "Spending",

                            data: values
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            position: "bottom"
                        }

                    }

                }

            }
        );

}


/* =========================================================
   INCOME VS EXPENSES
   ========================================================= */

function createIncomeExpenseChart(
    transactions
) {

    const canvas =
        document.querySelector(
            "#income-expense-chart"
        );


    if (!canvas) {
        return;
    }


    const income =
        transactions
            .filter(
                transaction =>
                    transaction.type === "income"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


    const expenses =
        transactions
            .filter(
                transaction =>
                    transaction.type === "expense"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


    if (incomeExpenseChart) {

        incomeExpenseChart.destroy();

    }


    incomeExpenseChart =
        new Chart(
            canvas,{
                type: "bar",

                data: {

                    labels: [
                        "Income",
                        "Expenses"
                    ],

                    
                    
                datasets: [
                    {
                        label:
                            "Amount",

                            data: [
                                income,
                                expenses
                            ]
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {
                            beginAtZero: true
                        }

                    }

                }

            }
        );

}


/* =========================================================
   BUDGET USAGE
   ========================================================= */

function createBudgetChart(
    budgets,
    selectedMonth
) {

    const canvas =
        document.querySelector(
            "#budget-usage-chart"
        );


    if (!canvas) {
        return;
    }


    let filteredBudgets =
        budgets;


    if (selectedMonth) {

        filteredBudgets =
            budgets.filter(
                budget =>
                    budget.month ===
                    selectedMonth
            );

    }


    const labels =
        filteredBudgets.map(
            budget =>
                budget.category
        );


    const budgetValues =
        filteredBudgets.map(
            budget =>
                Number(
                    budget.limit || 0
                )
        );


    const spentValues =
        filteredBudgets.map(
            budget =>
                calculateBudgetSpent(
                    budget
                )
        );


    if (budgetChart) {

        budgetChart.destroy();

    }


    budgetChart =
        new Chart(
            canvas,{
                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {
                            label:
                                "Budget",

                            data:
                                budgetValues
                        },

                        {
                            label:
                                "Spent",

                            data:
                                spentValues
                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {
                            beginAtZero: true
                        }

                    }

                }

            }
        );

}


/* =========================================================
   CALCULATE BUDGET SPENT
   ========================================================= */

function calculateBudgetSpent(
    budget
) {

    const transactions =
        getTransactions();


    return transactions
        .filter(
            transaction => {

                const isExpense =
                    transaction.type ===
                    "expense";


                const sameCategory =
                    transaction.category ===
                    budget.category;


                const transactionMonth =
                    transaction.date
                        ?.substring(0, 7);


                const sameMonth =
                    transactionMonth ===
                    budget.month;


                return (
                    isExpense &&
                    sameCategory &&
                    sameMonth
                );

            }
        )
        .reduce(
            (total, transaction) =>
                total +
                Number(
                    transaction.amount || 0
                ),
            0
        );

}


/* =========================================================
   MONTHLY SPENDING TREND
   ========================================================= */

function createMonthlyTrendChart(
    transactions
) {

    const canvas =
        document.querySelector(
            "#monthly-trend-chart"
        );


    if (!canvas) {
        return;
    }


    const monthlyTotals = {};


    transactions
        .filter(
            transaction =>
                transaction.type === "expense"
        )
        .forEach(
            transaction => {

                const month =
                    transaction.date
                        ?.substring(0, 7);


                if (!month) {
                    return;
                }


                monthlyTotals[month] =
                    (
                        monthlyTotals[month] ||
                        0
                    ) +
                    Number(
                        transaction.amount || 0
                    );

            }
        );


    const labels =
        Object.keys(
            monthlyTotals
        ).sort();


    const values =
        labels.map(
            month =>
                monthlyTotals[month]
        );


    if (monthlyTrendChart) {

        monthlyTrendChart.destroy();

    }


    monthlyTrendChart =
        new Chart(
            canvas,
            {
                type: "line",

                data: {

                    labels:
                        labels.map(
                            formatMonth
                        ),

                    datasets: [
                        {
                            label:
                                "Monthly Spending",

                            data:
                                values,

                            tension: 0.3,

                            fill: false
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {
                            beginAtZero: true
                        }

                    }

                }

            }
        );

}


/* =========================================================
   UPDATE ELEMENT
   ========================================================= */

function updateElement(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );


    if (!element) {
        return;
    }


    element.textContent =
        value;

}




/* =========================================================
   FORMAT CURRENCY
   ========================================================= */

function formatCurrency(
    amount
) {

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD"
        }
    ).format(
        Number(amount) || 0
    );

}


/* =========================================================
   FORMAT MONTH
   ========================================================= */

function formatMonth(month) {

    const date =
        new Date(
            `${month}-01T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return month;

    }


    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short"
        }
    );

}

