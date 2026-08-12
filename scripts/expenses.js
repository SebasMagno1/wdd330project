import {
    getTransactions,
    addTransaction,
    deleteTransaction
} from "./storage.js";


const expenseForm =
    document.querySelector("#expense-form");

const expenseList =
    document.querySelector("#expense-list");


document.addEventListener(
    "DOMContentLoaded",
    initializeExpenses
);


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeExpenses() {

    setDefaultDate();

    renderExpenses();


    expenseForm?.addEventListener(
        "submit",
        handleExpenseSubmit
    );


    expenseList?.addEventListener(
        "click",
        handleExpenseActions
    );
}


/* =========================================================
   DEFAULT DATE
   ========================================================= */

function setDefaultDate() {

    const dateInput =
        document.querySelector("#expense-date");

    if (!dateInput) {
        return;
    }


    if (!dateInput.value) {

        dateInput.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }
}


/* =========================================================
   SUBMIT EXPENSE
   ========================================================= */

function handleExpenseSubmit(event) {

    event.preventDefault();


    const formData =
        new FormData(expenseForm);


    const description =
        formData
            .get("description")
            .trim();


    const amount =
        Number(
            formData.get("amount")
        );


    const category =
        formData.get("category");


    const date =
        formData.get("date");


    const paymentMethod =
        formData.get("paymentMethod");


    const notes =
        formData
            .get("notes")
            .trim();


    if (
        !description ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !category ||
        !date
    ) {

        showMessage(
            "Please complete all required fields.",
            "error"
        );

        return;
    }


    const transaction =
        addTransaction({

            type: "expense",

            description,

            amount,

            category,

            date,

            paymentMethod,

            notes

        });


    if (!transaction) {

        showMessage(
            "Unable to save expense.",
            "error"
        );

        return;
    }


    expenseForm.reset();

    setDefaultDate();

    renderExpenses();


    showMessage(
        "Expense saved successfully.",
        "success"
    );
}


/* =========================================================
   DISPLAY EXPENSES
   ========================================================= */

function renderExpenses() {

    if (!expenseList) {
        return;
    }


    const expenses =
        getTransactions()
            .filter(
                transaction =>
                    transaction.type === "expense"
            )
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 10);


    if (!expenses.length) {

        expenseList.innerHTML = `
            <p class="empty-message">
                No expense records available.
            </p>
        `;

        return;
    }


    expenseList.innerHTML =
        expenses
            .map(createExpenseCard)
            .join("");
}


/* =========================================================
   CREATE EXPENSE CARD
   ========================================================= */

function createExpenseCard(transaction) {

    return `
        <article class="record-card">

            <div class="record-info">

                <h3>
                    ${escapeHTML(transaction.description)}
                </h3>

                <p>
                    ${escapeHTML(transaction.category)}
                </p>

                <p>
                    ${formatDate(transaction.date)}
                </p>

                ${
                    transaction.paymentMethod
                        ? `
                            <p>
                                ${escapeHTML(
                                    transaction.paymentMethod
                                )}
                            </p>
                        `
                        : ""
                }

            </div>


            <div class="record-amount expense">

                <strong>
                    -${formatCurrency(transaction.amount)}
                </strong>

                <button
                    type="button"
                    class="delete-transaction"
                    data-id="${transaction.id}">
                    Delete
                </button>

            </div>

        </article>
    `;
}


/* =========================================================
   DELETE EXPENSE
   ========================================================= */

function handleExpenseActions(event) {

    const button =
        event.target.closest(
            ".delete-transaction"
        );


    if (!button) {
        return;
    }


    const id =
        button.dataset.id;


    if (!id) {
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmed) {
        return;
    }


    const deleted =
        deleteTransaction(id);


    if (!deleted) {

        showMessage(
            "Unable to delete expense.",
            "error"
        );

        return;
    }


    renderExpenses();


    showMessage(
        "Expense deleted successfully.",
        "success"
    );
}


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
    message,
    type = "success"
) {

    document
        .querySelector(".page-message")
        ?.remove();


    const element =
        document.createElement("p");


    element.className =
        `page-message ${type}`;


    element.textContent =
        message;


    document
        .querySelector("main")
        ?.prepend(element);


    setTimeout(
        () => element.remove(),
        3000
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
    ).format(
        Number(amount) || 0
    );
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(dateString) {

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

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}