import {
    getTransactions,
    addTransaction,
    deleteTransaction
} 
from "./storage.js";


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.querySelector("#income-form");

        const list =
            document.querySelector("#income-list");


        if (!form) {
            console.error(
                "Income form was not found."
            );
            return;
        }


        setDefaultDate();

        renderIncome(list);


        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveIncome(
                    form,
                    list
                );

            }
        );


        list?.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        ".delete-transaction"
                    );


                if (!button) {
                    return;
                }


                deleteIncome(
                    button.dataset.id,
                    list
                );

            }
        );

    }
);


/* =========================================================
   SAVE INCOME
   ========================================================= */

function saveIncome(
    form,
    list
) {

    const formData =
        new FormData(form);


    const description =
        String(
            formData.get("description") || ""
        ).trim();


    const amount =
        Number(
            formData.get("amount")
        );


    const category =
        String(
            formData.get("category") || ""
        ).trim();


    const date =
        String(
            formData.get("date") || ""
        );


    const notes =
        String(
            formData.get("notes") || ""
        ).trim();


    /* -----------------------------------------------------
       VALIDATION
       ----------------------------------------------------- */

    if (!description) {

        showMessage(
            "Please enter a description.",
            "error"
        );

        return;
    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showMessage(
            "Please enter a valid amount.",
            "error"
        );

        return;
    }


    if (!category) {

        showMessage(
            "Please select a category.",
            "error"
        );

        return;
    }


    if (!date) {

        showMessage(
            "Please select a date.",
            "error"
        );

        return;
    }


    /* -----------------------------------------------------
       SAVE
       ----------------------------------------------------- */

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


    console.log(
        "Saved income:",
        transaction
    );


    if (!transaction) {

        showMessage(
            "Income could not be saved.",
            "error"
        );

        return;
    }


    /* -----------------------------------------------------
       VERIFY LOCAL STORAGE
       ----------------------------------------------------- */

    console.log(
        "All transactions:",
        getTransactions()
    );


    /* -----------------------------------------------------
       UPDATE UI
       ----------------------------------------------------- */

    form.reset();

    setDefaultDate();

    renderIncome(list);


    showMessage(
        "Income saved successfully.",
        "success"
    );
}


/* =========================================================
   RENDER INCOME
   ========================================================= */

function renderIncome(
    list
) {

    if (!list) {
        return;
    }


    const income =
        getTransactions()
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


    if (!income.length) {

        list.innerHTML = `
            <p class="empty-message">
                No income records available.
            </p>
        `;

        return;
    }


    list.innerHTML =
        income
            .map(
                createIncomeCard
            )
            .join("");
}


/* =========================================================
   CREATE CARD
   ========================================================= */

function createIncomeCard(
    transaction
) {

    return `
        <article class="record-card">

            <div class="record-info">

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

                ${
                    transaction.notes
                        ? `
                            <p>
                                ${escapeHTML(
                                    transaction.notes
                                )}
                            </p>
                        `
                        : ""
                }

            </div>


            <div class="record-amount income">

                <strong>
                    +${formatCurrency(
                        transaction.amount
                    )}
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

function deleteIncome(
    id,
    list
) {

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
            "Income could not be deleted.",
            "error"
        );

        return;
    }


    renderIncome(list);


    showMessage(
        "Income deleted successfully.",
        "success"
    );
}


/* =========================================================
   DEFAULT DATE
   ========================================================= */

function setDefaultDate() {

    const input =
        document.querySelector(
            "#income-date"
        );


    if (
        input &&
        !input.value
    ) {

        input.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }
}


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
    message,
    type
) {

    document
        .querySelector(
            ".page-message"
        )
        ?.remove();


    const element =
        document.createElement(
            "p"
        );


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