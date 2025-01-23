import './style.css'

(function() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload"))
      return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]'))
      handlePreload(link);
  new MutationObserver(mutations => {
      for (const mutation of mutations)
          if (mutation.type === "childList")
              for (const node of mutation.addedNodes)
                  if (node.tagName === "LINK" && node.rel === "modulepreload")
                      handlePreload(node);
  }).observe(document, {
      childList: true,
      subtree: true
  });

  function getFetchOptions(element) {
      const options = {};
      if (element.integrity) options.integrity = element.integrity;
      if (element.referrerPolicy) options.referrerPolicy = element.referrerPolicy;
      if (element.crossOrigin === "use-credentials") {
          options.credentials = "include";
      } else if (element.crossOrigin === "anonymous") {
          options.credentials = "omit";
      } else {
          options.credentials = "same-origin";
      }
      return options;
  }

  function handlePreload(linkElement) {
      if (linkElement.preloadHandled) return;
      linkElement.preloadHandled = true;
      const options = getFetchOptions(linkElement);
      fetch(linkElement.href, options);
  }
})();

async function fetchRandomImages(page, count) {
  const clientId = "hQs2C-CL3bhXvVcqH0GYXOAqreh-siflkv3_12d5ZrU";
  try {
      const response = await fetch(`https://api.unsplash.com/photos/random?count=${count}&client_id=${clientId}`);
      return await response.json();
  } catch (error) {
      console.error("Error fetching random images:", error);
      return [];
  }
}

async function fetchSearchImages(query, page, count) {
  const clientId = "hQs2C-CL3bhXvVcqH0GYXOAqreh-siflkv3_12d5ZrU";
  try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=${count}&page=${page}&client_id=${clientId}`);
      const data = await response.json();
      if (data.results.length === 0) alert("No images found for " + query);
      return data.results;
  } catch (error) {
      console.error("Error fetching search images:", error);
      return [];
  }
}

function displayImages(images, container) {
  images.forEach(image => {
      const link = document.createElement("a");
      link.href = image.links.html;
      link.target = "_blank";

      const img = document.createElement("img");
      img.src = image.urls.regular;
      img.alt = image.alt_description;

      link.appendChild(img);
      container.appendChild(link);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const imageContainer = document.getElementById("imageContainer");
  let currentPage = 1;
  const imagesPerPage = 25;

  fetchRandomImages(currentPage, imagesPerPage).then(images => displayImages(images, imageContainer));

  searchButton.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) {
          currentPage = 1;
          fetchSearchImages(query, currentPage, imagesPerPage).then(images => {
              imageContainer.innerHTML = "";
              displayImages(images, imageContainer);
          });
      } else {
          fetchRandomImages(currentPage, imagesPerPage).then(images => displayImages(images, imageContainer));
      }
  });

  window.addEventListener("scroll", () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
          const query = searchInput.value.trim();
          currentPage++;
          if (query) {
              fetchSearchImages(query, currentPage, imagesPerPage).then(images => displayImages(images, imageContainer));
          } else {
              fetchRandomImages(currentPage, imagesPerPage).then(images => displayImages(images, imageContainer));
          }
      }
  });
});