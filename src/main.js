import './style.css';

async function fetchImages(query, page, count) {
    const clientId = "hQs2C-CL3bhXvVcqH0GYXOAqreh-siflkv3_12d5ZrU";
    try {
        const url = query
            ? `https://api.unsplash.com/search/photos?query=${query}&per_page=${count}&page=${page}&client_id=${clientId}`
            : `https://api.unsplash.com/photos?per_page=${count}&page=${page}&client_id=${clientId}`;
        
        console.log(`Fetching images: ${url}`); 
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error fetching images");
        
        const data = await response.json();
        return query ? data.results : data;
    } catch (error) {
        console.error("Error fetching images:", error);
        return [];
    }
}

function displayImages(images, container) {
    if (images.length === 0) {
        showMessage("No images found. Try another search.");
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
        document.body.appendChild(messageBox);
    }
    messageBox.textContent = message;
    setTimeout(() => messageBox.remove(), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const imageContainer = document.getElementById("imageContainer");
    const logo = document.getElementById("logo");
    const sentinel = document.getElementById("sentinel"); 
    let currentPage = 1;
    const imagesPerPage = 25;
    let isFetching = false;
    
    function loadImages(query = "", reset = false) {
        if (isFetching) return; 
        isFetching = true;
        
        if (reset) {
            imageContainer.innerHTML = "";
            currentPage = 1;
        }
        
        fetchImages(query, currentPage, imagesPerPage).then(images => {
            displayImages(images, imageContainer);
            isFetching = false;
        });
    }
    
    loadImages(); 

    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query.length > 2) loadImages(query, true); 
    });

    logo.addEventListener("click", () => {
        searchInput.value = "";
        loadImages("", true);
    });

    
    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !isFetching) {
            currentPage++;
            loadImages(searchInput.value.trim());
        }
    }, { rootMargin: "100px" });

    observer.observe(sentinel); 
});