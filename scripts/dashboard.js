/*
 * FinanceHub
 * Dashboard Module
 */

import {
    getTransactions,
    getBudgets
} from "./storage.js";


/* =========================================================
   INITIALIZE DASHBOARD
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    updateDashboard();

});


/* =========================================================
   MAIN DASHBOARD FUNCTION
   ========================================================= */

function updateDashboard() {

    const transactions =
        getTransactions();

    const budgets =
        getBudgets();


    /* Calculate totals */

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
        totalIncome - totalExpenses;


    const monthlyBudget =
        calculateMonthlyBudget(
            budgets
        );


    const budgetRemaining =
        monthlyBudget - totalExpenses;


    /* Update dashboard */

    updateElement(
        "#total-income",
        formatCurrency(totalIncome)
    );


    updateElement(
        "#total-expenses",
        formatCurrency(totalExpenses)
    );


    updateElement(
        "#total-balance",
        formatCurrency(balance)
    );


    updateElement(
        "#monthly-budget",
        formatCurrency(monthlyBudget)
    );


    updateElement(
        "#budget-remaining",
        formatCurrency(budgetRemaining)
    );


    /* Recent transactions */

    displayRecentTransactions(
        transactions
    );


    /* Budget progress */

    updateBudgetProgress(
        totalExpenses,
        monthlyBudget
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
                total + Number(
                    transaction.amount
                ),
            0
        );

}


/* =========================================================
   CALCULATE MONTHLY BUDGET
   ========================================================= */

function calculateMonthlyBudget(
    budgets
) {

    const currentMonth =
        new Date()
            .toISOString()
            .slice(0, 7);


    return budgets
        .filter(
            budget =>
                budget.month === currentMonth
        )
        .reduce(
            (total, budget) =>
                total + Number(
                    budget.limit
                ),
            0
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
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 5);


    if (recentTransactions.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No transactions yet.
            </p>
        `;

        return;
    }


    container.innerHTML =
        recentTransactions
            .map(transaction => {

                const isIncome =
                    transaction.type === "income";


                const sign =
                    isIncome
                        ? "+"
                        : "-";


                const amountClass =
                    isIncome
                        ? "income-amount"
                        : "expense-amount";


                return `

                    <div class="transaction-item">

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
                                ·
                                ${formatDate(
                                    transaction.date
                                )}
                            </p>

                        </div>

                        <strong
                            class="transaction-amount ${amountClass}">

                            ${sign}${formatCurrency(
                                transaction.amount
                            )}

                        </strong>

                    </div>

                `;

            })
            .join("");

}


/* =========================================================
   UPDATE BUDGET PROGRESS
   ========================================================= */

function updateBudgetProgress(
    expenses,
    budget
) {

    const progress =
        document.querySelector(
            "#budget-progress"
        );


    const progressText =
        document.querySelector(
            "#budget-progress-text"
        );


    if (!progress) {
        return;
    }


    if (budget <= 0) {

        progress.style.width = "0%";

        if (progressText) {
            progressText.textContent =
                "No budget set";
        }

        return;
    }


    let percentage =
        (expenses / budget) * 100;


    percentage =
        Math.min(
            Math.max(percentage, 0),
            100
        );


    progress.style.width =
        `${percentage}%`;


    if (progressText) {

        progressText.textContent =
            `${percentage.toFixed(0)}% used`;

    }

}


/* =========================================================
   UPDATE ELEMENT
   ========================================================= */

function updateElement(
    selector,
    value
) {

    const element =
        document.querySelector(selector);


    if (element) {
        element.textContent = value;
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
            style: "currency",
            currency: "USD"
        }
    ).format(amount);

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(
    date
) {

    if (!date) {
        return "";
    }


    return new Intl.DateTimeFormat(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    ).format(
        new Date(`${date}T00:00:00`)
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;

}
