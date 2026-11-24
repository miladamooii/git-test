import { ContentSkeleton } from "../components/ContentSkeleton.js";

export function showLoadingState(variant = "results") {
     const $main = document.getElementById("main"),
          $loader = document.querySelector(".loader-container");

     if($loader) $loader.style.display = "none";
     if(!$main) return () => {};

     const $skeleton = ContentSkeleton({ variant });
     $main.appendChild($skeleton);

     return () => $skeleton.remove();
}
