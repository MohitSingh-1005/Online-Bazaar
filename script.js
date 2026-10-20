
"use strict";

/* ========== PRODUCT DATA ========== */
const products = [
  {
    id: 1,
    name: "Classic Everyday Sneakers",
    category: "Fashion",
    price: 2499,
    rating: 4.8,
    tag: "BESTSELLER",
    image: "photo-1542291026-7eec264c27ff"
  },
  {
    id: 2,
    name: "Premium Wireless Headphones",
    category: "Electronics",
    price: 3999,
    rating: 4.9,
    tag: "POPULAR",
    image: "photo-1505740420928-5e560c06d30e"
  },
  {
    id: 3,
    name: "Minimal Classic Watch",
    category: "Accessories",
    price: 1899,
    rating: 4.7,
    tag: "TRENDING",
    image: "photo-1523275335684-37898b6baf30"
  },
  {
    id: 4,
    name: "Modern Table Lamp",
    category: "Home",
    price: 1499,
    rating: 4.6,
    tag: "NEW",
    image: "photo-1507473885765-e6ed057f782c"
  },
  {
    id: 5,
    name: "Everyday Travel Backpack",
    category: "Accessories",
    price: 2199,
    rating: 4.8,
    tag: "POPULAR",
    image: "photo-1553062407-98eeb64c6a62"
  },
  {
    id: 6,
    name: "Essential Casual Jacket",
    category: "Fashion",
    price: 2799,
    rating: 4.5,
    tag: "TRENDING",
    image: "photo-1544923246-77307dd654cb"
  },
  {
    id: 7,
    name: "Smart Wireless Earbuds",
    category: "Electronics",
    price: 1799,
    rating: 4.7,
    tag: "NEW",
    image: "photo-1606220945770-b5b6c2c55bf1"
  },
  {
    id: 8,
    name: "Modern Sunglasses",
    category: "Accessories",
    price: 999,
    rating: 4.4,
    tag: "SALE",
    image: "photo-1511499767150-a48a237f0083"
  },
  {
    id: 9,
    name: "Cozy Home Cushion",
    category: "Home",
    price: 799,
    rating: 4.6,
    tag: "NEW",
    image: "photo-1584100936595-c0654b55a2e2"
  },
  {
    id: 10,
    name: "Portable Bluetooth Speaker",
    category: "Electronics",
    price: 2299,
    rating: 4.8,
    tag: "POPULAR",
    image: "photo-1608043152269-423dbba4e7e1"
  },
  {
    id: 11,
    name: "Premium Leather Wallet",
    category: "Accessories",
    price: 1199,
    rating: 4.5,
    tag: "CLASSIC",
    image: "photo-1627123424574-724758594e93"
  },
  {
    id: 12,
    name: "Everyday Casual T-Shirt",
    category: "Fashion",
    price: 699,
    rating: 4.6,
    tag: "VALUE PICK",
    image: "photo-1521572163474-6864f9cf17ab"
  }
];

/* ========== DOM ELEMENTS ========== */
const $ = (selector) => document.querySelector(selector);

const productGrid = $("#productGrid");
const searchInput = $("#searchInput");
const filterBar = $("#filterBar");
const sortSelect = $("#sortSelect");
const resultsCount = $("#resultsCount");
const emptyMessage = $("#emptyMessage");

const cartDrawer = $("#cartDrawer");
const backdrop = $("#backdrop");
const cartItems = $("#cartItems");
const cartCount = $("#cartCount");
const drawerCount = $("#drawerCount");
const cartSubtotal = $("#cartSubtotal");

const checkoutModal = $("#checkoutModal");
const checkoutForm = $("#checkoutForm");
const checkoutTotal = $("#checkoutTotal");

const themeBtn = $("#themeBtn");
const menuBtn = $("#menuBtn");
const navLinks = $("#navLinks");
const toast = $("#toast");

/* ========== STATE ========== */
function loadStoredValue(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch {
    return fallback;
  }
}

const savedCart = loadStoredValue("shophub-cart", []);
const savedWishlist = loadStoredValue("shophub-wishlist", []);

let cart = Array.isArray(savedCart)
  ? savedCart
      .filter(item =>
        item &&
        products.some(product => product.id === item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      )
      .map(item => ({
        id: item.id,
        quantity: Math.min(item.quantity, 99)
      }))
  : [];

let wishlist = Array.isArray(savedWishlist)
  ? savedWishlist.filter(id =>
      Number.isInteger(id) &&
      products.some(product => product.id === id)
    )
  : [];

let activeCategory = "All";
let searchTerm = "";
let toastTimer;

/* ========== HELPERS ========== */
function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function saveCart() {
  try {
    localStorage.setItem("shophub-cart", JSON.stringify(cart));
  } catch {
    showToast("Cart could not be saved in this browser.");
  }
}

function saveWishlist() {
  try {
    localStorage.setItem(
      "shophub-wishlist",
      JSON.stringify(wishlist)
    );
  } catch {
    showToast("Wishlist could not be saved.");
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function getProduct(id) {
  return products.find(product => product.id === id);
}

function getCartQuantity() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

/* ========== PRODUCT DISPLAY ========== */
function renderProducts() {
  let filtered = products.filter(product => {
    const matchesCategory =
      activeCategory === "All" ||
      product.category === activeCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  switch (sortSelect.value) {
    case "low":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "high":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filtered.sort((a, b) => b.rating - a.rating);
      break;
  }

  resultsCount.textContent =
    `${filtered.length} product${filtered.length === 1 ? "" : "s"} found`;

  emptyMessage.hidden = filtered.length !== 0;

  productGrid.innerHTML = filtered.map(product => {
    const isWishlisted = wishlist.includes(product.id);

    const imageUrl =
      `https://images.unsplash.com/${product.image}` +
      "?auto=format&fit=crop&w=600&q=80";

    return `
      <article class="product-card">
        <div class="product-image">
          <img
            src="${imageUrl}"
            alt="${product.name}"
            loading="lazy"
          >
          <span class="product-tag">${product.tag}</span>
          <button
            class="wishlist-btn ${isWishlisted ? "active" : ""}"
            data-wishlist="${product.id}"
            aria-label="${isWishlisted ? "Remove from" : "Add to"} wishlist"
            aria-pressed="${isWishlisted}"
          >${isWishlisted ? "♥" : "♡"}</button>
        </div>

        <div class="product-info">
          <span class="product-category">${product.category}</span>
          <h3>${product.name}</h3>
          <div class="rating">
            ★★★★★ <span>${product.rating} / 5</span>
          </div>
          <div class="product-bottom">
            <span class="price">${formatPrice(product.price)}</span>
            <button class="add-btn" data-add="${product.id}">
              + Add
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

/* ========== CATEGORY FILTERS ========== */
filterBar.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;

  filterBar.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn === button);
  });

  renderProducts();
});

/* ========== SEARCH & SORT ========== */
searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  renderProducts();
});

sortSelect.addEventListener("change", renderProducts);

/* ========== ADD TO CART ========== */
productGrid.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const wishlistButton = event.target.closest("[data-wishlist]");

  if (addButton) {
    addToCart(Number(addButton.dataset.add));
  }

  if (wishlistButton) {
    toggleWishlist(Number(wishlistButton.dataset.wishlist));
  }
});

function addToCart(id) {
  const product = getProduct(id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    if (existing.quantity >= 99) {
      showToast("Maximum quantity reached.");
      return;
    }
    existing.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  renderCart();
  showToast(`${product.name} added to cart!`);
}

/* ========== WISHLIST ========== */
function toggleWishlist(id) {
  const product = getProduct(id);
  if (!product) return;

  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(itemId => itemId !== id);
    showToast("Removed from wishlist.");
  } else {
    wishlist.push(id);
    showToast("Added to wishlist!");
  }

  saveWishlist();
  renderProducts();
}

/* ========== CART DISPLAY ========== */
function renderCart() {
  const totalQuantity = getCartQuantity();
  const total = getCartTotal();

  cartCount.textContent = totalQuantity;
  drawerCount.textContent = `(${totalQuantity})`;
  cartSubtotal.textContent = formatPrice(total);
  checkoutTotal.textContent = formatPrice(total);

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <div>🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add something you love to get started.</p>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const product = getProduct(item.id);
    if (!product) return "";

    const imageUrl =
      `https://images.unsplash.com/${product.image}` +
      "?auto=format&fit=crop&w=200&q=75";

    return `
      <div class="cart-item">
        <img src="${imageUrl}" alt="${product.name}">
        <div>
          <h3>${product.name}</h3>
          <p>${formatPrice(product.price * item.quantity)}</p>

          <div class="quantity-controls">
            <button
              data-quantity="${product.id}"
              data-change="-1"
              aria-label="Decrease quantity"
            >−</button>
            <span>${item.quantity}</span>
            <button
              data-quantity="${product.id}"
              data-change="1"
              aria-label="Increase quantity"
              ${item.quantity >= 99 ? "disabled" : ""}
            >+</button>
          </div>
        </div>
        <button
          class="remove-btn"
          data-remove="${product.id}"
          aria-label="Remove ${product.name}"
        >Remove</button>
      </div>
    `;
  }).join("");
}

/* ========== CART QUANTITY & REMOVE ========== */
cartItems.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    const id = Number(quantityButton.dataset.quantity);
    const change = Number(quantityButton.dataset.change);
    const item = cart.find(entry => entry.id === id);

    if (!item) return;

    const nextQuantity = item.quantity + change;

    if (nextQuantity <= 0) {
      cart = cart.filter(entry => entry.id !== id);
    } else if (nextQuantity <= 99) {
      item.quantity = nextQuantity;
    }

    saveCart();
    renderCart();
  }

  if (removeButton) {
    const id = Number(removeButton.dataset.remove);
    cart = cart.filter(item => item.id !== id);

    saveCart();
    renderCart();
    showToast("Product removed from cart.");
  }
});

/* ========== OPEN & CLOSE CART ========== */
function openCart() {
  cartDrawer.classList.add("open");
  backdrop.classList.add("show");
  document.body.style.overflow = "hidden";
  $("#cartBtn").setAttribute("aria-expanded", "true");
  $("#closeCart").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  backdrop.classList.remove("show");
  document.body.style.overflow = "";
  $("#cartBtn").setAttribute("aria-expanded", "false");
}

$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#continueShopping").addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

/* ========== CHECKOUT ========== */
$("#checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Your cart is empty.");
    return;
  }

  closeCart();
  checkoutTotal.textContent = formatPrice(getCartTotal());
  checkoutModal.classList.add("show");
  document.body.style.overflow = "hidden";
  $("#customerName").focus();
});

function closeCheckout() {
  checkoutModal.classList.remove("show");
  document.body.style.overflow = "";
}

$("#closeCheckout").addEventListener("click", closeCheckout);

checkoutModal.addEventListener("click", event => {
  if (event.target === checkoutModal) {
    closeCheckout();
  }
});

checkoutForm.addEventListener("submit", event => {
  event.preventDefault();

  if (cart.length === 0) {
    closeCheckout();
    showToast("Your cart is empty.");
    return;
  }

  if (!checkoutForm.reportValidity()) return;

  const name = $("#customerName").value.trim();

  if (!name) {
    showToast("Please enter your name.");
    return;
  }

  const orderNumber =
    "SH" + Date.now().toString().slice(-8);

  const orderTotal = getCartTotal();

  // Demo order only: no server or real payment.
  cart = [];
  saveCart();
  renderCart();

  checkoutForm.reset();
  closeCheckout();

  showToast(
    `Demo order ${orderNumber} placed! Total: ${formatPrice(orderTotal)}`
  );
});

/* ========== DARK MODE ========== */
function applyTheme(theme) {
  const isDark = theme === "dark";

  document.body.classList.toggle("dark", isDark);
  themeBtn.textContent = isDark ? "☀️" : "🌙";
  themeBtn.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode"
  );

  try {
    localStorage.setItem("shophub-theme", JSON.stringify(theme));
  } catch {
    // Theme still works for the current page session.
  }
}

const storedTheme = loadStoredValue("shophub-theme", "light");
applyTheme(storedTheme === "dark" ? "dark" : "light");

themeBtn.addEventListener("click", () => {
  applyTheme(
    document.body.classList.contains("dark") ? "light" : "dark"
  );
});

/* ========== MOBILE NAVIGATION ========== */
menuBtn.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuBtn.textContent = isOpen ? "✕" : "☰";
  menuBtn.setAttribute("aria-expanded", String(isOpen));
});

navLinks.addEventListener("click", event => {
  if (event.target.closest("a")) {
    navLinks.classList.remove("open");
    menuBtn.textContent = "☰";
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

/* ========== ESCAPE KEY ========== */
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    closeCheckout();
    navLinks.classList.remove("open");
    menuBtn.textContent = "☰";
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

/* ========== INITIALIZE ========== */
$("#year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
