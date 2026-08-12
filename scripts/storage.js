/*
 * FinanceHub
 * Storage Module
 *
 * Central data layer for the entire application.
 *
 * All modules use the same data format:
 *
 * TRANSACTION
 * {
 *     id,
 *     type,
 *     description,
 *     amount,
 *     category,
 *     date,
 *     notes,
 *     paymentMethod
 * }
 *
 * BUDGET
 * {
 *     id,
 *     month,
 *     category,
 *     limit
 * }
 *
 * PREFERENCES
 * {
 *     currency
 * }
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
   ID GENERATOR
   ========================================================= */

export function generateId() {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {

        return crypto.randomUUID();

    }


    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );
}


/* =========================================================
   GENERIC STORAGE HELPERS
   ========================================================= */

function readStorage(
    key,
    defaultValue
) {

    try {

        const data =
            localStorage.getItem(key);


        if (!data) {
            return defaultValue;
        }


        const parsed =
            JSON.parse(data);


        return parsed;

    } catch (error) {

        console.error(
            `Error reading ${key}:`,
            error
        );

        return defaultValue;
    }
}


function writeStorage(
    key,
    data
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );


        return true;

    } catch (error) {

        console.error(
            `Error saving ${key}:`,
            error
        );

        return false;
    }
}


/* =========================================================
   TRANSACTION NORMALIZATION
   ========================================================= */

function normalizeTransaction(
    transaction
) {

    if (
        !transaction ||
        typeof transaction !== "object"
    ) {

        return null;
    }


    const type =
        String(
            transaction.type || ""
        )
            .trim()
            .toLowerCase();


    if (
        type !== "income" &&
        type !== "expense"
    ) {

        return null;
    }


    const amount =
        Number(
            transaction.amount
        );


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return null;
    }


    const description =
        String(
            transaction.description || ""
        ).trim();


    const category =
        String(
            transaction.category || ""
        ).trim();


    const date =
        String(
            transaction.date || ""
        ).trim();


    const notes =
        String(
            transaction.notes || ""
        ).trim();


    const paymentMethod =
        String(
            transaction.paymentMethod || ""
        ).trim();


    return {

        id:
            String(
                transaction.id ||
                generateId()
            ),

        type,

        description,

        amount,

        category,

        date,

        notes,

        paymentMethod

    };
}


/* =========================================================
   TRANSACTIONS
   ========================================================= */


/*
 * Get all transactions.
 */
export function getTransactions() {

    const data =
        readStorage(
            STORAGE_KEYS.TRANSACTIONS,
            []
        );


    if (!Array.isArray(data)) {
        return [];
    }


    return data
        .map(normalizeTransaction)
        .filter(Boolean);
}


/*
 * Save all transactions.
 */
export function saveTransactions(
    transactions
) {

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


    const normalizedTransactions =
        transactions
            .map(normalizeTransaction)
            .filter(Boolean);


    return writeStorage(
        STORAGE_KEYS.TRANSACTIONS,
        normalizedTransactions
    );
}


/*
 * Add a transaction.
 */
export function addTransaction(
    transaction
) {

    const normalized =
        normalizeTransaction(
            transaction
        );


    if (!normalized) {

        console.error(
            "Invalid transaction.",
            transaction
        );

        return null;
    }


    const transactions =
        getTransactions();


    transactions.push(
        normalized
    );


    const saved =
        saveTransactions(
            transactions
        );


    if (!saved) {
        return null;
    }


    return normalized;
}


/*
 * Update a transaction.
 */
export function updateTransaction(
    id,
    updatedData
) {

    if (
        !id ||
        !updatedData ||
        typeof updatedData !== "object"
    ) {

        return null;
    }


    const transactions =
        getTransactions();


    const index =
        transactions.findIndex(
            transaction =>
                String(transaction.id) ===
                String(id)
        );


    if (index === -1) {

        console.warn(
            "Transaction not found:",
            id
        );

        return null;
    }


    const updatedTransaction = {

        ...transactions[index],

        ...updatedData,

        id:
            transactions[index].id

    };


    const normalized =
        normalizeTransaction(
            updatedTransaction
        );


    if (!normalized) {

        console.error(
            "Updated transaction is invalid."
        );

        return null;
    }


    transactions[index] =
        normalized;


    const saved =
        saveTransactions(
            transactions
        );


    if (!saved) {
        return null;
    }


    return normalized;
}


/*
 * Delete a transaction.
 */
export function deleteTransaction(
    id
) {

    if (!id) {
        return false;
    }


    const transactions =
        getTransactions();


    const filtered =
        transactions.filter(
            transaction =>
                String(transaction.id) !==
                String(id)
        );


    if (
        filtered.length ===
        transactions.length
    ) {

        return false;
    }


    return saveTransactions(
        filtered
    );
}


/*
 * Get one transaction.
 */
export function getTransactionById(
    id
) {

    if (!id) {
        return null;
    }


    const transactions =
        getTransactions();


    return (
        transactions.find(
            transaction =>
                String(transaction.id) ===
                String(id)
        ) || null
    );
}


/*
 * Delete all transactions.
 */
export function clearTransactions() {

    return saveTransactions([]);
}


/* =========================================================
   TRANSACTION HELPERS
   ========================================================= */


/*
 * Get only income.
 */
export function getIncomeTransactions() {

    return getTransactions()
        .filter(
            transaction =>
                transaction.type ===
                "income"
        );
}


/*
 * Get only expenses.
 */
export function getExpenseTransactions() {

    return getTransactions()
        .filter(
            transaction =>
                transaction.type ===
                "expense"
        );
}


/*
 * Get total income.
 */
export function getTotalIncome() {

    return getIncomeTransactions()
        .reduce(
            (total, transaction) =>
                total +
                transaction.amount,
            0
        );
}


/*
 * Get total expenses.
 */
export function getTotalExpenses() {

    return getExpenseTransactions()
        .reduce(
            (total, transaction) =>
                total +
                transaction.amount,
            0
        );
}


/*
 * Get balance.
 */
export function getBalance() {

    return (
        getTotalIncome() -
        getTotalExpenses()
    );
}


/* =========================================================
   MONTHLY TRANSACTIONS
   ========================================================= */


/*
 * Get transactions for a month.
 *
 * Format:
 * YYYY-MM
 */
export function getTransactionsByMonth(
    month
) {

    if (!month) {
        return [];
    }


    return getTransactions()
        .filter(
            transaction =>
                transaction.date.startsWith(
                    month
                )
        );
}


/*
 * Get monthly income.
 */
export function getMonthlyIncome(
    month
) {

    return getTransactionsByMonth(
        month
    )
        .filter(
            transaction =>
                transaction.type ===
                "income"
        )
        .reduce(
            (total, transaction) =>
                total +
                transaction.amount,
            0
        );
}


/*
 * Get monthly expenses.
 */
export function getMonthlyExpenses(
    month
) {

    return getTransactionsByMonth(
        month
    )
        .filter(
            transaction =>
                transaction.type ===
                "expense"
        )
        .reduce(
            (total, transaction) =>
                total +
                transaction.amount,
            0
        );
}


/*
 * Get monthly balance.
 */
export function getMonthlyBalance(
    month
) {

    return (
        getMonthlyIncome(month) -
        getMonthlyExpenses(month)
    );
}


/* =========================================================
   BUDGET NORMALIZATION
   ========================================================= */

function normalizeBudget(
    budget
) {

    if (
        !budget ||
        typeof budget !== "object"
    ) {

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

        return null;
    }


    return {

        id:
            String(
                budget.id ||
                generateId()
            ),

        month:
            String(
                budget.month || ""
            ).trim(),

        category:
            String(
                budget.category || ""
            ).trim(),

        limit

    };
}


/* =========================================================
   BUDGETS
   ========================================================= */


/*
 * Get all budgets.
 */
export function getBudgets() {

    const data =
        readStorage(
            STORAGE_KEYS.BUDGETS,
            []
        );


    if (!Array.isArray(data)) {
        return [];
    }


    return data
        .map(normalizeBudget)
        .filter(Boolean);
}


/*
 * Save budgets.
 */
export function saveBudgets(
    budgets
) {

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


    const normalizedBudgets =
        budgets
            .map(normalizeBudget)
            .filter(Boolean);


    return writeStorage(
        STORAGE_KEYS.BUDGETS,
        normalizedBudgets
    );
}


/*
 * Add budget.
 */
export function addBudget(
    budget
) {

    const normalized =
        normalizeBudget(
            budget
        );


    if (!normalized) {

        console.error(
            "Invalid budget.",
            budget
        );

        return null;
    }


    const budgets =
        getBudgets();


    budgets.push(
        normalized
    );


    const saved =
        saveBudgets(
            budgets
        );


    if (!saved) {
        return null;
    }


    return normalized;
}


/*
 * Update budget.
 */
export function updateBudget(
    id,
    updatedData
) {

    if (
        !id ||
        !updatedData ||
        typeof updatedData !== "object"
    ) {

        return null;
    }


    const budgets =
        getBudgets();


    const index =
        budgets.findIndex(
            budget =>
                String(budget.id) ===
                String(id)
        );


    if (index === -1) {

        return null;
    }


    const updatedBudget = {

        ...budgets[index],

        ...updatedData,

        id:
            budgets[index].id

    };


    const normalized =
        normalizeBudget(
            updatedBudget
        );


    if (!normalized) {

        console.error(
            "Updated budget is invalid."
        );

        return null;
    }


    budgets[index] =
        normalized;


    const saved =
        saveBudgets(
            budgets
        );


    if (!saved) {
        return null;
    }


    return normalized;
}


/*
 * Delete budget.
 */
export function deleteBudget(
    id
) {

    if (!id) {
        return false;
    }


    const budgets =
        getBudgets();


    const filtered =
        budgets.filter(
            budget =>
                String(budget.id) !==
                String(id)
        );


    if (
        filtered.length ===
        budgets.length
    ) {

        return false;
    }


    return saveBudgets(
        filtered
    );
}


/*
 * Get budget by category.
 */
export function getBudgetByCategory(
    category,
    month = ""
) {

    return (
        getBudgets().find(
            budget =>
                budget.category ===
                    category &&
                (
                    !month ||
                    budget.month === month
                )
        ) || null
    );
}


/*
 * Get budgets by month.
 */
export function getBudgetsByMonth(
    month
) {

    return getBudgets()
        .filter(
            budget =>
                budget.month === month
        );
}


/*
 * Delete all budgets.
 */
export function clearBudgets() {

    return saveBudgets([]);
}


/* =========================================================
   PREFERENCES
   ========================================================= */


/*
 * Get preferences.
 */
export function getPreferences() {

    const data =
        readStorage(
            STORAGE_KEYS.PREFERENCES,
            {
                currency: "USD"
            }
        );


    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {

        return {
            currency: "USD"
        };
    }


    return {

        currency:
            String(
                data.currency ||
                "USD"
            ).toUpperCase()

    };
}


/*
 * Save preferences.
 */
export function savePreferences(
    preferences
) {

    if (
        !preferences ||
        typeof preferences !== "object" ||
        Array.isArray(preferences)
    ) {

        console.error(
            "Invalid preferences."
        );

        return false;
    }


    const normalized = {

        currency:
            String(
                preferences.currency ||
                "USD"
            ).toUpperCase()

    };


    return writeStorage(
        STORAGE_KEYS.PREFERENCES,
        normalized
    );
}


/* =========================================================
   CLEAR EVERYTHING
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
