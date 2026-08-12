/*
 * FinanceHub
 * Transactions Module
 */

import {
    addTransaction,
    getTransactions,
    deleteTransaction
} from "./storage.js";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const incomeForm = document.querySelector("#income-form");
const expenseForm = document.querySelector("#expense-form");

const transactionsList =
    document.querySelector("#transactions-list");

const incomeList =
    document.querySelector("#income-list");

const expenseList =
    document.querySelector("#expense-list");

const filterForm =
    document.querySelector("#transaction-filters");

const clearFiltersButton =
    document.querySelector("#clear-filters");


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    setDefaultDates();

    displayTransactions();

    displayIncome();

    displayExpenses();

});


/* =========================================================
   DEFAULT DATE
   ========================================================= */

function setDefaultDates() {

    const today = new Date()
        .toISOString()
        .split("T")[0];

    const incomeDate =
        document.querySelector("#income-date");

    const expenseDate =
        document.querySelector("#expense-date");

    if (incomeDate) {
        incomeDate.value = today;
    }

    if (expenseDate) {
        expenseDate.value = today;
    }
}


/* =========================================================
   ADD INCOME
   ========================================================= */

if (incomeForm) {

    incomeForm.addEventListener("submit", event => {

        event.preventDefault();

        const formData = new FormData(incomeForm);

        const income = {

            type: "income",

            description:
                formData.get("description").trim(),

            amount:
                Number(formData.get("amount")),

            category:
                formData.get("category"),

            date:
                formData.get("date"),

            notes:
                formData.get("notes") || ""

        };


        if (
            !income.description ||
            !income.amount ||
            !income.category ||
            !income.date
        ) {

            alert("Please complete all required fields.");

            return;
        }


        addTransaction(income);

        alert("Income saved successfully!");

        incomeForm.reset();

        setDefaultDates();

        displayIncome();

    });
}


/* =========================================================
   ADD EXPENSE
   ========================================================= */

if (expenseForm) {

    expenseForm.addEventListener("submit", event => {

        event.preventDefault();

        const formData = new FormData(expenseForm);

        const expense = {

            type: "expense",

            description:
                formData.get("description").trim(),

            amount:
                Number(formData.get("amount")),

            category:
                formData.get("category"),

            date:
                formData.get("date"),

            paymentMethod:
                formData.get("paymentMethod") || "",

            notes:
                formData.get("notes") || ""

        };


        if (
            !expense.description ||
            !expense.amount ||
            !expense.category ||
            !expense.date
        ) {

            alert("Please complete all required fields.");

            return;
        }


        addTransaction(expense);

        alert("Expense saved successfully!");

        expenseForm.reset();

        setDefaultDates();

        displayExpenses();

    });
}


/* =========================================================
   DISPLAY ALL TRANSACTIONS
   ========================================================= */

export function displayTransactions(
    transactions = getTransactions()
) {

    if (!transactionsList) {
        return;
    }


    const sortedTransactions = [...transactions].sort(
        (a, b) =>
            new Date(b.date) - new Date(a.date)
    );


    if (sortedTransactions.length === 0) {

        transactionsList.innerHTML = `
            <tr>
                <td colspan="6">
                    No transactions available.
                </td>
            </tr>
        `;

        return;
    }


    transactionsList.innerHTML =
        sortedTransactions.map(transaction => {

            const amount =
                formatCurrency(transaction.amount);

            const typeClass =
                transaction.type === "income"
                    ? "income-amount"
                    : "expense-amount";

            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";

            return `

                <tr>

                    <td>
                        ${formatDate(transaction.date)}
                    </td>

                    <td>
                        ${escapeHTML(transaction.description)}
                    </td>

                    <td>
                        ${escapeHTML(transaction.category)}
                    </td>

                    <td>
                        ${capitalize(transaction.type)}
                    </td>

                    <td class="${typeClass}">
                        ${sign}${amount}
                    </td>

                    <td>

                        <button
                            class="btn secondary-btn delete-transaction"
                            data-id="${transaction.id}">

                            Delete

                        </button>

                    </td>

                </tr>

            `;

        }).join("");
}


/* =========================================================
   DISPLAY INCOME
   ========================================================= */

export function displayIncome() {

    if (!incomeList) {
        return;
    }


    const income = getTransactions()
        .filter(transaction =>
            transaction.type === "income"
        )
        .sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


    if (income.length === 0) {

        incomeList.innerHTML = `
            <p class="empty-message">
                No income records available.
            </p>
        `;

        return;
    }


    incomeList.innerHTML =
        income.map(transaction => `

            <article class="record-item">

                <div>

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
                        ${formatDate(transaction.date)}
                    </p>

                </div>

                <strong class="income-amount">
                    +${formatCurrency(transaction.amount)}
                </strong>

                <button
                    class="btn secondary-btn delete-transaction"
                    data-id="${transaction.id}">

                    Delete

                </button>

            </article>

        `).join("");
}


/* =========================================================
   DISPLAY EXPENSES
   ========================================================= */

export function displayExpenses() {

    if (!expenseList) {
        return;
    }


    const expenses = getTransactions()
        .filter(transaction =>
            transaction.type === "expense"
        )
        .sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


    if (expenses.length === 0) {

        expenseList.innerHTML = `
            <p class="empty-message">
                No expense records available.
            </p>
        `;

        return;
    }


    expenseList.innerHTML =
        expenses.map(transaction => `

            <article class="record-item">

                <div>

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
                        ${formatDate(transaction.date)}
                    </p>

                </div>

                <strong class="expense-amount">
                    -${formatCurrency(transaction.amount)}
                </strong>

                <button
                    class="btn secondary-btn delete-transaction"
                    data-id="${transaction.id}">

                    Delete

                </button>

            </article>

        `).join("");
}


/* =========================================================
   DELETE TRANSACTION
   ========================================================= */

document.addEventListener("click", event => {

    const button =
        event.target.closest(
            ".delete-transaction"
        );


    if (!button) {
        return;
    }


    const id =
        button.dataset.id;


    const confirmed =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmed) {
        return;
    }


    deleteTransaction(id);


    displayTransactions();

    displayIncome();

    displayExpenses();

});


/* =========================================================
   FILTER TRANSACTIONS
   ========================================================= */

if (filterForm) {

    filterForm.addEventListener("submit", event => {

        event.preventDefault();

        const type =
            document.querySelector(
                "#transaction-type"
            )?.value;

        const category =
            document.querySelector(
                "#transaction-category"
            )?.value;

        const startDate =
            document.querySelector(
                "#start-date"
            )?.value;

        const endDate =
            document.querySelector(
                "#end-date"
            )?.value;


        let filtered =
            getTransactions();


        if (type && type !== "all") {

            filtered =
                filtered.filter(
                    transaction =>
                        transaction.type === type
                );
        }


        if (category && category !== "all") {

            filtered =
                filtered.filter(
                    transaction =>
                        transaction.category === category
                );
        }


        if (startDate) {

            filtered =
                filtered.filter(
                    transaction =>
                        transaction.date >= startDate
                );
        }


        if (endDate) {

            filtered =
                filtered.filter(
                    transaction =>
                        transaction.date <= endDate
                );
        }


        displayTransactions(filtered);

    });
}


/* =========================================================
   CLEAR FILTERS
   ========================================================= */

if (clearFiltersButton) {

    clearFiltersButton.addEventListener(
        "click",
        () => {

            filterForm.reset();

            displayTransactions();

        }
    );
}


/* =========================================================
   FORMAT CURRENCY
   ========================================================= */

function formatCurrency(amount) {

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

function formatDate(date) {

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
   CAPITALIZE
   ========================================================= */

function capitalize(text) {

    if (!text) {
        return "";
    }

    return text.charAt(0).toUpperCase()
        + text.slice(1);

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}

