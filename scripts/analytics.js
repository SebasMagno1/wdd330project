/*
 * FinanceHub
 * Analytics Module
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


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    createAnalytics();

});


/* =========================================================
   MAIN ANALYTICS FUNCTION
   ========================================================= */

function createAnalytics() {

    const transactions =
        getTransactions();

    const budgets =
        getBudgets();


    updateAnalyticsSummary(
        transactions,
        budgets
    );


    createCategoryChart(
        transactions
    );


    createIncomeExpenseChart(
        transactions
    );


    createBudgetChart(
        transactions,
        budgets
    );

}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateAnalyticsSummary(
    transactions,
    budgets
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
                    Number(transaction.amount),
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
                    Number(transaction.amount),
                0
            );


    const balance =
        income - expenses;


    const budget =
        budgets.reduce(
            (total, item) =>
                total +
                Number(item.limit),
            0
        );


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


    updateElement(
        "#analytics-budget",
        formatCurrency(budget)
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
            "#category-chart"
        );


    if (!canvas) {
        return;
    }


    const expenses =
        transactions.filter(
            transaction =>
                transaction.type === "expense"
        );


    const categories = {};


    expenses.forEach(
        transaction => {

            const category =
                transaction.category ||
                "Other";


            if (!categories[category]) {

                categories[category] = 0;

            }


            categories[category] +=
                Number(transaction.amount);

        }
    );


    const labels =
        Object.keys(categories);


    const values =
        Object.values(categories);


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

                            data:
                                values
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    context => {

                                        const value =
                                            context.raw;

                                        return `
                                            ${context.label}:
                                            ${formatCurrency(value)}
                                        `;

                                    }

                            }

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


    const monthlyData =
        {};


    transactions.forEach(
        transaction => {

            const month =
                transaction.date
                    ?.substring(0, 7);


            if (!month) {
                return;
            }


            if (!monthlyData[month]) {

                monthlyData[month] = {

                    income: 0,

                    expense: 0

                };

            }


            if (
                transaction.type ===
                "income"
            ) {

                monthlyData[month].income +=
                    Number(
                        transaction.amount
                    );

            }


            if (
                transaction.type ===
                "expense"
            ) {

                monthlyData[month].expense +=
                    Number(
                        transaction.amount
                    );

            }

        }
    );


    const months =
        Object.keys(
            monthlyData
        ).sort();


    const incomeValues =
        months.map(
            month =>
                monthlyData[month].income
        );


    const expenseValues =
        months.map(
            month =>
                monthlyData[month].expense
        );


    if (incomeExpenseChart) {

        incomeExpenseChart.destroy();

    }


    incomeExpenseChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        months.map(
                            formatMonth
                        ),

                    datasets: [

                        {
                            label:
                                "Income",

                            data:
                                incomeValues
                        },

                        {
                            label:
                                "Expenses",

                            data:
                                expenseValues
                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    value =>
                                        formatCurrency(
                                            value
                                        )

                            }

                        }

                    },

                    plugins: {

                        tooltip: {

                            callbacks: {

                                label:
                                    context =>
                                        `${context.dataset.label}: ${formatCurrency(context.raw)}`

                            }

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
    transactions,
    budgets
) {

    const canvas =
        document.querySelector(
            "#budget-chart"
        );


    if (!canvas) {
        return;
    }


    const budgetData =
        budgets.map(
            budget => {

                const spent =
                    transactions
                        .filter(
                            transaction => {

                                return (

                                    transaction.type ===
                                    "expense"

                                    &&

                                    transaction.category ===
                                    budget.category

                                    &&

                                    transaction.date
                                        ?.startsWith(
                                            budget.month
                                        )

                                );

                            }
                        )
                        .reduce(
                            (total, transaction) =>
                                total +
                                Number(
                                    transaction.amount
                                ),
                            0
                        );


                return {

                    category:
                        budget.category,

                    budget:
                        Number(
                            budget.limit
                        ),

                    spent

                };

            }
        );


    const labels =
        budgetData.map(
            item =>
                item.category
        );


    const budgetValues =
        budgetData.map(
            item =>
                item.budget
        );


    const spentValues =
        budgetData.map(
            item =>
                item.spent
        );


    if (budgetChart) {

        budgetChart.destroy();

    }


    budgetChart =
        new Chart(
            canvas,
            {

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

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    value =>
                                        formatCurrency(
                                            value
                                        )

                            }

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


    if (element) {

        element.textContent =
            value;

    }

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

            style:
                "currency",

            currency:
                "USD"

        }
    ).format(amount);

}


/* =========================================================
   FORMAT MONTH
   ========================================================= */

function formatMonth(
    month
) {

    if (!month) {
        return "";
    }


    const date =
        new Date(
            `${month}-01T00:00:00`
        );


    return new Intl.DateTimeFormat(
        "en-US",
        {

            month:
                "short",

            year:
                "numeric"

        }
    ).format(date);

}

