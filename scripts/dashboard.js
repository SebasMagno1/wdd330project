/*
 * FinanceHub
 * Dashboard Module
 *
 * Responsibilities:
 * - Summary cards
 * - Income / Expense chart
 * - Current month budget
 * - Recent transactions
 */

import {
    getTransactions,
    getBudgets
} from "./storage.js";


/* =========================================================
   CONFIGURATION
   ========================================================= */

const CURRENCY = "USD";

let incomeExpenseChart = null;


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);


function initializeDashboard() {

    const transactions =
        getTransactions();

    const budgets =
        getBudgets();

    const currentMonth =
        getCurrentMonth();


    updateSummary(
        transactions,
        budgets,
        currentMonth
    );


    displayRecentTransactions(
        transactions
    );


    createIncomeExpenseChart(
        transactions,
        currentMonth
    );
}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary(
    transactions,
    budgets,
    currentMonth
) {

    const totalIncome =
        calculateTotal(
            transactions,
            "income"
        );


    const totalExpenses =
        calculateTotal(
            transactions,
            "expense"
        );


    const balance =
        totalIncome -
        totalExpenses;


    /* -----------------------------------------------------
       CURRENT MONTH BUDGET
       ----------------------------------------------------- */

    const monthlyBudgets =
        budgets.filter(
            budget =>
                budget.month ===
                currentMonth
        );


    const totalBudget =
        monthlyBudgets.reduce(
            (total, budget) =>
                total +
                Number(
                    budget.limit || 0
                ),
            0
        );


    /* -----------------------------------------------------
       CURRENT MONTH EXPENSES
       ----------------------------------------------------- */

    const monthlyExpenses =
        transactions
            .filter(
                transaction =>
                    transaction.type ===
                    "expense" &&
                    transaction.date?.startsWith(
                        currentMonth
                    )
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );




    const budgetRemaining =
        totalBudget -
        monthlyExpenses;


    /* -----------------------------------------------------
       UPDATE CARDS
       ----------------------------------------------------- */

    updateElement(
        "#total-income",
        formatCurrency(totalIncome)
    );


    updateElement(
        "#total-expenses",
        formatCurrency(totalExpenses)
    );


    updateElement(
        "#remaining-balance",
        formatCurrency(balance)
    );


    

    updateElement(
        "#monthly-budget",
        formatCurrency(totalBudget)
    );


    updateElement(
        "#budget-spent",
        formatCurrency(monthlyExpenses)
    );


    updateElement(
        "#budget-remaining",
        formatCurrency(budgetRemaining)
    );


    updateBudgetProgress(
        totalBudget,
        monthlyExpenses
    );
   
}


/* =========================================================
   CALCULATE TOTAL
   ========================================================= */

function calculateTotal(
    transactions,
    type
) {

    return transactions
        .filter(
            transaction =>
                transaction.type === type
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
   BUDGET PROGRESS
   ========================================================= */

function updateBudgetProgress(
    budget,
    spent
) {

    const progress =
        document.querySelector(
            "#budget-progress"
        );


    if (!progress) {
        return;
    }


    if (
        !Number.isFinite(budget) ||
        budget <= 0
    ) {

        progress.style.width = "0%";

        progress.setAttribute(
            "aria-valuenow",
            "0"
        );

        return;
    
    }


    const percentage =
        Math.min(
            Math.max(
                (spent / budget) * 100,
                0
            ),
            100
        );


    progress.style.width =
        `${percentage}%`;


    progress.setAttribute(
        "aria-valuenow",
        percentage.toFixed(0)
    );


    progress.setAttribute(
        "aria-valuemax",
        "100"
    );
}


/* =========================================================
   RECENT TRANSACTIONS
   ========================================================= */

function displayRecentTransactions(
    transactions
) {

    const container =
        document.querySelector(
            "#recent-transactions"
        );


    if (!container) {
    
        return;
    
    }




    const recentTransactions =
        [...transactions]
            .sort(
                (a, b) =>
                    getDateValue(b.date) -
                    getDateValue(a.date)
            )
            .slice(0, 5);

        if(
            recentTransactions.length === 0
        ) {

        container.innerHTML = `
            <p class="empty-message">
                No recent transactions.
            </p>
        `;

        return;

    }




    container.innerHTML =
        recentTransactions
            .map(
                createTransactionHTML
            )
            .join("");

        }


/* =========================================================
   TRANSACTION HTML
   ========================================================= */

function createTransactionHTML(
    transaction
) {

    const isIncome =
        transaction.type === "income";


    const typeClass =
        isIncome
            ? "income"
            : "expense";

    const typeLabel =
        isIncome
            ? "Income"
            : "Expense";


    const sign =
        isIncome
            ? "+"
            : "-";

            
    return `
        <article
            class="transaction-item ${typeClass}"
        >

            <div class="transaction-info">

                <h3>
                    ${escapeHTML(
                        transaction.description
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        transaction.category
                    )}
                </p>

                <small>
                    ${formatDate(
                        transaction.date
                    )}
                </small>

            </div>


            <div class="transaction-amount">

                <span class="transaction-type">
                    ${typeLabel}
                </span>

                <strong>
                    ${sign}${formatCurrency(
                        transaction.amount
                    )}
                </strong>

            </div>

        </article>
    `;
}


/* =========================================================
   INCOME VS EXPENSES CHART
   ========================================================= */

function createIncomeExpenseChart(
    transactions,
    currentMonth
) {

    const canvas =
        document.querySelector(
            "#income-expense-chart"
        );


    if (!canvas) {
        return;
    }


    /*
     * Use current month data.
     */

    const monthlyTransactions =
        transactions.filter(
            transaction =>
                transaction.date?.startsWith(
                    currentMonth
                )
        );


    const income =
        calculateTotal(
            monthlyTransactions,
            "income"
        );


    const expenses =
        calculateTotal(
            monthlyTransactions,
            "expense"
        );


    /*
     * Make sure Chart.js is loaded.
     */

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js is not loaded."
        );

        return;
    }


    if (incomeExpenseChart) {

        incomeExpenseChart.destroy();

    }


    incomeExpenseChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: [
                        "Income",
                        "Expenses"
                    ],

                    datasets: [
                        {
                            label:
                                "Current Month",

                            data: [
                                income,
                                expenses
                            ]
                        }
                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

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


    if (!element) {
        return;
    }


    element.textContent =
        value;
}


/* =========================================================
   CURRENT MONTH
   ========================================================= */

function getCurrentMonth() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}`;
}


/* =========================================================
   DATE VALUE
   ========================================================= */

function getDateValue(
    dateString
) {

    if (!dateString) {
        return 0;
    }


    const value =
        new Date(
            `${dateString}T00:00:00`
        ).getTime();


    return Number.isNaN(value)
        ? 0
        : value;
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
            currency: CURRENCY
        }
    ).format(
        Number(amount) || 0
    );

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(
    dateString
) {

    if (!dateString) {
        return "No date";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;
    }


    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }

    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

    }

