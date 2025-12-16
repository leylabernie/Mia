
document.addEventListener('DOMContentLoaded', () => {
    let user;
    fetch('/api/user').then(res => res.json()).then(data => {
        if (!data.user) {
            window.location.href = 'account.html';
        } else {
            user = data.user;
            loadAddresses();
            loadCart();
        }
    });

    const addressList = document.getElementById('address-list');
    const cartItems = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    const placeOrderBtn = document.getElementById('place-order-btn');

    let selectedAddressId = null;

    function loadAddresses() {
        fetch(`/api/addresses?userId=${user.id}`)
            .then(response => response.json())
            .then(addresses => {
                addressList.innerHTML = '';
                if (addresses.length > 0) {
                    selectedAddressId = addresses[0].id; // Default to first address
                    addresses.forEach(address => {
                        const addressEl = document.createElement('div');
                        addressEl.className = 'bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-pastel-sage dark:border-border-dark luxury-shadow hover:border-primary dark:hover:border-primary transition-colors group';
                        if (address.id === selectedAddressId) {
                            addressEl.classList.add('border-primary', 'dark:border-primary');
                        }
                        addressEl.dataset.id = address.id;
                        addressEl.innerHTML = `
                            <h4 class="font-bold text-gray-900 dark:text-white font-display text-lg">${address.name}</h4>
                            <p class="mt-2 text-sm text-text-sub-light dark:text-gray-300 leading-relaxed">
                                ${address.street}, ${address.city}, ${address.zip}, ${address.country}
                            </p>
                        `;
                        addressList.appendChild(addressEl);
                    });

                    addressList.addEventListener('click', (e) => {
                        const targetAddress = e.target.closest('[data-id]');
                        if (targetAddress) {
                            selectedAddressId = parseInt(targetAddress.dataset.id);
                            document.querySelectorAll('#address-list > div').forEach(el => {
                                el.classList.remove('border-primary', 'dark:border-primary');
                            });
                            targetAddress.classList.add('border-primary', 'dark:border-primary');
                        }
                    });
                } else {
                    addressList.innerHTML = '<p>No saved addresses. Please add an address in your account settings.</p>';
                }
            });
    }

    function loadCart() {
        fetch('/api/cart')
            .then(response => response.json())
            .then(cart => {
                cartItems.innerHTML = '';
                let subtotal = 0;
                cart.forEach(item => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'flex gap-6 items-start bg-surface-light dark:bg-surface-dark p-4 rounded-lg border border-stone-100 dark:border-stone-800 shadow-sm';
                    itemEl.innerHTML = `
                        <div class="w-24 h-32 flex-shrink-0 bg-stone-100 dark:bg-stone-800 rounded overflow-hidden">
                            <img alt="${item.product.name}" class="w-full h-full object-cover" src="${item.product.image}"/>
                        </div>
                        <div class="flex-grow flex flex-col sm:flex-row justify-between">
                            <div>
                                <h3 class="font-display text-lg font-medium text-stone-800 dark:text-stone-100 mb-1">${item.product.name}</h3>
                                <p class="text-sm text-stone-500 dark:text-stone-400 mb-2">Size: ${item.size}, Color: ${item.color}</p>
                                <p class="text-sm text-stone-600 dark:text-stone-300">Qty: ${item.quantity}</p>
                            </div>
                            <div class="mt-4 sm:mt-0 text-right">
                                <p class="font-medium text-lg text-stone-800 dark:text-stone-100">₹${item.product.price * item.quantity}</p>
                            </div>
                        </div>
                    `;
                    cartItems.appendChild(itemEl);
                    subtotal += item.product.price * item.quantity;
                });

                const tax = subtotal * 0.18;
                const total = subtotal + tax + 500; // 500 for shipping

                subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
                taxEl.textContent = `₹${tax.toFixed(2)}`;
                totalEl.textContent = `₹${total.toFixed(2)}`;
            });
    }

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', async () => {
            if (!selectedAddressId) {
                alert('Please select a shipping address.');
                return;
            }
            const cart = await fetch('/api/cart').then(res => res.json());
            const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
            const tax = subtotal * 0.18;
            const total = subtotal + tax + 500;

            const orderDetails = {
                userId: user.id,
                items: cart,
                total: total,
                shippingAddressId: selectedAddressId,
            };

            try {
                const response = await fetch('/api/orders/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderDetails)
                });

                if (response.ok) {
                    console.log('Order placed successfully!');
                    window.location.href = 'account.html';
                } else {
                    const data = await response.json();
                    alert(data.message);
                }
            } catch (error) {
                console.error('Failed to place order:', error);
                alert('Failed to place order. Please try again.');
            }
        });
    }

    loadAddresses();
    loadCart();
});
