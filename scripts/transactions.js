import {getTransactions,
    deleteTransaction
} from "./storage.js";


const filters =
    document.querySelector("#transaction-filters");

const transactionList =
    document.querySelector("#transactions-list");

const clearButton =
    document.querySelector("#clear-filters");


document.addEventListener(
    "DOMContentLoaded",
    initializeTransactions
);


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeTransactions() {

    renderTransactions();


    filters?.addEventListener(
        "submit",
        handleFilter
    );


    clearButton?.addEventListener(
        "click",
        clearFilters
    );


    transactionList?.addEventListener(
        "click",
        handleTransactionActions
    );
}


/* =========================================================
   FILTER
   ========================================================= */

function handleFilter(event) {

    event.preventDefault();

    renderTransactions();
}


/* =========================================================
   CLEAR FILTERS
   ========================================================= */

function clearFilters() {

    filters?.reset();

    renderTransactions();
}


/* =========================================================
   GET FILTER VALUES
   ========================================================= */

function getFilterValues() {

    return {

        type:
            document.querySelector(
                "#transaction-type"
            )?.value || "all",

        category:
            document.querySelector(
                "#transaction-category"
            )?.value || "all",

        startDate:
            document.querySelector(
                "#start-date"
            )?.value || "",

        endDate:
            document.querySelector(
                "#end-date"
            )?.value || ""

    };
}


/* =========================================================
   FILTER TRANSACTIONS
   ========================================================= */

function filterTransactions(
    transactions,
    filters
) {

    return transactions.filter(
        transaction => {

            const matchesType =
                filters.type === "all" ||
                transaction.type === filters.type;


            const matchesCategory =
                filters.category === "all" ||
                transaction.category === filters.category;


            const matchesStartDate =
                !filters.startDate ||
                transaction.date >= filters.startDate;


            const matchesEndDate =
                !filters.endDate ||
                transaction.date <= filters.endDate;


            return (
                matchesType &&
                matchesCategory &&
                matchesStartDate &&
                matchesEndDate
            );
        }
    );
}


/* =========================================================
   DISPLAY TRANSACTIONS
   ========================================================= */

function renderTransactions() {

    if (!transactionList) {
        return;
    }


    let transactions =
        getTransactions();


    const filterValues =
        getFilterValues();


    transactions =
        filterTransactions(
            transactions,
            filterValues
        );


    transactions.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );




    if (!transactions.length) {

        transactionList.innerHTML = `
            <tr>
    
            <td colspan="6">
                    No transactions match
                    your filters.
    
                    </td>
            </tr>
        `;

        return;
    
    }


    transactionList.innerHTML =
        transactions
            .map(createTransactionRow)
            .join("");

        }


/* =========================================================
   CREATE TABLE ROW
   ========================================================= */

function createTransactionRow(
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


    const amountPrefix =
        isIncome
            ? "+"
            : "-";


    return `
        <tr class="transaction-row ${typeClass}">

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

                <span
                    class="transaction-type ${typeClass}">

                    ${typeLabel}

                </span>

            </td>


            <td class="${typeClass}">

                ${amountPrefix}${formatCurrency(
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
   DELETE TRANSACTION
   ========================================================= */

function handleTransactionActions(event) {

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
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmed) {
        return;
    }


    const deleted =
        deleteTransaction(id);


    if (!deleted) {

        showMessage(
            "Unable to delete transaction.",
            "error"
        );

        return;
    }


    renderTransactions();


    showMessage(
        "Transaction deleted successfully.",
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
