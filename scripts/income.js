import {
    getTransactions,
    addTransaction,
    deleteTransaction
} from "./storage.js";


const incomeForm = document.querySelector("#income-form");
const incomeList = document.querySelector("#income-list");


document.addEventListener("DOMContentLoaded", initializeIncome);


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeIncome() {

    setDefaultDate();
    renderIncome();

    incomeForm?.addEventListener(
        "submit",
        handleIncomeSubmit
    );

    incomeList?.addEventListener(
        "click",
        handleIncomeActions
    );
}


/* =========================================================
   DEFAULT DATE
   ========================================================= */

function setDefaultDate() {

    const dateInput =
        document.querySelector("#income-date");

    if (!dateInput) {
        return;
    }

    if (!dateInput.value) {
        dateInput.value =
            new Date().toISOString().split("T")[0];
    }
}


/* =========================================================
   SUBMIT INCOME
   ========================================================= */

function handleIncomeSubmit(event) {

    event.preventDefault();

    const formData =
        new FormData(incomeForm);

    const description =
        formData.get("description").trim();

    const amount =
        Number(formData.get("amount"));

    const category =
        formData.get("category");

    const date =
        formData.get("date");

    const notes =
        formData.get("notes").trim();


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

            type: "income",

            description,

            amount,

            category,

            date,

            notes,

            paymentMethod: ""

        });


    if (!transaction) {

        showMessage(
            "Unable to save income.",
            "error"
        );

        return;
    }


    incomeForm.reset();

    setDefaultDate();

    renderIncome();


    showMessage(
        "Income saved successfully.",
        "success"
    );
}


/* =========================================================
   DISPLAY INCOME
   ========================================================= */

function renderIncome() {

    if (!incomeList) {
        return;
    }


    const income =
        getTransactions()
            .filter(
                transaction =>
                    transaction.type === "income"
            )
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 10);


    if (!income.length) {

        incomeList.innerHTML = `
            <p class="empty-message">
                No income records available.
            </p>
        `;

        return;
    }


    incomeList.innerHTML =
        income
            .map(createIncomeCard)
            .join("");
}


/* =========================================================
   CREATE INCOME CARD
   ========================================================= */

function createIncomeCard(transaction) {

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

            </div>


            <div class="record-amount income">

                <strong>
                    +${formatCurrency(transaction.amount)}
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
   DELETE INCOME
   ========================================================= */

function handleIncomeActions(event) {

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
            "Are you sure you want to delete this income?"
        );

    if (!confirmed) {
        return;
    }


    const deleted =
        deleteTransaction(id);


    if (!deleted) {

        showMessage(
            "Unable to delete income.",
            "error"
        );

        return;
    }


    renderIncome();


    showMessage(
        "Income deleted successfully.",
        "success"
    );
}


/* =========================================================
   SUCCESS / ERROR MESSAGE
   ========================================================= */

function showMessage(message, type = "success") {

    const oldMessage =
        document.querySelector(".page-message");

    oldMessage?.remove();


    const element =
        document.createElement("p");

    element.className =
        `page-message ${type}`;

    element.textContent =
        message;


    const main =
        document.querySelector("main");

    main?.prepend(element);


    setTimeout(() => {
        element.remove();
    }, 3000);
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
    ).format(Number(amount) || 0);
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "No date";
    }


    const date =
        new Date(`${dateString}T00:00:00`);


    if (Number.isNaN(date.getTime())) {
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