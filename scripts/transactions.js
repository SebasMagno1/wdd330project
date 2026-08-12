/*
 * FinanceHub
 * Transactions Module
 *
 * Handles:
 * - Income
 * - Expenses
 * - Transaction history
 * - Filters
 * - Recent records
 * - Delete transactions
 */


/* =========================================================
   IMPORT STORAGE FUNCTIONS
   ========================================================= */

import { 
    getTransactions,
    addTransaction,
    deleteTransaction
} from "./storage.js";


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeTransactions();

    }
);


/* =========================================================
   INITIALIZE TRANSACTIONS
   ========================================================= */

function initializeTransactions() {

    setupIncomeForm();

    setupExpenseForm();

    setupTransactionFilters();

    displayIncome();

    displayExpenses();

    setupTransactionsPage();

}


/* =========================================================
   INCOME FORM
   ========================================================= */

function setupIncomeForm() {

    const form =
        document.querySelector(
            "#income-form"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            /* -------------------------------------------------
               GET FORM VALUES
               ------------------------------------------------- */

            const description =
                document.querySelector(
                    "#income-description"
                )?.value.trim();


            const amount =
                Number(
                    document.querySelector(
                        "#income-amount"
                    )?.value
                );


            const category =
                document.querySelector(
                    "#income-category"
                )?.value;


            const date =
                document.querySelector(
                    "#income-date"
                )?.value;


            const notes =
                document.querySelector(
                    "#income-notes"
                )?.value.trim();


            /* -------------------------------------------------
               VALIDATE
               ------------------------------------------------- */

            if (
                !description ||
                !Number.isFinite(amount) ||
                amount <= 0 ||
                !category ||
                !date
            ) {

                alert(
                    "Please complete all required fields."
                );

                return;

            }


            /* -------------------------------------------------
               CREATE TRANSACTION
               ------------------------------------------------- */

            const transaction =
                addTransaction({

                    type:
                        "income",

                    description,

                    amount,

                    category,

                    date,

                    notes,

                    paymentMethod:
                        ""

                });


            /* -------------------------------------------------
               CHECK SAVE
               ------------------------------------------------- */

            if (!transaction) {

                alert(
                    "Unable to save income."
                );

                return;

            }


            /* -------------------------------------------------
               RESET FORM
               ------------------------------------------------- */

            form.reset();


            /* -------------------------------------------------
               REFRESH LIST
               ------------------------------------------------- */

            displayIncome();


            /* -------------------------------------------------
               SUCCESS MESSAGE
               ------------------------------------------------- */

            showSuccessMessage(
                "Income saved successfully."
            );

        }
    );

}


/* =========================================================
   EXPENSE FORM
   ========================================================= */

function setupExpenseForm() {

    const form =
        document.querySelector(
            "#expense-form"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            /* -------------------------------------------------
               GET FORM VALUES
               ------------------------------------------------- */

            const description =
                document.querySelector(
                    "#expense-description"
                )?.value.trim();


            const amount =
                Number(
                    document.querySelector(
                        "#expense-amount"
                    )?.value
                );


            const category =
                document.querySelector(
                    "#expense-category"
                )?.value;


            const date =
                document.querySelector(
                    "#expense-date"
                )?.value;


            const paymentMethod =
                document.querySelector(
                    "#payment-method"
                )?.value || "";


            const notes =
                document.querySelector(
                    "#expense-notes"
                )?.value.trim();


            /* -------------------------------------------------
               VALIDATE
               ------------------------------------------------- */

            if (
                !description ||
                !Number.isFinite(amount) ||
                amount <= 0 ||
                !category ||
                !date
            ) {

                alert(
                    "Please complete all required fields."
                );

                return;

            }


            /* -------------------------------------------------
               CREATE TRANSACTION
               ------------------------------------------------- */

            const transaction =
                addTransaction({

                    type:
                        "expense",

                    description,

                    amount,

                    category,

                    date,

                    notes,

                    paymentMethod

                });


            /* -------------------------------------------------
               CHECK SAVE
               ------------------------------------------------- */

            if (!transaction) {

                alert(
                    "Unable to save expense."
                );

                return;

            }


            /* -------------------------------------------------
               RESET FORM
               ------------------------------------------------- */

            form.reset();


            /* -------------------------------------------------
               REFRESH LIST
               ------------------------------------------------- */

            displayExpenses();


            /* -------------------------------------------------
               SUCCESS MESSAGE
               ------------------------------------------------- */

            showSuccessMessage(
                "Expense saved successfully."
            );

        }
    );

}


/* =========================================================
   DISPLAY INCOME
   ========================================================= */

function displayIncome() {

    const list =
        document.querySelector(
            "#income-list"
        );


    if (!list) {
        return;
    }


    const transactions =
        getTransactions();


    const income =
        transactions
            .filter(
                transaction =>
                    transaction.type ===
                    "income"
            )
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 10);


    /* -------------------------------------------------------
       EMPTY STATE
       ------------------------------------------------------- */

    if (!income.length) {

        list.innerHTML = `
            <p class="empty-message">
                No income records available.
            </p>
        `;

        return;

    }


    /* -------------------------------------------------------
       RENDER
       ------------------------------------------------------- */

    list.innerHTML =
        income
            .map(
                transaction =>
                    createIncomeExpenseHTML(
                        transaction
                    )
            )
            .join("");


    attachDeleteButtons();

}


/* =========================================================
   DISPLAY EXPENSES
   ========================================================= */

function displayExpenses() {

    const list =
        document.querySelector(
            "#expense-list"
        );


    if (!list) {
        return;
    }


    const transactions =
        getTransactions();


    const expenses =
        transactions
            .filter(
                transaction =>
                    transaction.type ===
                    "expense"
            )
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 10);


    /* -------------------------------------------------------
       EMPTY STATE
       ------------------------------------------------------- */

    if (!expenses.length) {

        list.innerHTML = `
            <p class="empty-message">
                No expense records available.
            </p>
        `;

        return;

    }


    /* -------------------------------------------------------
       RENDER
       ------------------------------------------------------- */

    list.innerHTML =
        expenses
            .map(
                transaction =>
                    createIncomeExpenseHTML(
                        transaction
                    )
            )
            .join("");


    attachDeleteButtons();

}


/* =========================================================
   CREATE INCOME / EXPENSE CARD
   ========================================================= */

function createIncomeExpenseHTML(
    transaction
) {

    const typeLabel =
        transaction.type === "income"
            ? "Income"
            : "Expense";


    const typeClass =
        transaction.type === "income"
            ? "income"
            : "expense";


    return `
        <article
            class="transaction-item ${typeClass}">

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

                <p>
                    ${formatDate(
                        transaction.date
                    )}
                </p>

            </div>


            <div class="transaction-amount">

                <span class="transaction-type">
                    ${typeLabel}
                </span>

                <strong>
                    ${formatCurrency(
                        transaction.amount
                    )}
                </strong>

            </div>


            <div class="transaction-actions">

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
   TRANSACTIONS PAGE
   ========================================================= */

function setupTransactionsPage() {

    const list =
        document.querySelector(
            "#transactions-list"
        );


    if (!list) {
        return;
    }


    displayAllTransactions();

}


/* =========================================================
   TRANSACTION FILTERS
   ========================================================= */

function setupTransactionFilters() {

    const form =
        document.querySelector(
            "#transaction-filters"
        );


    if (!form) {
        return;
    }


    /* -------------------------------------------------------
       FILTER
       ------------------------------------------------------- */

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            displayAllTransactions();

        }
    );


    /* -------------------------------------------------------
       CLEAR FILTERS
       ------------------------------------------------------- */

    const clearButton =
        document.querySelector(
            "#clear-filters"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            () => {

                form.reset();

                displayAllTransactions();

            }
        );

    }

}


/* =========================================================
   DISPLAY ALL TRANSACTIONS
   ========================================================= */

function displayAllTransactions() {

    const list =
        document.querySelector(
            "#transactions-list"
        );


    if (!list) {
        return;
    }


    let transactions =
        getTransactions();


    /* =====================================================
       FILTER VALUES
       ===================================================== */

    const type =
        document.querySelector(
            "#transaction-type"
        )?.value || "all";


    const category =
        document.querySelector(
            "#transaction-category"
        )?.value || "all";


    const startDate =
        document.querySelector(
            "#start-date"
        )?.value || "";


    const endDate =
        document.querySelector(
            "#end-date"
        )?.value || "";


    /* =====================================================
       FILTER TYPE
       ===================================================== */

    if (type !== "all") {

        transactions =
            transactions.filter(
                transaction =>
                    transaction.type === type
            );

    }


    /* =====================================================
       FILTER CATEGORY
       ===================================================== */

    if (category !== "all") {

        transactions =
            transactions.filter(
                transaction =>
                    transaction.category ===
                    category
            );

    }


    /* =====================================================
       FILTER START DATE
       ===================================================== */

    if (startDate) {

        transactions =
            transactions.filter(
                transaction =>
                    transaction.date >=
                    startDate
            );

    }


    /* =====================================================
       FILTER END DATE
       ===================================================== */

    if (endDate) {

        transactions =
            transactions.filter(
                transaction =>
                    transaction.date <=
                    endDate
            );

    }


    /* =====================================================
       SORT BY DATE
       ===================================================== */

    transactions.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    /* =====================================================
       EMPTY STATE
       ===================================================== */

    if (!transactions.length) {

        list.innerHTML = `
            <tr>

                <td colspan="6">

                    No transactions match
                    your filters.

                </td>

            </tr>
        `;

        return;

    }


    /* =====================================================
       RENDER TABLE
       ===================================================== */

    list.innerHTML =
        transactions
            .map(
                transaction =>
                    createTransactionHTML(
                        transaction
                    )
            )
            .join("");


    attachDeleteButtons();

}


/* =========================================================
   CREATE TRANSACTION TABLE ROW
   ========================================================= */

function createTransactionHTML(
    transaction
) {

    const typeLabel =
        transaction.type === "income"
            ? "Income"
            : "Expense";


    const typeClass =
        transaction.type === "income"
            ? "income"
            : "expense";


    return `
        <tr
            class="transaction-row ${typeClass}">

            <td>
                ${formatDate(
                    transaction.date
                )}
            </td>


            <td>
                ${escapeHTML(
                    transaction.description
                )}
            </td>


            <td>
                ${escapeHTML(
                    transaction.category
                )}
            </td>


            <td>

                <span
                    class="transaction-type ${typeClass}">

                    ${typeLabel}

                </span>

            </td>


            <td
                class="${typeClass}">

                ${formatCurrency(
                    transaction.amount
                )}

            </td>


            <td>

                <button
                    type="button"
                    class="delete-transaction"
                    data-id="${transaction.id}">

                    Delete

                </button>

            </td>

        </tr>
    `;

}


/* =========================================================
   DELETE BUTTONS
   ========================================================= */

function attachDeleteButtons() {

    const buttons =
        document.querySelectorAll(
            ".delete-transaction"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;


                    if (!id) {
                        return;
                    }


                    const confirmed =
                        confirm(
                            "Are you sure you want to delete this transaction?"
                        );


                    if (!confirmed) {
                        return;
                    }


                    const deleted =
                        deleteTransaction(
                            id
                        );


                    if (!deleted) {

                        alert(
                            "Unable to delete transaction."
                        );

                        return;

                    }


                    /* -----------------------------------------
                       REFRESH CURRENT CONTENT
                       ----------------------------------------- */

                    displayIncome();

                    displayExpenses();

                    displayAllTransactions();

                }
            );

        }
    );

}


/* =========================================================
   SUCCESS MESSAGE
   ========================================================= */

function showSuccessMessage(
    message
) {

    const existing =
        document.querySelector(
            ".success-message"
        );


    if (existing) {
        existing.remove();
    }


    const element =
        document.createElement(
            "p"
        );


    element.className =
        "success-message";


    element.textContent =
        message;


    const main =
        document.querySelector(
            "main"
        );


    if (!main) {
        return;
    }


    main.prepend(
        element
    );


    setTimeout(
        () => {

            if (element) {
                element.remove();
            }

        },
        3000
    );

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