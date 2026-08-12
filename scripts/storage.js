/*
 * FinanceHub
 * Storage Module
 *
 * Handles all localStorage operations.
 */


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const STORAGE_KEYS = {

    TRANSACTIONS:
        "financeHubTransactions",

    BUDGETS:
        "financeHubBudgets",

    PREFERENCES:
        "financeHubPreferences"

};


/* =========================================================
   GENERATE UNIQUE ID
   ========================================================= */

export function generateId() {

    return (
        Date.now().toString() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


/* =========================================================
   TRANSACTIONS
   ========================================================= */


/*
 * Get all transactions
 */
export function getTransactions() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_KEYS.TRANSACTIONS
            );


        if (!data) {
            return [];
        }


        const transactions =
            JSON.parse(data);


        return Array.isArray(
            transactions
        )
            ? transactions
            : [];


    } catch (error) {

        console.error(
            "Error reading transactions:",
            error
        );

        return [];

    }

}


/*
 * Save transactions
 */
export function saveTransactions(
    transactions
) {

    try {

        if (
            !Array.isArray(
                transactions
            )
        ) {

            console.error(
                "Transactions must be an array."
            );

            return false;

        }


        localStorage.setItem(
            STORAGE_KEYS.TRANSACTIONS,
            JSON.stringify(
                transactions
            )
        );


        return true;


    } catch (error) {

        console.error(
            "Error saving transactions:",
            error
        );

        return false;

    }

}


/*
 * Add a transaction
 */
export function addTransaction(
    transaction
) {

    if (!transaction) {
        return null;
    }


    /* -----------------------------------------------------
       VALIDATE TYPE
       ----------------------------------------------------- */

    const type =
        transaction.type;


    if (
        type !== "income" &&
        type !== "expense"
    ) {

        console.error(
            "Transaction type must be income or expense."
        );

        return null;

    }


    /* -----------------------------------------------------
       VALIDATE AMOUNT
       ----------------------------------------------------- */

    const amount =
        Number(
            transaction.amount
        );


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        console.error(
            "Invalid transaction amount."
        );

        return null;

    }


    /* -----------------------------------------------------
       CREATE TRANSACTION
       ----------------------------------------------------- */

    const newTransaction = {

        id:
            transaction.id ||
            generateId(),

        type,

        description:
            String(
                transaction.description ||
                ""
            ).trim(),

        amount,

        category:
            String(
                transaction.category ||
                ""
            ).trim(),

        date:
            transaction.date ||
            "",

        notes:
            String(
                transaction.notes ||
                ""
            ).trim(),

        paymentMethod:
            String(
                transaction.paymentMethod ||
                ""
            ).trim()

    };


    /* -----------------------------------------------------
       SAVE
       ----------------------------------------------------- */

    const transactions =
        getTransactions();


    transactions.push(
        newTransaction
    );


    const saved =
        saveTransactions(
            transactions
        );


    if (!saved) {
        return null;
    }


    return newTransaction;

}


/*
 * Update a transaction
 */
export function updateTransaction(
    id,
    updatedData
) {

    if (
        !id ||
        !updatedData
    ) {

        return null;

    }


    const transactions =
        getTransactions();


    const index =
        transactions.findIndex(
            transaction =>
                transaction.id === id
        );


    if (index === -1) {
        return null;
    }


    /* -----------------------------------------------------
       VALIDATE TYPE IF PROVIDED
       ----------------------------------------------------- */

    if (
        updatedData.type !== undefined &&
        updatedData.type !== "income" &&
        updatedData.type !== "expense"
    ) {

        console.error(
            "Transaction type must be income or expense."
        );

        return null;

    }


    /* -----------------------------------------------------
       VALIDATE AMOUNT
       ----------------------------------------------------- */

    const updatedAmount =
        updatedData.amount !== undefined
            ? Number(
                updatedData.amount
            )
            : transactions[index].amount;


    if (
        !Number.isFinite(
            updatedAmount
        ) ||
        updatedAmount <= 0
    ) {

        console.error(
            "Invalid transaction amount."
        );

        return null;

    }


    /* -----------------------------------------------------
       UPDATE
       ----------------------------------------------------- */

    transactions[index] = {

        ...transactions[index],

        ...updatedData,

        amount:
            updatedAmount

    };


    const saved =
        saveTransactions(
            transactions
        );


    if (!saved) {
        return null;
    }


    return transactions[index];

}


/*
 * Delete a transaction
 */
export function deleteTransaction(
    id
) {

    const transactions =
        getTransactions();


    const filteredTransactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    if (
        filteredTransactions.length ===
        transactions.length
    ) {

        return false;

    }


    return saveTransactions(
        filteredTransactions
    );

}


/*
 * Get one transaction by ID
 */
export function getTransactionById(
    id
) {

    const transactions =
        getTransactions();


    return transactions.find(
        transaction =>
            transaction.id === id
    );

}


/* =========================================================
   BUDGETS
   ========================================================= */


/*
 * Get all budgets
 */
export function getBudgets() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_KEYS.BUDGETS
            );


        if (!data) {
            return [];
        }


        const budgets =
            JSON.parse(data);


        return Array.isArray(
            budgets
        )
            ? budgets
            : [];


    } catch (error) {

        console.error(
            "Error reading budgets:",
            error
        );

        return [];

    }

}


/*
 * Save budgets
 */
export function saveBudgets(
    budgets
) {

    try {

        if (
            !Array.isArray(
                budgets
            )
        ) {

            console.error(
                "Budgets must be an array."
            );

            return false;

        }


        localStorage.setItem(
            STORAGE_KEYS.BUDGETS,
            JSON.stringify(
                budgets
            )
        );


        return true;


    } catch (error) {

        console.error(
            "Error saving budgets:",
            error
        );

        return false;

    }

}


/*
 * Add a budget
 */
export function addBudget(
    budget
) {

    if (!budget) {
        return null;
    }


    const limit =
        Number(
            budget.limit
        );


    if (
        !Number.isFinite(limit) ||
        limit <= 0
    ) {

        console.error(
            "Invalid budget limit."
        );

        return null;

    }


    const newBudget = {

        id:
            budget.id ||
            generateId(),

        month:
            budget.month ||
            "",

        category:
            String(
                budget.category ||
                ""
            ).trim(),

        limit

    };


    const budgets =
        getBudgets();


    budgets.push(
        newBudget
    );


    const saved =
        saveBudgets(
            budgets
        );


    if (!saved) {
        return null;
    }


    return newBudget;

}


/*
 * Update a budget
 */
export function updateBudget(
    id,
    updatedData
) {

    if (
        !id ||
        !updatedData
    ) {

        return null;

    }


    const budgets =
        getBudgets();


    const index =
        budgets.findIndex(
            budget =>
                budget.id === id
        );


    if (index === -1) {
        return null;
    }


    const updatedLimit =
        updatedData.limit !== undefined
            ? Number(
                updatedData.limit
            )
            : budgets[index].limit;


    if (
        !Number.isFinite(
            updatedLimit
        ) ||
        updatedLimit <= 0
    ) {

        console.error(
            "Invalid budget limit."
        );

        return null;

    }


    budgets[index] = {

        ...budgets[index],

        ...updatedData,

        limit:
            updatedLimit

    };


    const saved =
        saveBudgets(
            budgets
        );


    if (!saved) {
        return null;
    }


    return budgets[index];

}


/*
 * Delete a budget
 */
export function deleteBudget(
    id
) {

    const budgets =
        getBudgets();


    const filteredBudgets =
        budgets.filter(
            budget =>
                budget.id !== id
        );


    if (
        filteredBudgets.length ===
        budgets.length
    ) {

        return false;

    }


    return saveBudgets(
        filteredBudgets
    );

}


/* =========================================================
   USER PREFERENCES
   ========================================================= */


/*
 * Get user preferences
 */
export function getPreferences() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_KEYS.PREFERENCES
            );


        if (!data) {

            return {
                currency: "USD"
            };

        }


        const preferences =
            JSON.parse(data);


        return preferences &&
            typeof preferences ===
                "object"

            ? preferences

            : {
                currency: "USD"
            };


    } catch (error) {

        console.error(
            "Error reading preferences:",
            error
        );

        return {
            currency: "USD"
        };

    }

}


/*
 * Save user preferences
 */
export function savePreferences(
    preferences
) {

    try {

        if (
            !preferences ||
            typeof preferences !==
                "object"
        ) {

            console.error(
                "Invalid preferences."
            );

            return false;

        }


        localStorage.setItem(
            STORAGE_KEYS.PREFERENCES,
            JSON.stringify(
                preferences
            )
        );


        return true;


    } catch (error) {

        console.error(
            "Error saving preferences:",
            error
        );

        return false;

    }

}


/* =========================================================
   CLEAR ALL DATA
   ========================================================= */

export function clearAllData() {

    localStorage.removeItem(
        STORAGE_KEYS.TRANSACTIONS
    );


    localStorage.removeItem(
        STORAGE_KEYS.BUDGETS
    );


    localStorage.removeItem(
        STORAGE_KEYS.PREFERENCES
    );

}

