export function ContentSkeleton(conf = {}) {
     const d = document,
          $skeleton = d.createElement("div"),
          $styles = d.getElementById("dynamic-styles"),
          { variant = "results" } = conf,
          cardCount = variant === "home" ? 12 : variant === "details" ? 6 : 8,
          cards = Array.from({ length: cardCount }, () => `
               <div class="content-skeleton__card">
                    <div class="content-skeleton__poster"></div>
                    <div class="content-skeleton__line"></div>
                    <div class="content-skeleton__line content-skeleton__line--short"></div>
               </div>
          `).join("");

     $skeleton.classList.add("content-skeleton", `content-skeleton--${variant}`);
     $skeleton.setAttribute("role", "status");
     $skeleton.setAttribute("aria-label", "Loading content");
     $skeleton.setAttribute("aria-busy", "true");
     $skeleton.innerHTML = `
          <div class="content-skeleton__heading"></div>
          <div class="content-skeleton__subheading"></div>
          <div class="content-skeleton__grid">${cards}</div>
     `;

     if(!$styles.dataset.contentSkeletonStyles) {
          $styles.dataset.contentSkeletonStyles = "true";
          $styles.insertAdjacentHTML("beforeend", `
               .content-skeleton {
                    margin: 1.5rem 1.225rem;
                    padding-top: 3.75rem;
               }

               .content-skeleton--home,
               .content-skeleton--details {
                    padding-top: 0;
               }

               .content-skeleton__heading,
               .content-skeleton__subheading,
               .content-skeleton__poster,
               .content-skeleton__line {
                    background: linear-gradient(90deg, #dcdcdc 25%, #ececec 50%, #dcdcdc 75%);
                    background-size: 200% 100%;
                    animation: content-skeleton-shimmer 1.4s infinite linear;
                    border-radius: 0.25rem;
               }

               .content-skeleton__heading {
                    width: 11rem;
                    height: 1.4rem;
                    margin-bottom: 0.75rem;
               }

               .content-skeleton__subheading {
                    width: 7rem;
                    height: 0.875rem;
                    margin-bottom: 1.5rem;
               }

               .content-skeleton__grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
               }

               .content-skeleton__card {
                    width: calc(100% / 3 - 0.5rem);
               }

               .content-skeleton__poster {
                    aspect-ratio: 2 / 3;
               }

               .content-skeleton__line {
                    height: 0.7rem;
                    margin-top: 0.6rem;
               }

               .content-skeleton__line--short {
                    width: 60%;
                    margin-top: 0.35rem;
               }

               .content-skeleton--details .content-skeleton__heading {
                    width: 16rem;
                    height: 2rem;
               }

               .content-skeleton--details .content-skeleton__poster {
                    aspect-ratio: 16 / 9;
               }

               @keyframes content-skeleton-shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
               }

               @media (min-width: 640px) {
                    .content-skeleton__card {
                         width: calc(25% - 0.5rem);
                    }
               }

               @media (min-width: 768px) {
                    .content-skeleton {
                         margin-left: 2.5rem;
                         margin-right: 2.5rem;
                    }
               }

               @media (min-width: 1024px) {
                    .content-skeleton {
                         margin-left: 2.45rem;
                         margin-right: 2.45rem;
                         padding-top: 6rem;
                    }

                    .content-skeleton--home,
                    .content-skeleton--details {
                         padding-top: 0;
                    }

                    .content-skeleton__card {
                         width: calc(20% - 0.5rem);
                    }
               }

               @media (prefers-reduced-motion: reduce) {
                    .content-skeleton__heading,
                    .content-skeleton__subheading,
                    .content-skeleton__poster,
                    .content-skeleton__line {
                         animation: none;
                    }
               }
          `);
     }

     return $skeleton;
}
