// ================= Hamburger Menu Toggle =================
const list = document.querySelector(".navlist");
const hamburger = document.querySelector(".fa-bars");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("fa-x");
    list.classList.toggle("navlist-active");
});

// ================= Search Filter =================
const searchIcon = document.querySelector(".search-icon");
const searchInput = document.getElementById("searchInput");

searchIcon.addEventListener("click", () => {
    searchInput.classList.toggle("active");
    searchInput.focus();
});

searchInput.addEventListener("keyup", () => {
    const filter = searchInput.value.toLowerCase().trim();
    const allCards = document.querySelectorAll(".card-container .card");
    let firstMatch = null;

    allCards.forEach(card => {
        const title = card.querySelector(".title").textContent.toLowerCase().trim();

        if (filter === "" || title.includes(filter)) {
            card.style.display = "block";
            if (!firstMatch && filter !== "") firstMatch = card;
        } else {
            card.style.display = "none";
        }
    });

    if (firstMatch) firstMatch.scrollIntoView({ behavior: "smooth", block: "start" });
});

// ================= Sorting Cards =================
const sections = document.querySelectorAll("section.section");
const originalCards = {};
sections.forEach(section => {
    const cards = Array.from(section.querySelectorAll(".card-container .card"));
    originalCards[section.id] = cards;
});

function sortSection(selectId, sectionId) {
    const select = document.getElementById(selectId);
    const section = document.getElementById(sectionId);

    select.addEventListener("change", () => {
        let allCards = Array.from(section.querySelectorAll(".card-container .card"));
        const value = select.value;
        let sortedCards;

        if (value === "default") sortedCards = originalCards[sectionId];
        else if (value === "low") sortedCards = allCards.sort((a, b) => parseInt(a.querySelector(".amount").textContent.replace(/[^0-9]/g,"")) - parseInt(b.querySelector(".amount").textContent.replace(/[^0-9]/g,"")));
        else if (value === "high") sortedCards = allCards.sort((a, b) => parseInt(b.querySelector(".amount").textContent.replace(/[^0-9]/g,"")) - parseInt(a.querySelector(".amount").textContent.replace(/[^0-9]/g,"")));
        else if (value.startsWith("below")) {
            const maxPrice = parseInt(value.replace(/[^0-9]/g,""));
            sortedCards = allCards.filter(card => parseInt(card.querySelector(".amount").textContent.replace(/[^0-9]/g,"")) <= maxPrice);
        }

        const containers = section.querySelectorAll(".card-container");
        containers.forEach(container => container.innerHTML = "");
        sortedCards.forEach((card, i) => containers[i % containers.length].appendChild(card));
    });
}

sortSection('sort-men','men');
sortSection('sort-women','women');
sortSection('sort-kids','kids');
sortSection('sort-accessories','accessories');

// ================= Add to Cart =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartIcon = document.querySelector(".fa-cart-shopping");
const cartContainer = document.querySelector(".cart-container");

// Create popup
const cartPopup = document.createElement("div");
cartPopup.classList.add("cart-popup");
cartContainer.appendChild(cartPopup);

// Badge for item count
let badge = document.createElement("span");
badge.classList.add("cart-count");
cartContainer.appendChild(badge);

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
}

// Add to cart buttons
function setupAddToCart() {
    const buttons = document.querySelectorAll(".add-to-cart");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".card");
            const title = card.querySelector(".title").textContent.trim();
            const price = card.querySelector(".amount").textContent.trim();
            const imgSrc = card.querySelector("img").src;

            const exists = cart.find(item => item.title === title);
            if (!exists) cart.push({title, price, imgSrc, quantity:1});
            else exists.quantity++;

            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartCount();
            showToast(`${title} added to cart!`);
            renderCartItems();
        });
    });
}

// Remove item
function removeFromCart(title) {
    cart = cart.filter(item => item.title !== title);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

// Show popup
cartIcon.addEventListener("click", () => {
    cartPopup.classList.toggle("active");
    renderCartItems();
});

// Render cart items
function renderCartItems() {
    if(cart.length === 0){
        cartPopup.innerHTML = `<p class="empty">Your cart is empty!</p>`;
        return;
    }

    cartPopup.innerHTML = "";
    let totalAmount = 0;

    cart.forEach(item => {
        const priceNum = parseInt(item.price.replace(/[^0-9]/g,""));
        totalAmount += priceNum * item.quantity;

        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <img src="${item.imgSrc}" alt="${item.title}">
            <div class="cart-item-info">
                <p class="cart-item-title">${item.title}</p>
                <p class="cart-item-price">${item.price}</p>
                <div class="quantity-controls">
                    <button class="decrease">-</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="increase">+</button>
                </div>
            </div>
            <button class="remove-item">Remove</button>
        `;

        // Increase
        div.querySelector(".increase").addEventListener("click", () => {
            item.quantity++;
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartCount();
            renderCartItems();
        });

        // Decrease
        div.querySelector(".decrease").addEventListener("click", () => {
            if(item.quantity > 1) item.quantity--;
            else { removeFromCart(item.title); return; }
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartCount();
            renderCartItems();
        });

        // Remove button
        div.querySelector(".remove-item").addEventListener("click", () => removeFromCart(item.title));

        cartPopup.appendChild(div);
    });

    // Total
    const totalDiv = document.createElement("div");
    totalDiv.classList.add("cart-total");
    totalDiv.innerHTML = `<strong>Total: ₹${totalAmount}</strong>`;
    cartPopup.appendChild(totalDiv);
}

// Simple toast message
function showToast(msg){
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.style.display = "block";
    setTimeout(()=>{ toast.style.display="none"; }, 2000);
}

// Init
updateCartCount();
setupAddToCart();
