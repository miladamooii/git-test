const STORAGE_KEY = "movie-app-watchlist";

let initialized = false;

function readWatchlist() {
     try {
          const raw = localStorage.getItem(STORAGE_KEY),
               parsed = raw ? JSON.parse(raw) : [];

          return Array.isArray(parsed) ? parsed.filter(movie => movie && movie.id) : [];
     } catch (err) {
          console.warn("Could not read the watchlist", err);
          return [];
     }
}

function saveWatchlist(movies) {
     try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
     } catch (err) {
          console.warn("Could not save the watchlist", err);
     }
}

export function toWatchlistItem(movie) {
     return {
          id: movie.id,
          title: movie.title || movie.name || "",
          poster_path: movie.poster_path || null,
          backdrop_path: movie.backdrop_path || null,
          vote_average: movie.vote_average || 0,
          overview: movie.overview || "",
          release_date: movie.release_date || ""
     };
}

export function getWatchlist() {
     return readWatchlist();
}

export function isInWatchlist(id) {
     return readWatchlist().some(movie => String(movie.id) === String(id));
}

export function toggleWatchlist(movie) {
     const movies = readWatchlist(),
          id = String(movie.id),
          exists = movies.some(item => String(item.id) === id);

     if (exists) {
          saveWatchlist(movies.filter(item => String(item.id) !== id));
          return false;
     }

     movies.unshift(toWatchlistItem(movie));
     saveWatchlist(movies);
     return true;
}

export function watchlistButtonHTML(movie) {
     const item = toWatchlistItem(movie),
          data = encodeURIComponent(JSON.stringify(item));

     return `
          <button type="button"
                  class="watchlist-btn swiper-no-swiping"
                  data-watchlist-id="${item.id}"
                  data-movie="${data}"
                  aria-pressed="false"
                  aria-label="Add to watchlist"
                  title="Add to watchlist">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.7"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"></path>
               </svg>
               <span class="watchlist-btn__label">Watchlist</span>
          </button>
     `;
}

export function syncWatchlistUI() {
     const movies = getWatchlist(),
          ids = new Set(movies.map(movie => String(movie.id)));

     document.querySelectorAll("button[data-watchlist-id]").forEach($btn => {
          const isSaved = ids.has(String($btn.dataset.watchlistId)),
               action = isSaved ? "Remove from watchlist" : "Add to watchlist";

          $btn.classList.toggle("is-active", isSaved);
          $btn.setAttribute("aria-pressed", isSaved ? "true" : "false");
          $btn.setAttribute("aria-label", action);
          $btn.title = action;

          const $label = $btn.querySelector(".watchlist-btn__label");
          if ($label) $label.textContent = isSaved ? "In watchlist" : "Watchlist";
     });

     document.querySelectorAll("[data-watchlist-count]").forEach($count => {
          $count.textContent = movies.length ? movies.length : "";
     });

     const $total = document.querySelector(".watchlist-view [data-results-total]");
     if ($total) $total.textContent = `${movies.length} Results`;
}

function updateWatchlistView(id, wasAdded) {
     if (wasAdded || !/#\/watchlist/.test(location.hash)) return;

     document.querySelectorAll(`.movie-card[data-watchlist-movie-id="${id}"]`)
          .forEach($card => $card.remove());

     const $items = document.querySelector(".watchlist-view .results__items");
     if ($items && !$items.querySelector(".movie-card")) {
          $items.innerHTML = `
               <h4>Your watchlist is empty. Save movies with the bookmark button.</h4>
          `;
     }
}

function injectStyles() {
     const $styles = document.getElementById("dynamic-styles");
     if (!$styles || $styles.dataset.watchlistStyles) return;

     $styles.dataset.watchlistStyles = "true";
     $styles.insertAdjacentHTML("beforeend", `
          .watchlist-btn {
               display: inline-flex;
               align-items: center;
               justify-content: center;
               gap: 0.5rem;
               color: #fff;
               cursor: pointer;
               transition: 0.2s ease all;
          }

          .watchlist-btn svg {
               flex: 0 0 auto;
          }

          .watchlist-btn:hover,
          .watchlist-btn.is-active {
               color: #2196f3;
          }

          .watchlist-btn.is-active svg {
               fill: rgba(33, 150, 243, 0.25);
          }

          .movie-card .card__inner {
               position: relative;
          }

          .movie-card .watchlist-btn {
               position: absolute;
               top: 0.5rem;
               right: 0.5rem;
               z-index: 2;
               width: 2rem;
               height: 2rem;
               padding: 0;
               border-radius: 50%;
               background-color: rgba(0, 0, 0, 0.7);
          }

          .movie-card .watchlist-btn:hover {
               background-color: rgba(0, 0, 0, 0.9);
          }

          .movie-card .watchlist-btn__label,
          .header .watchlist-btn__label {
               display: none;
          }

          .header__backdrop .watchlist-btn {
               position: absolute;
               top: 1rem;
               right: 1rem;
               left: auto;
               display: inline-flex;
               width: 2.75rem;
               height: 2.75rem;
               padding: 0;
               border: 1px solid rgba(255, 255, 255, 0.7);
               border-radius: 50%;
               background-color: rgba(0, 0, 0, 0.55);
               transform: none;
          }

          .header__backdrop .watchlist-btn:hover {
               background-color: rgba(0, 0, 0, 0.85);
          }
     `);
}

export function initWatchlist() {
     if (initialized) return;
     initialized = true;

     injectStyles();

     document.addEventListener("click", e => {
          const $btn = e.target.closest("button[data-watchlist-id]");
          if (!$btn) return;

          e.preventDefault();
          e.stopPropagation();

          let movie;
          try {
               movie = JSON.parse(decodeURIComponent($btn.dataset.movie));
          } catch (err) {
               movie = null;
          }

          if (!movie || !movie.id) return;

          const wasAdded = toggleWatchlist(movie);
          syncWatchlistUI();
          updateWatchlistView(movie.id, wasAdded);
     });

     syncWatchlistUI();
}
