
document.addEventListener('DOMContentLoaded', () => {
    const registerFormDiv = document.getElementById('register-form-div');
    const loginFormDiv = document.getElementById('login-form-div');
    const accountDetailsDiv = document.getElementById('account-details-div');

    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');

    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    // Check for user session
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            const user = data.user;
            const sidebar = document.querySelector('aside');

            if (user) {
                loginFormDiv.classList.add('hidden');
                registerFormDiv.classList.add('hidden');
                accountDetailsDiv.classList.remove('hidden');
                sidebar.classList.remove('hidden');
                document.getElementById('username-display').value = user.username;
                document.getElementById('email-display').value = user.email;

                // Fetch and display order history
                fetch(`/api/orders?userId=${user.id}`)
                    .then(response => response.json())
                    .then(orders => {
                        const orderHistoryBody = document.getElementById('order-history-body');
                        orderHistoryBody.innerHTML = '';
                        if (orders.length > 0) {
                            orders.forEach(order => {
                                const row = document.createElement('tr');
                                row.className = 'hover:bg-pastel-snow dark:hover:bg-gray-800/30 transition-colors';
                                row.innerHTML = `
                                    <td class="px-6 py-5 font-medium text-gray-900 dark:text-white">#${order.id}</td>
                                    <td class="px-6 py-5">
                                        <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}">
                                            ${order.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-text-sub-light dark:text-gray-400">${new Date(order.date).toLocaleDateString()}</td>
                                    <td class="px-6 py-5 text-right">
                                        <button class="text-pastel-sage hover:text-primary transition-colors">
                                            <span class="material-icons-outlined">chevron_right</span>
                                        </button>
                                    </td>
                                `;
                                orderHistoryBody.appendChild(row);
                            });
                        } else {
                            orderHistoryBody.innerHTML = '<tr><td colspan="4" class="text-center py-10">You have no past orders.</td></tr>';
                        }
                    });
            } else {
                loginFormDiv.classList.remove('hidden');
                registerFormDiv.classList.add('hidden');
                accountDetailsDiv.classList.add('hidden');
                sidebar.classList.add('hidden');
            }
        });

    showRegisterBtn.addEventListener('click', () => {
        loginFormDiv.classList.add('hidden');
        registerFormDiv.classList.remove('hidden');
    });

    showLoginBtn.addEventListener('click', () => {
        registerFormDiv.classList.add('hidden');
        loginFormDiv.classList.remove('hidden');
    });

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Registration successful! Please login.');
                    // Switch to login form
                    registerFormDiv.classList.add('hidden');
                    loginFormDiv.classList.remove('hidden');
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Registration failed:', error);
                alert('Registration failed. Please try again.');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Login successful!');
                    window.location.reload();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Login failed:', error);
                alert('Login failed. Please try again.');
            }
        });
    }

    const showAddressFormBtn = document.getElementById('show-add-address-form');
    const addAddressFormDiv = document.getElementById('add-address-form-div');
    const addAddressForm = document.getElementById('add-address-form');
    const addressList = document.getElementById('address-list');

    if (showAddressFormBtn) {
        showAddressFormBtn.addEventListener('click', () => {
            addAddressFormDiv.classList.toggle('hidden');
        });
    }

    if (addAddressForm) {
        addAddressForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const address = {
                name: document.getElementById('address-name').value,
                street: document.getElementById('address-street').value,
                city: document.getElementById('address-city').value,
                zip: document.getElementById('address-zip').value,
                country: document.getElementById('address-country').value,
            };
            try {
                const response = await fetch('/api/addresses/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, address }),
                });
                if (response.ok) {
                    alert('Address added successfully!');
                    addAddressForm.reset();
                    addAddressFormDiv.classList.add('hidden');
                    loadAddresses();
                } else {
                    const data = await response.json();
                    alert(data.message);
                }
            } catch (error) {
                console.error('Failed to add address:', error);
                alert('Failed to add address. Please try again.');
            }
        });
    }

    function loadAddresses() {
        if (user) {
            fetch(`/api/addresses?userId=${user.id}`)
                .then(response => response.json())
                .then(addresses => {
                    addressList.innerHTML = '';
                    if (addresses.length > 0) {
                        addresses.forEach(address => {
                            const addressEl = document.createElement('div');
                            addressEl.className = 'bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-pastel-sage dark:border-border-dark luxury-shadow hover:border-pastel-salmon dark:hover:border-primary transition-colors group';
                            addressEl.innerHTML = `
                                <div class="flex justify-between items-start">
                                    <div class="flex items-center space-x-3">
                                        <div class="p-2 bg-pastel-mist rounded-full">
                                            <span class="material-icons-outlined text-primary group-hover:text-secondary transition-colors text-lg">${address.name.toLowerCase() === 'home' ? 'home' : 'business'}</span>
                                        </div>
                                        <h4 class="font-bold text-gray-900 dark:text-white font-display text-lg">${address.name}</h4>
                                    </div>
                                </div>
                                <p class="mt-6 text-sm text-text-sub-light dark:text-gray-300 leading-relaxed pl-12 border-l-2 border-pastel-mist">
                                    ${address.street}<br/>
                                    ${address.city}, ${address.zip}<br/>
                                    ${address.country}
                                </p>
                                <div class="mt-8 flex space-x-4 pt-4 border-t border-pastel-sage/30 dark:border-gray-700 pl-2">
                                    <button class="text-xs font-semibold text-primary hover:text-secondary transition-colors uppercase tracking-widest">Edit</button>
                                    <span class="text-pastel-sage">|</span>
                                    <button class="remove-address-btn text-xs font-semibold text-text-sub-light hover:text-pastel-salmon transition-colors uppercase tracking-widest" data-id="${address.id}">Delete</button>
                                </div>
                            `;
                            addressList.appendChild(addressEl);
                        });

                        document.querySelectorAll('.remove-address-btn').forEach(button => {
                            button.addEventListener('click', async (e) => {
                                const addressId = e.target.dataset.id;
                                try {
                                    const response = await fetch(`/api/addresses/remove/${addressId}`, { method: 'DELETE' });
                                    if (response.ok) {
                                        alert('Address removed successfully');
                                        loadAddresses();
                                    } else {
                                        const data = await response.json();
                                        alert(data.message);
                                    }
                                } catch (error) {
                                    console.error('Failed to remove address:', error);
                                    alert('Failed to remove address. Please try again.');
                                }
                            });
                        });
                    } else {
                        addressList.innerHTML = '<p class="text-center col-span-2">No saved addresses.</p>';
                    }
                });
        }
    }
    loadAddresses();
});
