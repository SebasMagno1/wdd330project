/*
 * FinanceHub
 * Dashboard Module
 *
 * Displays:
 * - Total income
 * - Total expenses
 * - Balance
 * - Remaining budget
 * - Recent transactions
 */

import {
    getTransactions,
    getBudgets
} from "./storage.js";


/* =========================================================
   INITIALIZE DASHBOARD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateDashboard();

    }
);


/* =========================================================
   MAIN DASHBOARD FUNCTION
   ========================================================= */

function updateDashboard() {

    const transactions =
        getTransactions();

    const budgets =
        getBudgets();


    /* =====================================================
       CALCULATE TOTAL INCOME
       ===================================================== */

    const income =
        transactions
            .filter(
                transaction =>
                    transaction.type === "income"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(transaction.amount || 0),
                0
            );


    /* =====================================================
       CALCULATE TOTAL EXPENSES
       ===================================================== */

    const expenses =
        transactions
            .filter(
                transaction =>
                    transaction.type === "expense"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(transaction.amount || 0),
                0
            );


    /* =====================================================
       CALCULATE BALANCE
       ===================================================== */

    const balance =
        income - expenses;


    /* =====================================================
       CALCULATE TOTAL BUDGET
       ===================================================== */

    const totalBudget =
        budgets.reduce(
            (total, budget) =>
                total +
                Number(budget.limit || 0),
            0
        );


    /* =====================================================
       CALCULATE BUDGET REMAINING
       ===================================================== */

    const budgetRemaining =
        totalBudget - expenses;


    /* =====================================================
       UPDATE SUMMARY CARDS
       ===================================================== */

    updateElement(
        "#total-income",
        formatCurrency(income)
    );


    updateElement(
        "#total-expenses",
        formatCurrency(expenses)
    );


    updateElement(
        "#remaining-balance",
        formatCurrency(balance)
    );


    updateElement(
        "#budget-remaining",
        formatCurrency(budgetRemaining)
    );


    /* =====================================================
       UPDATE MONTHLY BUDGET
       ===================================================== */

    updateElement(
        "#monthly-budget",
        formatCurrency(totalBudget)
    );


    updateElement(
        "#budget-spent",
        formatCurrency(expenses)
    );


    /* =====================================================
       UPDATE BUDGET PROGRESS
       ===================================================== */

    updateBudgetProgress(
        totalBudget,
        expenses
    );


    /* =====================================================
       DISPLAY RECENT TRANSACTIONS
       ===================================================== */

    displayRecentTransactions(
        transactions
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

        console.warn(
            `Dashboard element not found: ${selector}`
        );

        return;

    }


    element.textContent =
        value;

}


/* =========================================================
   UPDATE BUDGET PROGRESS
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
   DISPLAY RECENT TRANSACTIONS
   ========================================================= */

function displayRecentTransactions(
    transactions
) {

    const container =
        document.querySelector(
            "#recent-transactions"
        );


    if (!container) {

        console.warn(
            "Recent transactions container not found."
        );

        return;

    }


    /* =====================================================
       SORT TRANSACTIONS
       ===================================================== */

    const recentTransactions =
        [...transactions]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 5);


    /* =====================================================
       EMPTY STATE
       ===================================================== */

    if (
        recentTransactions.length === 0
    ) {

        container.innerHTML = `
            <p class="empty-message">
                No recent transactions.
            </p>
        `;

        return;

    }


    /* =====================================================
       RENDER TRANSACTIONS
       ===================================================== */

    container.innerHTML =
        recentTransactions
            .map(
                transaction =>
                    createTransactionHTML(
                        transaction
                    )
            )
            .join("");

}


/* =========================================================
   CREATE TRANSACTION HTML
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