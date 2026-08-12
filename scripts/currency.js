/*
 * FinanceHub
 * Currency Converter Module
 */

const API_KEY = "YOUR_API_KEY";

const API_URL =
    "https://v6.exchangerate-api.com/v6";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const currencyForm =
    document.querySelector("#currency-form");

const amountInput =
    document.querySelector("#currency-amount");

const fromCurrency =
    document.querySelector("#from-currency");

const toCurrency =
    document.querySelector("#to-currency");

const resultElement =
    document.querySelector("#conversion-result");

const rateElement =
    document.querySelector("#exchange-rate");

const swapButton =
    document.querySelector("#swap-currencies");

const currencyError =
    document.querySelector("#currency-error");


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setDefaultCurrencies();

    }
);


/* =========================================================
   DEFAULT CURRENCIES
   ========================================================= */

function setDefaultCurrencies() {

    if (fromCurrency) {

        fromCurrency.value =
            "USD";

    }


    if (toCurrency) {

        toCurrency.value =
            "EUR";

    }

}


/* =========================================================
   CONVERT CURRENCY
   ========================================================= */

if (currencyForm) {

    currencyForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            clearError();


            const amount =
                Number(
                    amountInput.value
                );


            const from =
                fromCurrency.value;


            const to =
                toCurrency.value;


            if (
                !amount ||
                amount <= 0
            ) {

                showError(
                    "Please enter a valid amount."
                );

                return;
            }


            if (from === to) {

                displayResult(
                    amount,
                    from,
                    to,
                    1
                );

                return;
            }


            try {

                showLoading();


                const rate =
                    await getExchangeRate(
                        from,
                        to
                    );


                displayResult(
                    amount,
                    from,
                    to,
                    rate
                );


            } catch (error) {

                console.error(
                    "Currency API error:",
                    error
                );


                showError(
                    "Unable to retrieve exchange rates. Please try again."
                );

            }

        }
    );

}


/* =========================================================
   GET EXCHANGE RATE
   ========================================================= */

async function getExchangeRate(
    from,
    to
) {

    /*
     * Replace YOUR_API_KEY with
     * your ExchangeRate API key.
     */

    const url =
        `${API_URL}/${API_KEY}/pair/${from}/${to}`;


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            "API request failed."
        );

    }


    const data =
        await response.json();


    if (
        data.result !==
        "success"
    ) {

        throw new Error(
            "Exchange rate request failed."
        );

    }


    return data.conversion_rate;

}


/* =========================================================
   DISPLAY RESULT
   ========================================================= */

function displayResult(
    amount,
    from,
    to,
    rate
) {

    const convertedAmount =
        amount * rate;


    if (resultElement) {

        resultElement.innerHTML = `

            <span class="conversion-amount">

                ${formatNumber(
                    amount
                )}
                ${from}

            </span>

            <span class="conversion-arrow">
                →
            </span>

            <span class="conversion-amount">

                ${formatNumber(
                    convertedAmount
                )}
                ${to}

            </span>

        `;

    }


    if (rateElement) {

        rateElement.textContent =
            `1 ${from} = ${rate.toFixed(6)} ${to}`;

    }

}


/* =========================================================
   SWAP CURRENCIES
   ========================================================= */

if (swapButton) {

    swapButton.addEventListener(
        "click",
        () => {

            const currentFrom =
                fromCurrency.value;


            fromCurrency.value =
                toCurrency.value;


            toCurrency.value =
                currentFrom;


            /*
             * Automatically convert
             * the current amount after
             * swapping.
             */

            if (
                amountInput.value
            ) {

                currencyForm.dispatchEvent(
                    new Event(
                        "submit"
                    )
                );

            }

        }
    );

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading() {

    if (resultElement) {

        resultElement.textContent =
            "Converting...";

    }


    if (rateElement) {

        rateElement.textContent =
            "";

    }

}


/* =========================================================
   ERROR
   ========================================================= */

function showError(
    message
) {

    if (currencyError) {

        currencyError.textContent =
            message;

        currencyError.classList.add(
            "show"
        );

    }

}


function clearError() {

    if (currencyError) {

        currencyError.textContent =
            "";

        currencyError.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   FORMAT NUMBER
   ========================================================= */

function formatNumber(
    number
) {

    return new Intl.NumberFormat(
        "en-US",
        {
            maximumFractionDigits: 2
        }
    ).format(number);

}

