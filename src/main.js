import './style.css'

(function() {
    const relList = document.createElement("link").relList;
    if (relList && relList.supports && relList.supports("modulepreload")) return;
    for (const link of document.querySelectorAll('link[rel="modulepreload"]')) handlePreload(link);
    new MutationObserver(mutations => {
        for (const mutation of mutations)
            if (mutation.type === "childList")
                for (const node of mutation.addedNodes)
                    if (node.tagName === "LINK" && node.rel === "modulepreload") handlePreload(node);
    }).observe(document, { childList: true, subtree: true });

    function getFetchOptions(element) {
        const options = {};
        if (element.integrity) options.integrity = element.integrity;
        if (element.referrerPolicy) options.referrerPolicy = element.referrerPolicy;
        options.credentials = element.crossOrigin === "use-credentials" ? "include" : 
                              element.crossOrigin === "anonymous" ? "omit" : "same-origin";
        return options;
    }

    function handlePreload(linkElement) {
        if (linkElement.preloadHandled) return;
        linkElement.preloadHandled = true;
        fetch(linkElement.href, getFetchOptions(linkElement));
    }
})();

async function fetchImages(query, page, count) {
    const clientId = "hQs2C-CL3bhXvVcqH0GYXOAqreh-siflkv3_12d5ZrU";
    try {
        const url = query ? `https://api.unsplash.com/search/photos?query=${query}&per_page=${count}&page=${page}&client_id=${clientId}` 
                          : `https://api.unsplash.com/photos/random?count=${count}&client_id=${clientId}`;
        const response = await fetch(url);
        const data = await response.json();
        return query ? data.results : data;
    } catch (error) {
        console.error("Error fetching images:", error);
        return [];
    }
}

function displayImages(images, container) {
    container.innerHTML = "";
    if (images.length === 0) {
        showMessage("No images found. Showing alternative images.");
        fetchImages("cats", 1, 10).then(alternativeImages => displayImages(alternativeImages, container));
        return;
    }
    images.forEach(image => {
        const link = document.createElement("a");
        link.href = image.links.html;
        link.target = "_blank";
        const img = document.createElement("img");
        img.src = image.urls.regular;
        img.alt = image.alt_description || "Image";
        link.appendChild(img);
        container.appendChild(link);
    });
}

function showMessage(message) {
    let messageBox = document.getElementById("messageBox");
    if (!messageBox) {
        messageBox = document.createElement("div");
        messageBox.id = "messageBox";
        messageBox.style.position = "fixed";
        messageBox.style.top = "10px";
        messageBox.style.left = "50%";
        messageBox.style.transform = "translateX(-50%)";
        messageBox.style.background = "#f8d7da";
        messageBox.style.color = "#721c24";
        messageBox.style.padding = "10px";
        messageBox.style.borderRadius = "5px";
        messageBox.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.1)";
        document.body.appendChild(messageBox);
    }
    messageBox.textContent = message;
    setTimeout(() => messageBox.remove(), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const resetButton = document.getElementById("resetButton");
    const imageContainer = document.getElementById("imageContainer");
    let currentPage = 1;
    const imagesPerPage = 25;

    fetchImages("", currentPage, imagesPerPage).then(images => displayImages(images, imageContainer));

    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query) {
            currentPage = 1;
            fetchImages(query, currentPage, imagesPerPage).then(images => displayImages(images, imageContainer));
        }
    });

    resetButton.addEventListener("click", () => {
        searchInput.value = "";
        currentPage = 1;
        fetchImages("", currentPage, imagesPerPage).then(images => displayImages(images, imageContainer));
    });

    window.addEventListener("scroll", () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            const query = searchInput.value.trim();
            currentPage++;
            fetchImages(query, currentPage, imagesPerPage).then(images => displayImages(images, imageContainer));
        }
    });
});