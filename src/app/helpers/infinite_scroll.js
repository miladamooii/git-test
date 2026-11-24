import { ajax } from "./ajax.js";
import api from "./TMDb-api.js";
import { MoviePosterCard } from "../components/MoviePosterCard.js"
import { RequestError } from "../components/RequestError.js";

let scrollListener = null,
     isLoading = false,
     hasFailed = false;

function setSpinner(visible) {
     const $spinner = document.getElementById("results-spin-loader");
     if($spinner) $spinner.style.display = visible ? "block" : "none";
}

function clearError() {
     const $error = document.querySelector(".results .request-error");
     if($error) $error.remove();
}

function showError(errorInfo) {
     clearError();

     const $results = document.querySelector(".results");
     if(!$results) return;

     $results.insertAdjacentElement("beforeend", RequestError({
          ...errorInfo,
          compact: true,
          retryLabel: "Retry loading",
          onRetry: () => {
               hasFailed = false;
               clearError();
               loadNextPage();
          }
     }));
}

async function fetchPage(page) {
     const currentHash = location.hash;

     setSpinner(true);

     try {
          const ok = await ajax({
               url: `${api.infinite_url}${api.infinite_url.includes("?") ? "&" : "?"}page=${page}`,
               showGlobalError: false,
               cbSuccess: (data) => {
                    if(currentHash !== location.hash) return;

                    const $items = document.querySelector(".results__items"),
                         $fragment = document.createDocumentFragment();

                    if(!$items) return;

                    (data.results || []).forEach(movie =>
                         $fragment.appendChild(MoviePosterCard({ props: movie }))
                    );

                    $items.appendChild($fragment);
               },
               cbError: (errorInfo) => {
                    if(currentHash !== location.hash) return;

                    hasFailed = true;
                    showError(errorInfo);
               }
          });

          if(currentHash === location.hash && ok) api.page = page;
          return ok;
     } finally {
          setSpinner(false);
     }
}

function loadNextPage() {
     if(isLoading || hasFailed) return;
     if(api.page >= api.total_pages) return;
     if(!document.querySelector(".results__items")) return;

     const page = api.page + 1;

     isLoading = true;
     fetchPage(page).finally(() => isLoading = false);
}

function handleScroll() {
     const {
          scrollTop,
          clientHeight,
          scrollHeight
     } = document.documentElement;

     if(scrollTop + clientHeight >= scrollHeight - 100)
          loadNextPage();
}

export function infiniteScroll() {
     resetInfiniteScroll();
     scrollListener = handleScroll;
     window.addEventListener("scroll", handleScroll);
}

export function resetInfiniteScroll() {
     if(scrollListener) window.removeEventListener("scroll", scrollListener);

     scrollListener = null;
     isLoading = false;
     hasFailed = false;
     clearError();
     setSpinner(false);
}
