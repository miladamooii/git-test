import TMDB_KEYS from "./TMDb-keys.js"
import { RequestError } from "../components/RequestError.js"

const REQUEST_TIMEOUT = 12000;

export async function ajax(props) {

     const { url, cbSuccess, cbError, showGlobalError = true } = props,
          controller = new AbortController(),
          timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT),
          requestHash = location.hash,
          options = {
               headers: new Headers({
                    'Authorization': `Bearer ${TMDB_KEYS.v4}`,
                    'Content-Type': 'application/json;charset=utf-8',
               }),
               method: 'GET',
               signal: controller.signal
          };

     try {
          let data;

          if(Array.isArray(url)) {
               const responses = await Promise.all(url.map(requestUrl => fetch(requestUrl, options).then(assertOk)));
               data = await Promise.all(responses.map(response => response.json()));
          } else {
               const response = await fetch(url, options),
                    checkedResponse = await assertOk(response);

               data = await checkedResponse.json();
          }

          if(isStale(requestHash)) return false;

          if(typeof cbSuccess === "function") await cbSuccess(data);
          return true;
     } catch(err) {
          const errorInfo = normalizeError(err);

          console.error("Request failed", err);
          if(isStale(requestHash)) return false;

          if(typeof cbError === "function") cbError(errorInfo, err);
          else if(showGlobalError) renderGlobalError(errorInfo);

          return false;
     } finally {
          clearTimeout(timeoutId);
     }
}

async function assertOk(response) {
     if(response.ok) return response;

     const message = await readErrorMessage(response),
          error = new Error(message);

     error.status = response.status;
     error.statusText = message;
     throw error;
}

async function readErrorMessage(response) {
     try {
          const data = await response.json();
          return data.status_message || data.message || response.statusText || "An error has occurred";
     } catch(err) {
          return response.statusText || "An error has occurred";
     }
}

function normalizeError(err) {
     if(err.name === "AbortError")
          return {
               title: "Request timed out",
               message: "The movie service took too long to respond. Check your connection and try again."
          };

     if(typeof navigator !== "undefined" && navigator.onLine === false)
          return {
               title: "You're offline",
               message: "Check your internet connection and try again."
          };

     if(err.status)
          return {
               title: `Error ${err.status}`,
               message: err.statusText || "The movie service could not complete this request."
          };

     return {
          title: "Couldn't load movies",
          message: "Something went wrong while contacting the movie service. Please try again."
     };
}

function isStale(requestHash) {
     return requestHash !== location.hash;
}

function renderGlobalError(errorInfo) {
     const $title = document.querySelector("title"),
          $main = document.getElementById("main");

     if($title) $title.innerText = `${errorInfo.title} - Movie App`;
     if(!$main) return;

     $main.querySelectorAll(".request-error").forEach($error => $error.remove());
     $main.insertAdjacentElement("beforeend", RequestError(errorInfo));
}
