
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const products = require('./products');
const users = require('./users');
const cart = require('./cart');
const orders = require('./orders');
const addresses = require('./addresses');
const session = require('express-session');

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Configure session middleware
app.use(session({
    secret: 'your-secret-key', // In a real app, use a long, random string from an environment variable
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // In production, set to true for HTTPS
}));

// Middleware to initialize cart in session
app.use((req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    next();
});

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// API endpoint to get products
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }
        const userExists = users.find({ email: email }).value();
        if (userExists) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: users.value().length + 1, username, email, password: hashedPassword };
        users.push(newUser).write();
        res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, username: newUser.username, email: newUser.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = users.find({ email: email }).value();
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Store user in session
        req.session.user = { id: user.id, username: user.username, email: user.email };
        res.json({ message: 'Login successful', user: req.session.user });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.json({ user: null });
    }
});

app.get('/api/cart', (req, res) => {
    res.json(req.session.cart);
});

app.get('/api/cart/summary', (req, res) => {
    const subtotal = req.session.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.18;
    const shipping = 500;
    const total = subtotal + tax + shipping;
    res.json({ subtotal, tax, shipping, total });
});

app.post('/api/cart/add', (req, res) => {
    const { productId, quantity, size, color } = req.body;
    if (!productId || !quantity || !size || !color) {
        return res.status(400).json({ message: 'Product ID, quantity, size, and color are required' });
    }
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    const cartItemId = `${productId}-${size}-${color}`;

    const existingItem = req.session.cart.find(item => item.id === cartItemId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        req.session.cart.push({ id: cartItemId, product, quantity, size, color });
    }
    res.status(201).json({ message: 'Product added to cart', cart: req.session.cart });
});

app.delete('/api/cart/remove/:id', (req, res) => {
    const cartItemId = req.params.id;
    req.session.cart = req.session.cart.filter(item => item.id !== cartItemId);
    res.json({ message: 'Product removed from cart', cart: req.session.cart });
});

app.get('/api/orders', (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    const userOrders = orders.filter(order => order.userId === parseInt(userId)).value();
    res.json(userOrders);
});

app.post('/api/orders/create', (req, res) => {
    const { userId, total } = req.body;
    const items = req.session.cart;
    if (!userId || !items || !total) {
        return res.status(400).json({ message: 'User ID, items, and total are required' });
    }
    const newOrder = {
        id: orders.value().length + 1,
        userId: parseInt(userId),
        items,
        total,
        date: new Date().toISOString(),
        status: 'Delivered'
    };
    orders.push(newOrder).write();
    // Clear the cart after creating an order
    req.session.cart = [];
    res.status(201).json({ message: 'Order created successfully', order: newOrder });
});

app.get('/api/addresses', (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    const userAddresses = addresses.filter(address => address.userId === parseInt(userId)).value();
    res.json(userAddresses);
});

app.post('/api/addresses/add', (req, res) => {
    const { userId, address } = req.body;
    if (!userId || !address) {
        return res.status(400).json({ message: 'User ID and address are required' });
    }
    const newAddress = {
        id: addresses.value().length + 1,
        userId: parseInt(userId),
        ...address
    };
    addresses.push(newAddress).write();
    res.status(201).json({ message: 'Address added successfully', address: newAddress });
});

app.delete('/api/addresses/remove/:id', (req, res) => {
    const addressId = parseInt(req.params.id);
    addresses.remove({ id: addressId }).write();
    res.json({ message: 'Address removed successfully' });
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/:page', (req, res) => {
    const page = req.params.page.replace('.html', '');
    res.render(page, (err, html) => {
        if (err) {
            res.status(404).send('Page not found');
        } else {
            res.send(html);
        }
    });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
