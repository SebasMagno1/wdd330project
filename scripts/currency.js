/*
 * FinanceHub
 * Currency Converter
*/

/* =========================================================
   API CONFIGURATION
   ========================================================= */

    const API_URL = "https://api.frankfurter.app/latest";


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeCurrencyConverter();

    }
);


/* =========================================================
   INITIALIZE CONVERTER
   ========================================================= */

function initializeCurrencyConverter() {

    const form =
        document.querySelector(
            "#currency-form"
        );


    if (!form) {
        console.warn(
            "Currency form was not found."
        );

        return;
    }


    form.addEventListener(
        "submit",
        handleConversion
    );

}


/* =========================================================
   HANDLE CONVERSION
   ========================================================= */

async function handleConversion(
    event
) {

    event.preventDefault();

    const amount =
        Number(
            document.querySelector(
                "#currency-amount"
            )?.value
        );


    const fromCurrency =
        document.querySelector(
            "#from-currency"
        )?.value;


    const toCurrency =
        document.querySelector(
            "#to-currency"
        )?.value;


    const resultElement =
        document.querySelector(
            "#conversion-result"
        );


    /* -----------------------------------------------------
       VALIDATION
       ----------------------------------------------------- */

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showResult(
            "Please enter a valid amount."
        );

        return;

    }


    if (
        !fromCurrency ||
        !toCurrency
    ) {

        showResult(
            "Please select both currencies."
        );

        return;

    }


    /* -----------------------------------------------------
       SAME CURRENCY
       ----------------------------------------------------- */

    if (
        fromCurrency ===
        toCurrency
    ) {

        showResult(
            `${formatNumber(amount)} ${fromCurrency} = ` +
            `${formatNumber(amount)} ${toCurrency}`
        );

        return;

    }


    /* -----------------------------------------------------
       LOADING
       ----------------------------------------------------- */

    showResult(
        "Converting..."
    );


    try {

        const url =
            `${API_URL}?amount=${encodeURIComponent(
                amount
            )}&from=${encodeURIComponent(
                fromCurrency
            )}&to=${encodeURIComponent(
                toCurrency
            )}`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `API request failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            typeof data.rates?.[toCurrency] !==
            "number"
        ) {

            throw new Error(
                "Conversion rate was not returned."
            );

        }


        const convertedAmount =
            data.rates[toCurrency];


        const rate =
            convertedAmount / amount;


        showResult(`
            <strong>
                ${formatNumber(amount)}
                ${fromCurrency}
            </strong>

            =
            
            <strong>
                ${formatNumber(convertedAmount)}
                ${toCurrency}
            </strong>

            <small>
                Exchange rate:
                1 ${fromCurrency}
                =
                ${formatNumber(rate)}
                ${toCurrency}
            </small>
        `);


    } catch (error) {

        console.error(
            "Currency conversion error:",
            error
        );


        showResult(
            "Unable to retrieve the exchange rate. " +
            "Please try again later."
        );

    }

}


/* =========================================================
   SHOW RESULT
   ========================================================= */

function showResult(
    message
) {

    const resultElement =
        document.querySelector(
            "#conversion-result"
        );


    if (!resultElement) {
        return;
    }


    resultElement.innerHTML =
        message;

}


/* =========================================================
   FORMAT NUMBER
   ========================================================= */

function formatNumber(
    value
) {

    return new Intl.NumberFormat(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(
        Number(value) || 0
    );

}

