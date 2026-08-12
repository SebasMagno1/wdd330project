/*
 * FinanceHub
 * Dashboard Module
 *
 * Displays:
 * - Total income
 * - Total expenses
 * - Balance
 * - Current month budget
 * - Current month budget remaining
 * - Recent transactions
 */

import {
    getTransactions,
    getBudgets
} from "./storage.js";


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    updateDashboard
);


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const transactions =
        getTransactions();

    const budgets =
        getBudgets();


    /* -----------------------------------------------------
       CURRENT MONTH
       Format: YYYY-MM
       ----------------------------------------------------- */

    const currentMonth =
        getCurrentMonth();


    /* -----------------------------------------------------
       TOTAL INCOME
       ----------------------------------------------------- */

    const totalIncome =
        transactions
            .filter(
                transaction =>
                    transaction.type ===
                    "income"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


    /* -----------------------------------------------------
       TOTAL EXPENSES
       ----------------------------------------------------- */

    const totalExpenses =
        transactions
            .filter(
                transaction =>
                    transaction.type ===
                    "expense"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


    /* -----------------------------------------------------
       BALANCE
       ----------------------------------------------------- */

    const balance =
        totalIncome -
        totalExpenses;


    /* -----------------------------------------------------
       CURRENT MONTH BUDGETS
       ----------------------------------------------------- */

    const currentMonthBudgets =
        budgets.filter(
            budget =>
                budget.month ===
                currentMonth
        );


    /* -----------------------------------------------------
       CURRENT MONTH BUDGET TOTAL
       ----------------------------------------------------- */

    const monthlyBudget =
        currentMonthBudgets.reduce(
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
                transaction => {

                    return (
                        transaction.type ===
                            "expense" &&

                        transaction.date
                            ?.substring(0, 7) ===
                            currentMonth
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


    /* -----------------------------------------------------
       REMAINING MONTHLY BUDGET
       ----------------------------------------------------- */

    const budgetRemaining =
        monthlyBudget -
        monthlyExpenses;


    /* -----------------------------------------------------
       SUMMARY CARDS
       ----------------------------------------------------- */

    updateElement(
        "#total-income",
        formatCurrency(
            totalIncome
        )
    );


    updateElement(
        "#total-expenses",
        formatCurrency(
            totalExpenses
        )
    );


    updateElement(
        "#remaining-balance",
        formatCurrency(
            balance
        )
    );


    updateElement(
        "#budget-remaining",
        formatCurrency(
            budgetRemaining
        )
    );


    /* -----------------------------------------------------
       MONTHLY BUDGET SECTION
       ----------------------------------------------------- */

    updateElement(
        "#monthly-budget",
        formatCurrency(
            monthlyBudget
        )
    );


    updateElement(
        "#budget-spent",
        formatCurrency(
            monthlyExpenses
        )
    );


    /* -----------------------------------------------------
       BUDGET PROGRESS
       ----------------------------------------------------- */

    updateBudgetProgress(
        monthlyBudget,
        monthlyExpenses
    );


    /* -----------------------------------------------------
       RECENT TRANSACTIONS
       ----------------------------------------------------- */

    displayRecentTransactions(
        transactions
    );
}


/* =========================================================
   CURRENT MONTH
   ========================================================= */

function getCurrentMonth() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}`;
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

        progress.style.width =
            "0%";

        return;
    }


    const percentage =
        Math.min(
            (spent / budget) * 100,
            100
        );


    progress.style.width =
        `${percentage}%`;
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
                    new Date(
                        b.date
                    ) -
                    new Date(
                        a.date
                    )
            )
            .slice(
                0,
                5
            );


    if (
        recentTransactions.length ===
        0
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
        transaction.type ===
        "income";


    const typeClass =
        isIncome
            ? "income"
            : "expense";


    const sign =
        isIncome
            ? "+"
            : "-";


    const typeLabel =
        isIncome
            ? "Income"
            : "Expense";


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
   FORMAT DATE
   ========================================================= */

function formatDate(
    date
) {

    if (!date) {
        return "No date";
    }


    const parsedDate =
        new Date(
            `${date}T00:00:00`
        );


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return date;
    }


    return parsedDate.toLocaleDateString(
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
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}