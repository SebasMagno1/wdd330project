/*
 * FinanceHub
 * Financial News Module
 */

const API_KEY = "YOUR_GNEWS_API_KEY";

const API_URL =
    "https://gnews.io/api/v4/search";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const newsContainer =
    document.querySelector("#news-container");

const newsForm =
    document.querySelector("#news-search-form");

const newsSearch =
    document.querySelector("#news-search");

const newsCategory =
    document.querySelector("#news-category");

const newsError =
    document.querySelector("#news-error");

const loadingElement =
    document.querySelector("#news-loading");


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadFinancialNews();

    }
);


/* =========================================================
   SEARCH FORM
   ========================================================= */

if (newsForm) {

    newsForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            loadFinancialNews();

        }
    );

}


/* =========================================================
   LOAD NEWS
   ========================================================= */

async function loadFinancialNews() {

    clearError();

    showLoading();


    const searchTerm =
        newsSearch?.value.trim() ||
        "finance";


    try {

        const articles =
            await fetchNews(
                searchTerm
            );


        displayNews(
            articles
        );


    } catch (error) {

        console.error(
            "GNews error:",
            error
        );


        showError(
            "Unable to load financial news. Please try again later."
        );

    } finally {

        hideLoading();

    }

}


/* =========================================================
   FETCH NEWS
   ========================================================= */

async function fetchNews(
    searchTerm
) {

    const params =
        new URLSearchParams({

            q:
                searchTerm,

            lang:
                "en",

            country:
                "us",

            max:
                "10",

            apikey:
                API_KEY

        });


    const response =
        await fetch(
            `${API_URL}?${params}`
        );


    if (!response.ok) {

        throw new Error(
            "News API request failed."
        );

    }


    const data =
        await response.json();


    if (
        data.errors ||
        !data.articles
    ) {

        throw new Error(
            "Invalid news response."
        );

    }


    return data.articles;

}


/* =========================================================
   DISPLAY NEWS
   ========================================================= */

function displayNews(
    articles
) {

    if (!newsContainer) {
        return;
    }


    if (
        !articles ||
        articles.length === 0
    ) {

        newsContainer.innerHTML = `

            <div class="empty-message">

                <p>
                    No financial news found.
                </p>

            </div>

        `;

        return;

    }


    newsContainer.innerHTML =
        articles
            .map(
                article =>
                    createNewsCard(
                        article
                    )
            )
            .join("");

}


/* =========================================================
   CREATE NEWS CARD
   ========================================================= */

function createNewsCard(
    article
) {

    const image =
        article.image ||
        "images/news-placeholder.jpg";


    const title =
        article.title ||
        "Financial News";


    const description =
        article.description ||
        "Read the latest financial news.";


    const source =
        article.source?.name ||
        "Unknown Source";


    const publishedAt =
        article.publishedAt;


    const url =
        article.url ||
        "#";


    return `

        <article class="news-card">

            <div class="news-image-container">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(title)}"
                    class="news-image"
                    loading="lazy"
                    onerror="this.src='images/news-placeholder.jpg'">

            </div>


            <div class="news-content">

                <div class="news-meta">

                    <span>
                        ${escapeHTML(source)}
                    </span>

                    <span>
                        ${formatDate(
                            publishedAt
                        )}
                    </span>

                </div>


                <h2>
                    ${escapeHTML(title)}
                </h2>


                <p>
                    ${escapeHTML(description)}
                </p>


                <a
                    href="${escapeHTML(url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn primary-btn">

                    Read Article

                </a>

            </div>

        </article>

    `;

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading() {

    if (loadingElement) {

        loadingElement.style.display =
            "block";

    }

}


function hideLoading() {

    if (loadingElement) {

        loadingElement.style.display =
            "none";

    }

}


/* =========================================================
   ERROR
   ========================================================= */

function showError(
    message
) {

    if (!newsError) {
        return;
    }


    newsError.textContent =
        message;


    newsError.classList.add(
        "show"
    );

}


function clearError() {

    if (!newsError) {
        return;
    }


    newsError.textContent =
        "";


    newsError.classList.remove(
        "show"
    );

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(
    date
) {

    if (!date) {
        return "";
    }


    return new Intl.DateTimeFormat(
        "en-US",
        {

            year:
                "numeric",

            month:
                "short",

            day:
                "numeric"

        }
    ).format(
        new Date(date)
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}

