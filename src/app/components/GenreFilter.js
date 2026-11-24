import { ajax } from "../helpers/ajax.js";
import api from "../helpers/TMDb-api.js";
import string_to_slug from "../helpers/string_to_slug.js";
import { syncWatchlistUI } from "../helpers/watchlist.js";
import { RequestError } from "./RequestError.js";

export function GenreFilter(conf) {
     const d = document,
          $container = d.createElement("div"),
          $styles = d.getElementById("dynamic-styles"),
          {
               genres,
               sliderClass,
               SlidesComponent,
               includeAll = true,
               initialGenreId = null,
               initialResults = [],
               linkExploreAll = "",
               updateTitle = false
          } = conf;

     let activeGenreId = initialGenreId,
          requestId = 0;

     $container.classList.add("genre-filter");
     $container.insertAdjacentHTML("beforeend", `
          <span class="genre-filter__label">Filter by genre:</span>
     `);

     if(includeAll)
          $container.insertAdjacentHTML("beforeend", `
               <button type="button"
                       class="genre-filter__chip${initialGenreId === null ? " is-active" : ""}"
                       data-genre-id=""
                       aria-pressed="${initialGenreId === null ? "true" : "false"}">
                    All
               </button>
          `);

     genres.forEach(genre => {
          const isActive = String(genre.id) === String(initialGenreId);

          $container.insertAdjacentHTML("beforeend", `
               <button type="button"
                       class="genre-filter__chip${isActive ? " is-active" : ""}"
                       data-genre-id="${genre.id}"
                       aria-pressed="${isActive ? "true" : "false"}">
                    ${genre.name}
               </button>
          `);
     });

     if(!$styles.dataset.genreFilterStyles) {
          $styles.dataset.genreFilterStyles = "true";
          $styles.insertAdjacentHTML("beforeend", `
               .genre-filter {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 0.5rem;
                    margin: 0 1.225rem 1rem;
               }

               .genre-filter__label {
                    width: 100%;
                    font-size: 0.8125rem;
                    color: #666c70;
               }

               .genre-filter__chip {
                    padding: 0.35rem 0.85rem;
                    border: 1px solid rgba(0, 0, 0, 0.18);
                    border-radius: 1rem;
                    background-color: rgba(0, 0, 0, 0.06);
                    font-size: 0.8125rem;
                    line-height: 1;
                    cursor: pointer;
                    transition: 0.2s ease all;
               }

               .genre-filter__chip:hover {
                    background-color: rgba(0, 0, 0, 0.12);
               }

               .genre-filter__chip.is-active {
                    border-color: #2196f3;
                    background-color: #2196f3;
                    color: #fff;
               }

               .genre-filter__error {
                    width: 100%;
               }

               @media (min-width: 600px) {
                    .genre-filter__label {
                         width: auto;
                         margin-right: 0.25rem;
                    }
               }

               @media (min-width: 768px) {
                    .genre-filter {
                         margin-left: 2.5rem;
                    }
               }

               @media (min-width: 1024px) {
                    .genre-filter {
                         margin-left: 2.45rem;
                    }
               }
          `);
     }

     function setActiveChip(genreId) {
          $container.querySelectorAll(".genre-filter__chip").forEach($chip => {
               const isActive = ($chip.dataset.genreId || "") === String(genreId || "");

               $chip.classList.toggle("is-active", isActive);
               $chip.setAttribute("aria-pressed", isActive ? "true" : "false");
          });
     }

     function getGenre(genreId) {
          return genres.find(genre => String(genre.id) === String(genreId));
     }

     function getExploreLink(genreId) {
          const genre = getGenre(genreId);

          return genre
               ? `#/genre/${genre.id}/${string_to_slug(genre.name)}`
               : linkExploreAll;
     }

     function clearInlineError() {
          const $error = $container.querySelector(".genre-filter__error");
          if($error) $error.remove();
     }

     function renderSlides(movies, exploreLink) {
          const $section = $container.closest(".slider-section");
          if(!$section) return;

          const $wrapper = $section.querySelector(`.${sliderClass} .swiper-wrapper`);
          if(!$wrapper) return;

          const $firstSlide = $wrapper.querySelector(".swiper-slide"),
               width = $firstSlide ? $firstSlide.style.width : "",
               marginRight = $firstSlide ? $firstSlide.style.marginRight : "",
               $fragment = d.createDocumentFragment();

          movies.forEach(movie => {
               const $slide = SlidesComponent({ props: movie });

               $slide.style.width = width;
               $slide.style.marginRight = marginRight;
               $fragment.appendChild($slide);
          });

          if(linkExploreAll) {
               const $lastCard = SlidesComponent({
                    lastCard: {
                         title: "Explore More...",
                         link: exploreLink
                    }
               });

               $lastCard.style.width = width;
               $lastCard.style.marginRight = marginRight;
               $fragment.appendChild($lastCard);
          }

          $wrapper.innerHTML = "";
          $wrapper.appendChild($fragment);

          const swiper = $section.querySelector(".swiper-container")?.swiper;
          if(swiper) {
               swiper.update();
               swiper.slideTo(0, 0);
          }

          syncWatchlistUI();
     }

     async function applyGenreFilter(genreId, previousGenreId = activeGenreId) {
          clearInlineError();

          const currentRequest = ++requestId,
               $section = $container.closest(".slider-section"),
               $backdrop = $section?.querySelector(`.${sliderClass} .backdrop`),
               $exploreLink = $section?.querySelector(".slider-section__explore-link"),
               $title = $section?.querySelector(".slider-section__title"),
               genre = getGenre(genreId),
               exploreLink = getExploreLink(genreId),
               previousExploreHref = $exploreLink?.href,
               previousTitle = $title?.textContent.trim();

          activeGenreId = genreId || null;
          setActiveChip(genreId);

          if($backdrop) $backdrop.style.display = "block";
          if($exploreLink && linkExploreAll) $exploreLink.href = exploreLink;

          if($title && updateTitle) {
               const baseTitle = $container.dataset.baseTitle || $title.textContent.trim();

               $container.dataset.baseTitle = baseTitle;
               $title.textContent = genre ? `${baseTitle} · ${genre.name}` : baseTitle;
          }

          let results = null;

          if(!genreId || genreId === String(initialGenreId || ""))
               results = initialResults;
          else
               await ajax({
                    url: `${api.POPULAR}&with_genres=${genreId}`,
                    showGlobalError: false,
                    cbSuccess: (data) => results = data.results,
                    cbError: (errorInfo) => {
                         if(currentRequest !== requestId) return;

                         activeGenreId = previousGenreId;
                         setActiveChip(previousGenreId);

                         if($exploreLink && linkExploreAll && previousExploreHref)
                              $exploreLink.href = previousExploreHref;

                         if($title && updateTitle && previousTitle !== undefined)
                              $title.textContent = previousTitle;

                         const $error = RequestError({
                              ...errorInfo,
                              compact: true,
                              retryLabel: "Retry filter",
                              onRetry: () => applyGenreFilter(genreId, previousGenreId)
                         });

                         $error.classList.add("genre-filter__error");
                         $container.appendChild($error);
                    }
               });

          if($backdrop) $backdrop.style.display = "none";
          if(currentRequest !== requestId || !results) return;

          renderSlides(results, exploreLink);
     }

     $container.addEventListener("click", e => {
          const $chip = e.target.closest(".genre-filter__chip");
          if(!$chip || !$container.contains($chip)) return false;

          const genreId = $chip.dataset.genreId || "";
          if(genreId === String(activeGenreId || "")) return false;

          applyGenreFilter(genreId);
     });

     return $container;
}
