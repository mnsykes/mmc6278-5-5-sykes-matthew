async function getInventory() {
	const res = await fetch("/api/inventory");
	if (res.status !== 200) throw new Error("Did not receive 200 for /api/inventory");
	if (!res.headers.get("Content-Type").includes("json"))
		throw new Error("Did not receive JSON response for /api/inventory");
	const inventory = await res.json();
	return inventory;
}

async function getProduct(inventoryId) {
	const res = await fetch(`/api/inventory/${inventoryId}`);

	if (res.status !== 200) throw new Error(`Did not receive 200 for /api/inventory/${inventoryId}`);
	if (!res.headers.get("Content-Type").includes("json"))
		throw new Error(`Did not receive JSON response for /api/inventory/${inventoryId}`);
	const product = await res.json();
	return product;
}

async function getCart() {
	const res = await fetch("/api/cart");
	if (res.status !== 200) throw new Error("Did not receive 200 for /api/cart");
	if (!res.headers.get("Content-Type").includes("json"))
		throw new Error("Did not receive JSON response /api/cart");
	const cart = await res.json();
	return cart;
}

async function addToCart(e) {
	e.preventDefault();
	const response = await fetch("/api/cart", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			quantity: e.target.quantity.value,
			inventoryId
		})
	});
	if (response.status === 409) throw new Error("not enough inventory");
	if (response.status === 404) throw new Error("item not found");
	window.location.replace("/cart.html");
}

async function updateCartQuantity(e) {
	const cartId = e.target.getAttribute("data-cart-id");
	const quantity = +e.target.value;
	const min = +e.target.min;
	const max = +e.target.max;
	if (quantity > max || quantity < min) return;
	await fetch(`/api/cart/${cartId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ quantity })
	});
	window.location.replace("/cart.html");
}
async function handleSubmit(e) {
	e.preventDefault();
	await fetch("/api/cart", {
		method: "DELETE"
	});
	window.location.replace("/cart.html");
}
async function removeFromCart(e) {
	const cartId = e.target.getAttribute("data-cart-id");
	await fetch(`/api/cart/${cartId}`, {
		method: "delete"
	});
	window.location.replace("/cart.html");
}

async function loadHome() {
	const [inventory, cart] = await Promise.all([getInventory(), getCart()]);
	renderSaleItems(inventory);
	renderCartNumber(cart.cartItems);
}

async function loadProduct(inventoryId) {
	const [product, cart] = await Promise.all([getProduct(inventoryId), getCart()]);
	renderProduct(product);
	renderCartNumber(cart.cartItems);
}

async function loadCart() {
	const cart = await getCart();
	renderCart(cart);
}

function renderCartNumber(cartItems) {
	const num = cartItems.reduce((total, { quantity }) => total + quantity, 0);
	document.getElementById("cartCount").textContent = `(${num})`;
}

function renderCart({ cartItems, total }) {
	document.getElementById("cart").innerHTML = `<div class="cart-items">
    ${cartItems
			.map(
				({ id, inventoryId, price, name, image, quantity, inventoryQuantity }) => `
          <div class="cart-item">
            <a
              href="/product.html?inventoryId=${inventoryId}"
              class="cart-item-info">
              <img src="${image.includes("http") ? `${image}` : `images/${image}`}" alt="${name}" />
              <div>
                <p>${name}</p>
                <p>$${price}</p>
              </div>
            </a>
            <div class="cart-item-subtotal">
              <div class="cart-item-controls">
                <label>
                  Quantity
                  <input
                    data-cart-id="${id}"
                    type="number"
                    min="0"
                    max="${inventoryQuantity}"
                    value="${quantity}" />
                </label>
                <button
                  class="remove-from-cart"
                  data-cart-id="${id}">
                  Remove
                </button>
              </div>
              <p>$${(price * quantity).toFixed(2)}</p>
            </div>
          </div>
          <hr />
        `
			)
			.join("")}
    <div class="cart-total">
      <p>Total:</p>
      <p>$${total}</p>
    </div>
    <button id="emptyCart">Empty Cart</button>
  </div>`;
	document.getElementById("emptyCart").onclick = handleSubmit;
	if (cartItems.length > 0) {
		document
			.querySelectorAll('#cart input[type="number"]')
			.forEach((input) => (input.onchange = updateCartQuantity));
		document
			.querySelectorAll("#cart .remove-from-cart")
			.forEach((button) => (button.onclick = removeFromCart));
	}
}

function renderSaleItems(items) {
	const saleItemsContainer = document.getElementById("saleItems");
	for (const { id, name, image, price, description } of items) {
		const saleItem = document.createElement("a");
		saleItem.classList.add("sale-item");
		saleItem.href = `/product.html?inventoryId=${id}`;
		saleItem.innerHTML = `<div class="item-img-container">
      <img src="${image.includes("http") ? `${image}` : `images/${image}`}" alt="${name}" />
      <p>${description}</p>
    </div>
    <p>${name}</p>
    <p>$${price}</p>`;
		saleItemsContainer.appendChild(saleItem);
	}
}

function renderProduct({ name, image, description, price, quantity }) {
	document.getElementById("product-container").innerHTML = `
      <img src="${image.includes("http") ? `${image}` : `images/${image}`}" alt="${name}"/>
      <form>
        <h2>${name}</h2>
        <p>${description}</p>
        <p>$${price}</p>
        <label for="quantity-input">
          Quantity
          <input
            name="quantity"
            id="quantity-input"
            type="number"
            min="1"
            value="1"
            max="${quantity}" />
        </label>
        <button>Add to Cart</button>
      </form>
    `;
	document.querySelector("form").onsubmit = addToCart;
}
