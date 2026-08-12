/*
 * FinanceHub
 * Budget Module
 *
 * Handles:
 * - Creating budgets
 * - Displaying budgets
 * - Calculating spending
 * - Calculating remaining budget
 * - Deleting budgets
 */

import {
    getBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getTransactions
} from "./storage.js";


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeBudget();

});


/* =========================================================
   INITIALIZE BUDGET
   ========================================================= */

function initializeBudget() {

    setupBudgetForm();

    displayBudgets();

}


/* =========================================================
   BUDGET FORM
   ========================================================= */

function setupBudgetForm() {

    const budgetForm =
        document.querySelector("#budget-form");

    if (!budgetForm) {
        return;
    }

    budgetForm.addEventListener(
        "submit",
        handleBudgetSubmit
    );

}


/* =========================================================
   ADD BUDGET
   ========================================================= */

function handleBudgetSubmit(event) {

    event.preventDefault();


    const month =
        document.querySelector(
            "#budget-month"
        )?.value;


    const category =
        document.querySelector(
            "#budget-category"
        )?.value;


    const limit =
        Number(
            document.querySelector(
                "#budget-limit"
            )?.value
        );


    /* -----------------------------------------------------
       VALIDATION
       ----------------------------------------------------- */

    if (
        !month ||
        !category ||
        !Number.isFinite(limit) ||
        limit <= 0
    ) {

        alert(
            "Please complete all budget fields with valid information."
        );

        return;

    }


    /* -----------------------------------------------------
       CHECK FOR DUPLICATE BUDGET
       ----------------------------------------------------- */

    const budgets =
        getBudgets();


    const existingBudget =
        budgets.find(
            budget =>
                budget.month === month &&
                budget.category === category
        );


    if (existingBudget) {

        alert(
            "A budget already exists for this category and month."
        );

        return;

    }


    /* -----------------------------------------------------
       CREATE BUDGET
       ----------------------------------------------------- */

    const budget = {

        month,

        category,

        limit

    };


    /* -----------------------------------------------------
       SAVE
       ----------------------------------------------------- */

    const savedBudget =
        addBudget(budget);


    if (!savedBudget) {

        alert(
            "Unable to save the budget."
        );

        return;

    }


    /* -----------------------------------------------------
       RESET
       ----------------------------------------------------- */

    event.target.reset();


    /* -----------------------------------------------------
       UPDATE DISPLAY
       ----------------------------------------------------- */

    displayBudgets();


    alert(
        "Budget saved successfully."
    );

}


/* =========================================================
   DISPLAY BUDGETS
   ========================================================= */

function displayBudgets() {

    const budgetList =
        document.querySelector(
            "#budget-list"
        );


    if (!budgetList) {
        return;
    }


    const budgets =
        getBudgets();


    /* -----------------------------------------------------
       SORT BUDGETS
       ----------------------------------------------------- */

    budgets.sort(
        (a, b) =>
            b.month.localeCompare(
                a.month
            )
    );


    /* -----------------------------------------------------
       EMPTY STATE
       ----------------------------------------------------- */

    if (budgets.length === 0) {

        budgetList.innerHTML = `
            <p class="empty-message">
                No budgets created yet.
            </p>
        `;

        updateBudgetSummary([]);

        return;

    }


    /* -----------------------------------------------------
       RENDER
       ----------------------------------------------------- */

    budgetList.innerHTML =
        budgets
            .map(
                budget =>
                    createBudgetHTML(
                        budget
                    )
            )
            .join("");


    setupBudgetDeleteButtons();

    updateBudgetSummary(budgets);

}


/* =========================================================
   CREATE BUDGET HTML
   ========================================================= */

function createBudgetHTML(
    budget
) {

    const spent =
        calculateBudgetSpent(
            budget
        );


    const remaining =
        Number(budget.limit) -
        spent;


    const percentage =
        budget.limit > 0
            ? Math.min(
                (spent /
                    budget.limit) *
                    100,
                100
            )
            : 0;


    const statusClass =
        percentage >= 100
            ? "over-budget"
            : percentage >= 80
                ? "warning"
                : "on-track";


    return `
        <article
            class="budget-item ${statusClass}"
        >

            <div class="budget-header">

                <div>

                    <h3>
                        ${escapeHTML(
                            budget.category
                        )}
                    </h3>

                    <p>
                        ${formatMonth(
                            budget.month
                        )}
                    </p>

                </div>


                <button
                    type="button"
                    class="delete-budget"
                    data-id="${budget.id}"
                >
                    Delete
                </button>

            </div>


            <div class="budget-values">

                <div>
                    <span>Budget</span>
                    <strong>
                        ${formatCurrency(
                            budget.limit
                        )}
                    </strong>
                </div>


                <div>
                    <span>Spent</span>
                    <strong>
                        ${formatCurrency(
                            spent
                        )}
                    </strong>
                </div>


                <div>
                    <span>Remaining</span>
                    <strong>
                        ${formatCurrency(
                            remaining
                        )}
                    </strong>
                </div>

            </div>


            <div
                class="budget-progress"
                aria-label="Budget progress"
            >

                <div
                    class="budget-progress-bar"
                    style="width: ${percentage}%"
                ></div>

            </div>


            <p class="budget-percentage">
                ${percentage.toFixed(0)}% used
            </p>

        </article>
    `;

}


/* =========================================================
   CALCULATE BUDGET SPENDING
   ========================================================= */

function calculateBudgetSpent(
    budget
) {

    const transactions =
        getTransactions();


    return transactions
        .filter(
            transaction => {

                const sameType =
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
                    sameType &&
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
   BUDGET SUMMARY
   ========================================================= */

function updateBudgetSummary(
    budgets
) {

    const totalBudget =
        budgets.reduce(
            (total, budget) =>
                total +
                Number(
                    budget.limit || 0
                ),
            0
        );


    const totalSpent =
        budgets.reduce(
            (total, budget) =>
                total +
                calculateBudgetSpent(
                    budget
                ),
            0
        );


    const totalRemaining =
        totalBudget -
        totalSpent;


    updateElement(
        "#total-budget",
        formatCurrency(
            totalBudget
        )
    );


    updateElement(
        "#total-budget-spent",
        formatCurrency(
            totalSpent
        )
    );


    updateElement(
        "#total-budget-remaining",
        formatCurrency(
            totalRemaining
        )
    );

}


/* =========================================================
   DELETE BUDGET
   ========================================================= */

function setupBudgetDeleteButtons() {

    const buttons =
        document.querySelectorAll(
            ".delete-budget"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const id =
                    button.dataset.id;


                const confirmed =
                    confirm(
                        "Are you sure you want to delete this budget?"
                    );


                if (!confirmed) {
                    return;
                }


                const deleted =
                    deleteBudget(id);


                if (!deleted) {

                    alert(
                        "Budget could not be deleted."
                    );

                    return;

                }


                displayBudgets();

            }
        );

    });

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


    element.textContent = value;

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
            month: "long"
        }
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

