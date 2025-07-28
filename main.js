// main.js - Main functionality for the fashion shop website

// ========== Navigation Toggle ==========
const hamburger = document.querySelector('.hamburger');
const navList = document.querySelector('.nav-list');
const closeBtn = document.querySelector('.close');

hamburger.addEventListener('click', () => {
  navList.classList.add('show');
});

closeBtn.addEventListener('click', () => {
  navList.classList.remove('show');
});

// ========== User Form (Login/Register) ==========
const userIcon = document.querySelector('.user-icon');
const userForm = document.querySelector('.user-form');
const closeForm = document.querySelector('.close-form');
const loginBtn = document.querySelector('.user-link');

const showForm = () => {
  userForm.classList.add('show');
  document.body.style.overflow = 'hidden';
};

const closeFormFunc = () => {
  userForm.classList.remove('show');
  document.body.style.overflow = 'auto';
};

userIcon.addEventListener('click', showForm);
loginBtn.addEventListener('click', showForm);
closeForm.addEventListener('click', closeFormFunc);

// Toggle between login and signup forms
const signupBtn = document.querySelector('.signup .top span');
const loginButton = document.querySelector('.login .top span');
const signup = document.querySelector('.signup');
const login = document.querySelector('.login');

loginButton.addEventListener('click', () => {
  signup.style.display = 'none';
  login.style.display = 'flex';
});

signupBtn.addEventListener('click', () => {
  login.style.display = 'none';
  signup.style.display = 'flex';
});

// ========== Shopping Cart Functionality ==========
// Cart object to store items
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to save cart to localStorage
const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

// Function to add item to cart
const addToCart = (product) => {
  // Check if item already exists in cart
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      url: product.url,
      quantity: 1
    });
  }
  
  saveCart();
  updateCartCount();
  showCartNotification('Item added to cart');
};

// Function to update cart count in the UI
const updateCartCount = () => {
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const notificationBadge = document.querySelector('.icon .bx-bell + span');
  
  if (notificationBadge) {
    notificationBadge.textContent = cartCount;
    if (cartCount > 0) {
      notificationBadge.style.display = 'flex';
    } else {
      notificationBadge.style.display = 'none';
    }
  }
};

// Show notification when adding to cart
const showCartNotification = (message) => {
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2000);
};

// Add event listeners to 'Add to Cart' buttons
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  
  // Event delegation for add to cart buttons
  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('cart-btn')) {
      e.preventDefault();
      
      const productEl = e.target.closest('.product');
      if (!productEl) return;
      
      const imgSrc = productEl.querySelector('img').src;
      const title = productEl.querySelector('h4').textContent;
      const priceText = productEl.querySelector('.price').textContent;
      const price = parseFloat(priceText.replace('Rs.', ''));
      
      const product = {
        id: Math.random().toString(36).substring(2, 15),  // Generate random ID
        title,
        price,
        url: imgSrc
      };
      
      addToCart(product);
    }
  });

  // Initialize sorting functionality
  const sortSelect = document.getElementById('sort-price');
  if (sortSelect) {
    sortSelect.addEventListener('change', sortProducts);
  }
});

// ========== Search Functionality ==========
const searchIcon = document.querySelector('.bx-search');
let searchBar = null;

// Toggle search bar
searchIcon.addEventListener('click', () => {
  if (searchBar) {
    document.body.removeChild(searchBar);
    searchBar = null;
    return;
  }
  
  // Create search bar
  searchBar = document.createElement('div');
  searchBar.className = 'search-container';
  searchBar.innerHTML = `
    <div class="search-box">
      <input type="text" class="search-input" placeholder="Search products...">
      <button class="search-button"><i class="bx bx-search"></i></button>
      <button class="close-search"><i class="bx bx-x"></i></button>
    </div>
    <div class="search-results"></div>
  `;
  
  document.body.appendChild(searchBar);
  
  // Focus the input
  setTimeout(() => {
    searchBar.querySelector('.search-input').focus();
  }, 100);
  
  // Close search when clicking the X button
  searchBar.querySelector('.close-search').addEventListener('click', () => {
    document.body.removeChild(searchBar);
    searchBar = null;
  });
  
  // Search functionality
  const searchInput = searchBar.querySelector('.search-input');
  const searchResults = searchBar.querySelector('.search-results');
  const searchButton = searchBar.querySelector('.search-button');
  
  const performSearch = async () => {
    const query = searchInput.value.toLowerCase().trim();
    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }
    
    try {
      // Get products from your JSON file
      const products = await getProducts();
      
      // Filter products based on search query
      const filteredProducts = products.filter(product => 
        product.title.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query)
      );
      
      // Display results
      displaySearchResults(filteredProducts, searchResults);
    } catch (error) {
      console.error('Error searching products:', error);
      searchResults.innerHTML = '<p>Error searching products. Please try again.</p>';
    }
  };
  
  searchInput.addEventListener('input', performSearch);
  searchButton.addEventListener('click', performSearch);
});

// Display search results
const displaySearchResults = (products, resultsContainer) => {
  if (products.length === 0) {
    resultsContainer.innerHTML = '<p>No products found.</p>';
    return;
  }
  
  let html = '<div class="search-results-grid">';
  
  products.forEach(product => {
    html += `
      <div class="search-result-item">
        <img src="${product.url}" alt="${product.title}">
        <div class="search-result-details">
          <h4>${product.title}</h4>
          <div class="search-result-price">Rs.${product.price}</div>
          <button class="btn cart-btn" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  resultsContainer.innerHTML = html;
  
  // Add event listeners to the new cart buttons
  resultsContainer.querySelectorAll('.cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.target.getAttribute('data-id');
      const product = products.find(p => p.id.toString() === productId);
      
      if (product) {
        addToCart(product);
      }
    });
  });
};

// ========== Sort Products ==========
async function sortProducts() {
  const sortSelect = document.getElementById('sort-price');
  const sortValue = sortSelect.value;
  
  try {
    // Get all products
    let products = await getProducts();
    
    // Sort products based on the selected option
    if (sortValue === 'asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'desc') {
      products.sort((a, b) => b.price - a.price);
    }
    
    // Update the display
    const filterActive = document.querySelector('.filters .active');
    if (filterActive) {
      const category = filterActive.getAttribute('data-filter');
      products = products.filter(product => product.category === category);
    }
    
    displayProductItems(products);
    swiper.update();
  } catch (error) {
    console.error('Error sorting products:', error);
  }
}

// ========== Cart Page Functionality ==========
if (window.location.pathname.includes('cart.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    displayCartItems();
  });
}

// Function to display cart items on the cart page
function displayCartItems() {
  const cartContainer = document.querySelector('.cart-container');
  if (!cartContainer) return;
  
  if (cart.length === 0) {
    cartContainer.innerHTML = '<div class="empty-cart"><h2>Your cart is empty</h2><a href="index.html" class="btn">Continue Shopping</a></div>';
    return;
  }
  
  let cartHTML = `
    <div class="cart-header">
      <div class="cart-item-header">Product</div>
      <div class="cart-price-header">Price</div>
      <div class="cart-quantity-header">Quantity</div>
      <div class="cart-total-header">Total</div>
      <div class="cart-action-header">Action</div>
    </div>
  `;
  
  let subtotal = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    cartHTML += `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-details">
          <img src="${item.url}" alt="${item.title}">
          <div>
            <h4>${item.title}</h4>
          </div>
        </div>
        <div class="cart-item-price">Rs.${item.price}</div>
        <div class="cart-item-quantity">
          <button class="quantity-btn decrease">-</button>
          <span>${item.quantity}</span>
          <button class="quantity-btn increase">+</button>
        </div>
        <div class="cart-item-total">Rs.${itemTotal}</div>
        <div class="cart-item-remove">
          <button class="remove-btn"><i class="bx bx-trash"></i></button>
        </div>
      </div>
    `;
  });
  
  cartHTML += `
    <div class="cart-summary">
      <div class="cart-subtotal">
        <span>Subtotal:</span>
        <span>Rs.${subtotal}</span>
      </div>
      <div class="cart-shipping">
        <span>Shipping:</span>
        <span>Rs.${subtotal > 0 ? 100 : 0}</span>
      </div>
      <div class="cart-total">
        <span>Total:</span>
        <span>Rs.${subtotal > 0 ? subtotal + 100 : 0}</span>
      </div>
      <button class="btn checkout-btn">Proceed to Checkout</button>
    </div>
  `;
  
  cartContainer.innerHTML = cartHTML;
  
  // Add event listeners for cart actions
  document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
    btn.addEventListener('click', decreaseQuantity);
  });
  
  document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
    btn.addEventListener('click', increaseQuantity);
  });
  
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', removeItem);
  });
  
  document.querySelector('.checkout-btn').addEventListener('click', checkout);
}

// Decrease item quantity
function decreaseQuantity(e) {
  const itemElement = e.target.closest('.cart-item');
  const itemId = itemElement.getAttribute('data-id');
  const cartItem = cart.find(item => item.id === itemId);
  
  if (cartItem.quantity > 1) {
    cartItem.quantity -= 1;
  } else {
    cart = cart.filter(item => item.id !== itemId);
  }
  
  saveCart();
  displayCartItems();
  updateCartCount();
}

// Increase item quantity
function increaseQuantity(e) {
  const itemElement = e.target.closest('.cart-item');
  const itemId = itemElement.getAttribute('data-id');
  const cartItem = cart.find(item => item.id === itemId);
  
  cartItem.quantity += 1;
  saveCart();
  displayCartItems();
  updateCartCount();
}

// Remove item from cart
function removeItem(e) {
  const itemElement = e.target.closest('.cart-item');
  const itemId = itemElement.getAttribute('data-id');
  
  cart = cart.filter(item => item.id !== itemId);
  saveCart();
  displayCartItems();
  updateCartCount();
}

// Checkout function
function checkout() {
  alert('Thank you for your purchase! Order has been placed.');
  cart = [];
  saveCart();
  displayCartItems();
  updateCartCount();
}

// Add styles for search and cart notification
const style = document.createElement('style');
style.textContent = `
  .search-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    padding: 20px;
  }

  .search-box {
    display: flex;
    max-width: 800px;
    margin: 80px auto 20px;
    width: 100%;
    position: relative;
  }

  .search-input {
    flex: 1;
    padding: 15px 20px;
    font-size: 18px;
    border: none;
    border-radius: 5px 0 0 5px;
  }

  .search-button {
    padding: 15px 20px;
    background-color: #c77dff;
    color: white;
    border: none;
    border-radius: 0 5px 5px 0;
    cursor: pointer;
  }

  .close-search {
    position: absolute;
    right: -40px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
  }

  .search-results {
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    background-color: white;
    border-radius: 5px;
    padding: 20px;
  }

  .search-results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }

  .search-result-item {
    border: 1px solid #eee;
    border-radius: 5px;
    overflow: hidden;
    transition: transform 0.3s ease;
  }

  .search-result-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .search-result-item img {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }

  .search-result-details {
    padding: 15px;
  }

  .search-result-details h4 {
    margin: 0 0 10px;
    font-size: 16px;
    height: 40px;
    overflow: hidden;
  }

  .search-result-price {
    font-weight: bold;
    color: #c77dff;
    margin-bottom: 10px;
  }

  .cart-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color:#c77dff;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    transform: translateY(100px);
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
    z-index: 1000;
  }

  .cart-notification.show {
    transform: translateY(0);
    opacity: 1;
  }

  /* Cart Page Styles */
  .cart-container {
    max-width: 1200px;
    margin: 50px auto;
    padding: 20px;
  }

  .cart-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 0.5fr;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    font-weight: bold;
    text-align: center;
  }

  .cart-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 0.5fr;
    padding: 20px 0;
    border-bottom: 1px solid #eee;
    align-items: center;
    text-align: center;
  }

  .cart-item-details {
    display: flex;
    align-items: center;
    text-align: left;
  }

  .cart-item-details img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    margin-right: 15px;
  }

  .cart-item-quantity {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .quantity-btn {
    background-color: #f5f5f5;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0 10px;
  }

  .cart-item-remove button {
    background: none;
    border: none;
    color: #c77dff;
    font-size: 20px;
    cursor: pointer;
  }

  .cart-summary {
    margin-top: 30px;
    margin-left: auto;
    max-width: 400px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 5px;
  }

  .cart-subtotal, .cart-shipping, .cart-total {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
  }

  .cart-total {
    font-size: 20px;
    font-weight: bold;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #ddd;
  }

  .checkout-btn {
    width: 100%;
    padding: 15px;
    margin-top: 20px;
  }

  .empty-cart {
    text-align: center;
    padding: 50px 0;
  }

  .empty-cart h2 {
    margin-bottom: 20px;
  }
`;

document.head.appendChild(style);
