/*
 * FinanceHub
 * Storage Module
 *
 * Centralized localStorage management.
 *
 * Transaction:
 * {
 *   id,
 *   type,
 *   description,
 *   amount,
 *   category,
 *   date,
 *   notes,
 *   paymentMethod
 * }
 *
 * Budget:
 * {
 *   id,
 *   month,
 *   category,
 *   limit
 * }
 */


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const KEYS = {
    TRANSACTIONS: "financeHubTransactions",
    BUDGETS: "financeHubBudgets",
    PREFERENCES: "financeHubPreferences"
};


/* =========================================================
   ID
   ========================================================= */

export function generateId() {

    if (
        typeof crypto !== "undefined" &&
        crypto.randomUUID
    ) {
        return crypto.randomUUID();
    }

    return (
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}


/* =========================================================
   GENERIC STORAGE
   ========================================================= */

function getData(key, fallback = []) {

    try {

        const data =
            localStorage.getItem(key);

        return data
            ? JSON.parse(data)
            : fallback;

    } catch (error) {

        console.error(
            `Error reading ${key}:`,
            error
        );

        return fallback;
    }
}


function saveData(key, data) {

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
   TRANSACTION NORMALIZER
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


    return {

        id:
            String(
                transaction.id ||
                generateId()
            ),

        type,

        description:
            String(
                transaction.description || ""
            ).trim(),

        amount,

        category:
            String(
                transaction.category || ""
            ).trim(),

        date:
            String(
                transaction.date || ""
            ).trim(),

        notes:
            String(
                transaction.notes || ""
            ).trim(),

        paymentMethod:
            String(
                transaction.paymentMethod || ""
            ).trim()

    };
}


/* =========================================================
   TRANSACTIONS
   ========================================================= */

export function getTransactions() {

    const data =
        getData(
            KEYS.TRANSACTIONS,
            []
        );


    if (!Array.isArray(data)) {
        return [];
    }


    return data
        .map(normalizeTransaction)
        .filter(Boolean);
}


export function saveTransactions(
    transactions
) {

    if (!Array.isArray(transactions)) {

        console.error(
            "Transactions must be an array."
        );

        return false;
    }


    const normalized =
        transactions
            .map(normalizeTransaction)
            .filter(Boolean);


    return saveData(
        KEYS.TRANSACTIONS,
        normalized
    );
}


export function addTransaction(
    transaction
) {

    const normalized =
        normalizeTransaction(
            transaction
        );


    if (!normalized) {

        console.error(
            "Invalid transaction:",
            transaction
        );

        return null;
    }


    const transactions =
        getTransactions();


    transactions.push(
        normalized
    );


    return saveTransactions(
        transactions
    )
        ? normalized
        : null;
}


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
                String(transaction.id) ===
                String(id)
        );


    if (index === -1) {
        return null;
    }


    const updated = {
        ...transactions[index],
        ...updatedData,
        id: transactions[index].id
    };


    const normalized =
        normalizeTransaction(
            updated
        );


    if (!normalized) {
        return null;
    }


    transactions[index] =
        normalized;


    return saveTransactions(
        transactions
    )
        ? normalized
        : null;
}


export function deleteTransaction(
    id
) {

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


export function getTransactionById(
    id
) {

    return (
        getTransactions().find(
            transaction =>
                String(transaction.id) ===
                String(id)
        ) || null
    );
}


/* =========================================================
   BUDGET NORMALIZER
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

export function getBudgets() {

    const data =
        getData(
            KEYS.BUDGETS,
            []
        );


    if (!Array.isArray(data)) {
        return [];
    }


    return data
        .map(normalizeBudget)
        .filter(Boolean);
}


export function saveBudgets(
    budgets
) {

    if (!Array.isArray(budgets)) {

        console.error(
            "Budgets must be an array."
        );

        return false;
    }


    const normalized =
        budgets
            .map(normalizeBudget)
            .filter(Boolean);


    return saveData(
        KEYS.BUDGETS,
        normalized
    );
}


export function addBudget(
    budget
) {

    const normalized =
        normalizeBudget(
            budget
        );


    if (!normalized) {

        console.error(
            "Invalid budget:",
            budget
        );

        return null;
    }


    const budgets =
        getBudgets();


    budgets.push(
        normalized
    );


    return saveBudgets(
        budgets
    )
        ? normalized
        : null;
}


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
                String(budget.id) ===
                String(id)
        );


    if (index === -1) {
        return null;
    }


    const updated = {

        ...budgets[index],

        ...updatedData,

        id:
            budgets[index].id

    };


    const normalized =
        normalizeBudget(
            updated
        );


    if (!normalized) {
        return null;
    }


    budgets[index] =
        normalized;


    return saveBudgets(
        budgets
    )
        ? normalized
        : null;
}


export function deleteBudget(
    id
) {

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


/* =========================================================
   PREFERENCES
   ========================================================= */

export function getPreferences() {

    const data =
        getData(
            KEYS.PREFERENCES,
            {
                currency: "USD"
            }
        );


    return {

        currency:
            String(
                data?.currency ||
                "USD"
            ).toUpperCase()

    };
}


export function savePreferences(
    preferences
) {

    if (
        !preferences ||
        typeof preferences !== "object"
    ) {
        return false;
    }


    return saveData(
        KEYS.PREFERENCES,
        {
            currency:
                String(
                    preferences.currency ||
                    "USD"
                ).toUpperCase()
        }
    );
}


/* =========================================================
   CLEAR ALL DATA
   ========================================================= */

export function clearAllData() {

    localStorage.removeItem(
        KEYS.TRANSACTIONS
    );

    localStorage.removeItem(
        KEYS.BUDGETS
    );

    localStorage.removeItem(
        KEYS.PREFERENCES
    );
}
