/*
 * FinanceHub
 * Storage Module
 *
 * Handles all localStorage operations.
 */

// Storage keys
const STORAGE_KEYS = {
    TRANSACTIONS: "financeHubTransactions",
    BUDGETS: "financeHubBudgets",
    PREFERENCES: "financeHubPreferences"
};


/*
 * Generate a unique ID
 */
export function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}


/*
 * Get transactions
 */
export function getTransactions() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

        if (!data) {
            return [];
        }

        return JSON.parse(data);

    } catch (error) {

        console.error("Error reading transactions:", error);

        return [];
    }
}


/*
 * Save transactions
 */
export function saveTransactions(transactions) {
    try {

        localStorage.setItem(
            STORAGE_KEYS.TRANSACTIONS,
            JSON.stringify(transactions)
        );

        return true;

    } catch (error) {

        console.error("Error saving transactions:", error);

        return false;
    }
}


/*
 * Add a transaction
 */
export function addTransaction(transaction) {

    const transactions = getTransactions();

    const newTransaction = {
        id: transaction.id || generateId(),
        type: transaction.type,
        description: transaction.description,
        amount: Number(transaction.amount),
        category: transaction.category,
        date: transaction.date,
        notes: transaction.notes || "",
        paymentMethod: transaction.paymentMethod || ""
    };

    transactions.push(newTransaction);

    saveTransactions(transactions);

    return newTransaction;
}


/*
 * Update a transaction
 */
export function updateTransaction(id, updatedData) {

    const transactions = getTransactions();

    const index = transactions.findIndex(
        transaction => transaction.id === id
    );

    if (index === -1) {
        return null;
    }

    transactions[index] = {
        ...transactions[index],
        ...updatedData,
        amount: Number(updatedData.amount ?? transactions[index].amount)
    };

    saveTransactions(transactions);

    return transactions[index];
}


/*
 * Delete a transaction
 */
export function deleteTransaction(id) {

    const transactions = getTransactions();

    const filteredTransactions = transactions.filter(
        transaction => transaction.id !== id
    );

    saveTransactions(filteredTransactions);

    return true;
}


/*
 * Get a single transaction
 */
export function getTransactionById(id) {

    const transactions = getTransactions();

    return transactions.find(
        transaction => transaction.id === id
    );
}


/*
 * Get budgets
 */
export function getBudgets() {

    try {

        const data = localStorage.getItem(
            STORAGE_KEYS.BUDGETS
        );

        if (!data) {
            return [];
        }

        return JSON.parse(data);

    } catch (error) {

        console.error("Error reading budgets:", error);

        return [];
    }
}


/*
 * Save budgets
 */
export function saveBudgets(budgets) {

    try {

        localStorage.setItem(
            STORAGE_KEYS.BUDGETS,
            JSON.stringify(budgets)
        );

        return true;

    } catch (error) {

        console.error("Error saving budgets:", error);

        return false;
    }
}


/*
 * Add a budget
 */
export function addBudget(budget) {

    const budgets = getBudgets();

    const newBudget = {
        id: budget.id || generateId(),
        month: budget.month,
        category: budget.category,
        limit: Number(budget.limit)
    };

    budgets.push(newBudget);

    saveBudgets(budgets);

    return newBudget;
}


/*
 * Update a budget
 */
export function updateBudget(id, updatedData) {

    const budgets = getBudgets();

    const index = budgets.findIndex(
        budget => budget.id === id
    );

    if (index === -1) {
        return null;
    }

    budgets[index] = {
        ...budgets[index],
        ...updatedData,
        limit: Number(
            updatedData.limit ?? budgets[index].limit
        )
    };

    saveBudgets(budgets);

    return budgets[index];
}


/*
 * Delete a budget
 */
export function deleteBudget(id) {

    const budgets = getBudgets();

    const filteredBudgets = budgets.filter(
        budget => budget.id !== id
    );

    saveBudgets(filteredBudgets);

    return true;
}


/*
 * Get user preferences
 */
export function getPreferences() {

    try {

        const data = localStorage.getItem(
            STORAGE_KEYS.PREFERENCES
        );

        if (!data) {
            return {
                currency: "USD"
            };
        }

        return JSON.parse(data);

    } catch (error) {

        console.error("Error reading preferences:", error);

        return {
            currency: "USD"
        };
    }
}


/*
 * Save user preferences
 */
export function savePreferences(preferences) {

    try {

        localStorage.setItem(
            STORAGE_KEYS.PREFERENCES,
            JSON.stringify(preferences)
        );

        return true;

    } catch (error) {

        console.error("Error saving preferences:", error);

        return false;
    }
}


/*
 * Clear all FinanceHub data
 */
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
