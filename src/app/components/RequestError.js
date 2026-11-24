import escape_html from "../helpers/escape_html.js";

export function RequestError(data = {}) {
     const d = document,
          $error = d.createElement("div"),
          $styles = d.getElementById("dynamic-styles"),
          {
               title = "Couldn't load content",
               message = "Something went wrong. Please try again.",
               compact = false,
               retryLabel = "Try again",
               onRetry
          } = data;

     $error.classList.add("request-error");
     if(compact) $error.classList.add("request-error--compact");
     $error.setAttribute("role", "alert");

     $error.insertAdjacentHTML("beforeend", `
          <span class="request-error__icon" aria-hidden="true">!</span>
          <div class="request-error__content">
               <h2 class="request-error__title">${escape_html(title)}</h2>
               <p class="request-error__message">${escape_html(message)}</p>
               <button type="button" class="request-error__retry">${escape_html(retryLabel)}</button>
          </div>
     `);

     $error.querySelector(".request-error__retry").addEventListener("click", () => {
          if(typeof onRetry === "function") onRetry();
          else location.reload();
     });

     if(!$styles.dataset.requestErrorStyles) {
          $styles.dataset.requestErrorStyles = "true";
          $styles.insertAdjacentHTML("beforeend", `
               .request-error {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.85rem;
                    margin: 1.5rem 1.225rem;
                    padding: 1.25rem;
                    border: 1px solid #f0c2c0;
                    border-radius: 0.5rem;
                    background-color: #fff6f5;
                    color: #7a2020;
               }

               .request-error__icon {
                    flex: 0 0 auto;
                    display: grid;
                    place-items: center;
                    width: 1.5rem;
                    height: 1.5rem;
                    border-radius: 50%;
                    background-color: #c62828;
                    color: #fff;
                    font-weight: 700;
               }

               .request-error__content {
                    flex: 1 1 auto;
               }

               .request-error__title {
                    font-size: 1rem;
                    font-weight: 500;
               }

               .request-error__message {
                    margin-top: 0.35rem;
                    font-size: 0.9375rem;
                    line-height: 1.4;
               }

               .request-error__retry {
                    margin-top: 0.85rem;
                    padding: 0.45rem 0.9rem;
                    border-radius: 0.25rem;
                    background-color: #c62828;
                    color: #fff;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
               }

               .request-error__retry:hover {
                    background-color: #9f1c1c;
               }

               .request-error--compact {
                    gap: 0.6rem;
                    margin: 0.75rem 0 1rem;
                    padding: 0.75rem;
               }

               .request-error--compact .request-error__icon {
                    width: 1.25rem;
                    height: 1.25rem;
                    font-size: 0.8125rem;
               }

               .request-error--compact .request-error__title {
                    font-size: 0.875rem;
               }

               .request-error--compact .request-error__message {
                    font-size: 0.8125rem;
               }

               .request-error--compact .request-error__retry {
                    margin-top: 0.5rem;
                    padding: 0.35rem 0.7rem;
                    font-size: 0.8125rem;
               }

               @media (min-width: 768px) {
                    .request-error {
                         margin-left: 2.5rem;
                         margin-right: 2.5rem;
                    }
               }

               @media (min-width: 1024px) {
                    .request-error {
                         margin-left: 2.45rem;
                         margin-right: 2.45rem;
                    }
               }
          `);
     }

     return $error;
}
