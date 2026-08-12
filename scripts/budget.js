/*
 * FinanceHub
 * Budget Module
 */

import {
    getBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getTransactions
} from "./storage.js";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const budgetForm =
    document.querySelector("#budget-form");

const budgetList =
    document.querySelector("#budget-list");

const totalBudgetElement =
    document.querySelector("#total-budget");

const totalSpentElement =
    document.querySelector("#total-budget-spent");

const remainingElement =
    document.querySelector("#budget-remaining");

const budgetMonthInput =
    document.querySelector("#budget-month");


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    setCurrentMonth();

    displayBudgets();

    updateBudgetSummary();

});


/* =========================================================
   SET CURRENT MONTH
   ========================================================= */

function setCurrentMonth() {

    if (!budgetMonthInput) {
        return;
    }


    const currentMonth =
        new Date()
            .toISOString()
            .slice(0, 7);


    budgetMonthInput.value =
        currentMonth;

}


/* =========================================================
   ADD BUDGET
   ========================================================= */

if (budgetForm) {

    budgetForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const formData =
                new FormData(budgetForm);


            const month =
                formData.get("month");


            const category =
                formData.get("category");


            const limit =
                Number(
                    formData.get("limit")
                );


            if (
                !month ||
                !category ||
                !limit ||
                limit <= 0
            ) {

                alert(
                    "Please enter a valid budget."
                );

                return;
            }


            /*
             * Check whether the same
             * category already exists
             * for the selected month.
             */

            const budgets =
                getBudgets();


            const existingBudget =
                budgets.find(
                    budget =>
                        budget.month === month &&
                        budget.category === category
                );


            if (existingBudget) {

                updateBudget(
                    existingBudget.id,
                    {
                        month,
                        category,
                        limit
                    }
                );


                alert(
                    "Budget updated successfully!"
                );

            } else {

                addBudget({
                    month,
                    category,
                    limit
                });


                alert(
                    "Budget created successfully!"
                );

            }


            budgetForm.reset();

            setCurrentMonth();

            displayBudgets();

            updateBudgetSummary();

        }
    );

}


/* =========================================================
   DISPLAY BUDGETS
   ========================================================= */

export function displayBudgets() {

    if (!budgetList) {
        return;
    }


    const budgets =
        getBudgets();


    if (budgets.length === 0) {

        budgetList.innerHTML = `
            <p class="empty-message">
                No budgets created yet.
            </p>
        `;

        return;
    }


    /*
     * Sort budgets by month
     * and category.
     */

    const sortedBudgets =
        [...budgets].sort(
            (a, b) => {

                if (
                    a.month === b.month
                ) {

                    return a.category.localeCompare(
                        b.category
                    );

                }

                return b.month.localeCompare(
                    a.month
                );

            }
        );


    budgetList.innerHTML =
        sortedBudgets
            .map(budget => {

                const spent =
                    calculateCategorySpent(
                        budget.month,
                        budget.category
                    );


                const remaining =
                    budget.limit - spent;


                let percentage =
                    budget.limit > 0
                        ? (spent / budget.limit) * 100
                        : 0;


                /*
                 * Allow progress to reach
                 * 100%, but not exceed it.
                 */

                const progress =
                    Math.min(
                        Math.max(
                            percentage,
                            0
                        ),
                        100
                    );


                let progressClass =
                    "";


                if (percentage >= 100) {

                    progressClass =
                        "budget-danger";

                } else if (percentage >= 80) {

                    progressClass =
                        "budget-warning";

                }


                const remainingClass =
                    remaining < 0
                        ? "expense-amount"
                        : "income-amount";


                return `

                    <article
                        class="budget-item">

                        <div
                            class="budget-item-header">

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

                            <strong>
                                ${formatCurrency(
                                    budget.limit
                                )}
                            </strong>

                        </div>


                        <div
                            class="budget-progress">

                            <div
                                class="budget-info">

                                <span>
                                    Spent:
                                    ${formatCurrency(
                                        spent
                                    )}
                                </span>

                                <span>
                                    ${percentage.toFixed(0)}%
                                </span>

                            </div>


                            <div
                                class="progress-bar">

                                <div
                                    class="progress-fill ${progressClass}"
                                    style="width: ${progress}%">
                                </div>

                            </div>


                            <div
                                class="budget-info">

                                <span>
                                    Remaining
                                </span>

                                <strong
                                    class="${remainingClass}">

                                    ${formatCurrency(
                                        remaining
                                    )}

                                </strong>

                            </div>

                        </div>


                        <div
                            class="form-buttons">

                            <button
                                type="button"
                                class="btn secondary-btn edit-budget"
                                data-id="${budget.id}">

                                Edit

                            </button>


                            <button
                                type="button"
                                class="btn secondary-btn delete-budget"
                                data-id="${budget.id}">

                                Delete

                            </button>

                        </div>

                    </article>

                `;

            })
            .join("");

}


/* =========================================================
   CALCULATE CATEGORY SPENDING
   ========================================================= */

function calculateCategorySpent(
    month,
    category
) {

    const transactions =
        getTransactions();


    return transactions
        .filter(transaction => {

            return (
                transaction.type === "expense" &&
                transaction.category === category &&
                transaction.date.startsWith(month)
            );

        })
        .reduce(
            (total, transaction) => {

                return total +
                    Number(
                        transaction.amount
                    );

            },
            0
        );

}


/* =========================================================
   UPDATE SUMMARY
   ========================================================= */

export function updateBudgetSummary() {

    const budgets =
        getBudgets();


    const currentMonth =
        new Date()
            .toISOString()
            .slice(0, 7);


    const currentBudgets =
        budgets.filter(
            budget =>
                budget.month === currentMonth
        );


    const totalBudget =
        currentBudgets.reduce(
            (total, budget) =>
                total +
                Number(budget.limit),
            0
        );


    const transactions =
        getTransactions();


    const totalSpent =
        transactions
            .filter(transaction => {

                return (
                    transaction.type === "expense" &&
                    transaction.date.startsWith(
                        currentMonth
                    )
                );

            })
            .reduce(
                (total, transaction) =>
                    total +
                    Number(
                        transaction.amount
                    ),
                0
            );


    const remaining =
        totalBudget - totalSpent;


    if (totalBudgetElement) {

        totalBudgetElement.textContent =
            formatCurrency(
                totalBudget
            );

    }


    if (totalSpentElement) {

        totalSpentElement.textContent =
            formatCurrency(
                totalSpent
            );

    }


    if (remainingElement) {

        remainingElement.textContent =
            formatCurrency(
                remaining
            );

    }

}


/* =========================================================
   DELETE BUDGET
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".delete-budget"
            );


        if (!button) {
            return;
        }


        const id =
            button.dataset.id;


        const confirmed =
            confirm(
                "Are you sure you want to delete this budget?"
            );


        if (!confirmed) {
            return;
        }


        deleteBudget(id);


        displayBudgets();

        updateBudgetSummary();

    }
);


/* =========================================================
   EDIT BUDGET
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".edit-budget"
            );


        if (!button) {
            return;
        }


        const id =
            button.dataset.id;


        const budgets =
            getBudgets();


        const budget =
            budgets.find(
                item =>
                    item.id === id
            );


        if (!budget) {
            return;
        }


        const newLimit =
            prompt(
                `Enter the new budget for ${budget.category}:`,
                budget.limit
            );


        if (
            newLimit === null ||
            newLimit === ""
        ) {
            return;
        }


        const numericLimit =
            Number(newLimit);


        if (
            Number.isNaN(
                numericLimit
            ) ||
            numericLimit <= 0
        ) {

            alert(
                "Please enter a valid amount."
            );

            return;
        }


        updateBudget(
            id,
            {
                limit: numericLimit
            }
        );


        displayBudgets();

        updateBudgetSummary();

    }
);


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
            year: "numeric",
            month: "long"
        }
    ).format(date);

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

