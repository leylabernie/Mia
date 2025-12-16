
document.addEventListener('DOMContentLoaded', () => {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const colorOptionsContainer = document.getElementById('color-options');
    const sizeOptionsContainer = document.getElementById('size-options');
    let selectedColor = '';
    let selectedSize = '';

    // Only run this logic on the product page
    if (addToCartBtn) {
        fetch('/api/products')
            .then(response => response.json())
            .then(products => {
                const product = products.find(p => p.id === parseInt(addToCartBtn.dataset.productId));
                if (product) {
                    if (product.colors && product.colors.length > 0) {
                        selectedColor = product.colors[0];
                        product.colors.forEach((color, index) => {
                            const colorLabel = document.createElement('label');
                            colorLabel.className = 'relative -m-0.5 p-0.5 rounded-full flex items-center justify-center cursor-pointer focus:outline-none ring-transparent ring-2 hover:ring-stone-300';
                            if (index === 0) {
                                colorLabel.classList.add('ring-offset-2', 'ring-primary', 'ring-2');
                            }
                            const colorInput = document.createElement('input');
                            colorInput.className = 'sr-only';
                            colorInput.type = 'radio';
                            colorInput.name = 'color-choice';
                            colorInput.value = color;
                            if (index === 0) {
                                colorInput.checked = true;
                            }
                            const colorSpan = document.createElement('span');
                            colorSpan.className = 'h-8 w-8 border border-black border-opacity-10 rounded-full';

                            // A simple mapping for color names to hex values
                            const colorMap = {
                                "royalblue": "#4169e1",
                                "maroon": "#800000",
                                "emeraldgreen": "#50c878",
                                "peach": "#ffdab9",
                                "mintgreen": "#98ff98",
                                "lavender": "#e6e6fa",
                                "turquoise": "#40e0d0",
                                "rubyred": "#e0115f",
                                "red": "#ff0000",
                                "gold": "#ffd700",
                            };
                            colorSpan.style.backgroundColor = colorMap[color.toLowerCase().replace(' ', '')] || color;

                            colorLabel.appendChild(colorInput);
                            colorLabel.appendChild(colorSpan);
                            colorOptionsContainer.appendChild(colorLabel);

                            colorInput.addEventListener('change', () => {
                                selectedColor = color;
                                document.querySelectorAll('#color-options label').forEach(label => {
                                    label.classList.remove('ring-offset-2', 'ring-primary', 'ring-2');
                                });
                                colorLabel.classList.add('ring-offset-2', 'ring-primary', 'ring-2');
                            });
                        });
                    }

                    if (product.sizes && product.sizes.length > 0) {
                        selectedSize = product.sizes[0];
                        product.sizes.forEach((size, index) => {
                            const sizeButton = document.createElement('button');
                            sizeButton.className = 'group relative border border-stone-200 dark:border-stone-600 rounded-sm py-3 px-3 flex items-center justify-center text-sm font-medium uppercase hover:border-primary hover:text-primary sm:flex-1 bg-white dark:bg-stone-800 focus:outline-none';
                            if (index === 0) {
                                sizeButton.classList.add('border-2', 'border-primary', 'text-primary', 'shadow-sm');
                            }
                            sizeButton.textContent = size;
                            sizeOptionsContainer.appendChild(sizeButton);

                            sizeButton.addEventListener('click', () => {
                                selectedSize = size;
                                document.querySelectorAll('#size-options button').forEach(button => {
                                    button.classList.remove('border-2', 'border-primary', 'text-primary', 'shadow-sm');
                                });
                                sizeButton.classList.add('border-2', 'border-primary', 'text-primary', 'shadow-sm');
                            });
                        });
                    }
                }
            });

        addToCartBtn.addEventListener('click', () => {
            const productId = addToCartBtn.dataset.productId;
            const quantity = 1;

            fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity, size: selectedSize, color: selectedColor }),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                updateCartCount();
            })
            .catch(error => console.error('Error adding to cart:', error));
        });
    }

    function updateCartDisplay() {
        fetch('/api/cart')
            .then(response => response.json())
            .then(cart => {
                const cartItemsContainer = document.getElementById('cart-items');
                const cartItemCount = document.getElementById('cart-item-count');
                const subtotalEl = document.getElementById('subtotal');
                const taxEl = document.getElementById('tax');
                const totalEl = document.getElementById('total');

                if (cartItemsContainer) {
                    cartItemsContainer.innerHTML = '';
                    let subtotal = 0;
                    cart.forEach(item => {
                        const itemElement = document.createElement('div');
                        itemElement.className = 'group bg-surface-card border border-border rounded-xl p-6 mb-6 shadow-soft hover:shadow-lg transition-all duration-500 relative overflow-hidden';
                        itemElement.innerHTML = `
                            <div class="absolute top-0 left-0 w-1 h-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div class="flex flex-col sm:flex-row gap-8">
                                <div class="w-full sm:w-36 h-48 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-background relative">
                                    <img alt="${item.product.name}" class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" src="${item.product.image}"/>
                                </div>
                                <div class="flex-1 flex flex-col justify-between py-1">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <h3 class="text-2xl font-serif text-text tracking-wide mb-2">${item.product.name}</h3>
                                            <div class="flex items-center gap-3 text-sm text-text-muted mb-1">
                                                <span class="px-2 py-0.5 bg-background rounded border border-border text-xs uppercase tracking-wider">${item.color}</span>
                                            </div>
                                            <p class="text-sm text-text-muted">Size: ${item.size}</p>
                                        </div>
                                        <p class="text-xl font-serif font-medium text-primary">₹${item.product.price}</p>
                                    </div>
                                    <div class="flex justify-between items-end mt-6 sm:mt-0">
                                        <button class="remove-from-cart-btn flex items-center space-x-2 text-sm text-text-muted hover:text-highlight transition-colors group/btn" data-id="${item.id}">
                                            <span class="material-icons text-lg group-hover/btn:scale-110 transition-transform">close</span>
                                            <span class="uppercase tracking-wider text-xs font-medium">Remove</span>
                                        </button>
                                        <div class="flex items-center gap-3">
                                            <span class="text-xs uppercase text-text-muted tracking-widest mr-1">Qty</span>
                                            <div class="flex items-center border border-border rounded-md bg-background">
                                                <button class="w-8 h-8 flex items-center justify-center text-secondary hover:bg-surface-card hover:text-primary transition-colors">-</button>
                                                <input class="w-10 text-center border-0 bg-transparent text-sm font-medium text-text p-0 focus:ring-0" readonly type="text" value="${item.quantity}"/>
                                                <button class="w-8 h-8 flex items-center justify-center text-secondary hover:bg-surface-card hover:text-primary transition-colors">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                        cartItemsContainer.appendChild(itemElement);
                    });

                fetch('/api/cart/summary')
                    .then(response => response.json())
                    .then(summary => {
                        if (cartItemCount) cartItemCount.textContent = `(${cart.length})`;
                        if (subtotalEl) subtotalEl.textContent = `₹${summary.subtotal.toFixed(2)}`;
                        if (taxEl) taxEl.textContent = `₹${summary.tax.toFixed(2)}`;
                        if (totalEl) totalEl.textContent = `₹${summary.total.toFixed(2)}`;
                    });

                    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
                        button.addEventListener('click', () => {
                            const cartItemId = button.dataset.id;
                            fetch(`/api/cart/remove/${cartItemId}`, { method: 'DELETE' })
                                .then(response => response.json())
                                .then(data => {
                                    console.log(data.message);
                                    updateCartDisplay();
                                    updateCartCount();
                                });
                        });
                    });
                }
            });
    }

    function updateCartCount() {
        fetch('/api/cart')
            .then(response => response.json())
            .then(cart => {
                const cartCount = document.getElementById('cart-count');
                if (cartCount) {
                    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
                }
            });
    }

    // Initial load
    updateCartCount();
    if (window.location.pathname.endsWith('cart.html')) {
        updateCartDisplay();
    }
});
