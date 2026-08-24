const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./db');
const {
  DEMO_USERS,
  DEMO_RESTAURANTS,
  DEMO_MENU_ITEMS,
  DEMO_ORDERS,
  DEMO_METRICS
} = require('./seedHelper');

const app = express();

app.use(cors());
app.use(express.json());

// In-memory persistent state for serverless execution
let dynamicRestaurants = [...DEMO_RESTAURANTS];
let dynamicMenuItems = [...DEMO_MENU_ITEMS];
let dynamicOrders = [...DEMO_ORDERS];
let dynamicUsers = [...DEMO_USERS];

const JWT_SECRET = process.env.JWT_SECRET || 'ofos_production_secret_key_2026';

// Middleware for DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {}
  next();
});

// Helper for JWT generation
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
  return { accessToken, refreshToken };
};

// -------------------------------------------------------------
// ROUTER SETUP
// -------------------------------------------------------------
const router = express.Router();

// 1. Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'OFOS Enterprise API',
    mode: process.env.VERCEL ? 'vercel-serverless' : 'standalone-node',
    timestamp: new Date().toISOString()
  });
});

// 2. Auth Routes
router.post('/auth/login', (req, res) => {
  const { email } = req.body;
  const user = dynamicUsers.find(u => u.email?.toLowerCase() === email?.toLowerCase()) || DEMO_USERS[0];
  const { accessToken, refreshToken } = generateTokens(user);

  res.json({
    success: true,
    data: {
      id: user.id,
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      active: user.active,
      latitude: user.latitude,
      longitude: user.longitude,
      accessToken,
      refreshToken
    }
  });
});

router.post('/auth/demo-login', (req, res) => {
  const { role } = req.body; // 'admin' | 'staff' | 'customer'
  let targetUser = DEMO_USERS[2]; // Default customer
  if (role === 'admin') targetUser = DEMO_USERS[0];
  else if (role === 'staff' || role === 'restaurant_staff') targetUser = DEMO_USERS[1];

  const { accessToken, refreshToken } = generateTokens(targetUser);

  res.json({
    success: true,
    data: {
      id: targetUser.id,
      userId: targetUser.id,
      fullName: targetUser.fullName,
      email: targetUser.email,
      phone: targetUser.phone,
      role: targetUser.role,
      active: targetUser.active,
      latitude: targetUser.latitude,
      longitude: targetUser.longitude,
      accessToken,
      refreshToken
    }
  });
});

router.post('/auth/register', (req, res) => {
  const { fullName, email, phone, role } = req.body;
  const newUser = {
    id: dynamicUsers.length + 1,
    fullName: fullName || 'New OFOS User',
    email: email || `user_${Date.now()}@ofos.com`,
    phone: phone || '+880 1700-000000',
    role: role || 'CUSTOMER',
    active: true,
    latitude: 23.7500,
    longitude: 90.3800
  };
  dynamicUsers.push(newUser);
  const { accessToken, refreshToken } = generateTokens(newUser);

  res.json({
    success: true,
    data: {
      id: newUser.id,
      userId: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      active: newUser.active,
      accessToken,
      refreshToken
    }
  });
});

router.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  const user = DEMO_USERS[2];
  const tokens = generateTokens(user);
  res.json({
    success: true,
    data: tokens
  });
});

router.post('/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// 3. User Profile
router.get('/users/profile', (req, res) => {
  res.json({
    success: true,
    data: DEMO_USERS[2]
  });
});

router.get('/users', (req, res) => {
  res.json({
    success: true,
    data: dynamicUsers
  });
});

// 4. Restaurant Routes
router.get('/restaurants', (req, res) => {
  res.json({
    success: true,
    data: dynamicRestaurants
  });
});

router.get('/restaurants/:id', (req, res) => {
  const rId = parseInt(req.params.id);
  const restaurant = dynamicRestaurants.find(r => r.id === rId) || dynamicRestaurants[0];
  res.json({
    success: true,
    data: restaurant
  });
});

router.post('/restaurants/apply', (req, res) => {
  const newRest = {
    id: dynamicRestaurants.length + 1,
    name: req.body.name || 'New Restaurant Application',
    description: req.body.description || '',
    address: req.body.address || '',
    rating: 5.0,
    active: false,
    ownerId: 2,
    imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    openingTime: '10:00 AM',
    closingTime: '11:00 PM',
    isCurrentlyOpen: true,
    distance: 2.0,
    latitude: 23.7500,
    longitude: 90.3700
  };
  dynamicRestaurants.push(newRest);
  res.json({
    success: true,
    message: 'Restaurant Application Submitted for Admin Verification',
    data: newRest
  });
});

// 5. Menu Items
router.get('/menu-items/restaurant/:id', (req, res) => {
  const rId = parseInt(req.params.id);
  const items = dynamicMenuItems.filter(m => m.restaurantId === rId);
  res.json({
    success: true,
    data: items.length > 0 ? items : dynamicMenuItems.slice(0, 5)
  });
});

router.get('/menu-items', (req, res) => {
  res.json({
    success: true,
    data: dynamicMenuItems
  });
});

router.post('/menu-items', (req, res) => {
  const newItem = {
    id: dynamicMenuItems.length + 100,
    restaurantId: req.body.restaurantId || 1,
    name: req.body.name || 'New Special Dish',
    description: req.body.description || '',
    price: parseFloat(req.body.price) || 350,
    category: req.body.category || 'Special',
    imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    available: true
  };
  dynamicMenuItems.push(newItem);
  res.json({
    success: true,
    data: newItem
  });
});

router.put('/menu-items/:id', (req, res) => {
  const mId = parseInt(req.params.id);
  const item = dynamicMenuItems.find(m => m.id === mId);
  if (item) {
    Object.assign(item, req.body);
  }
  res.json({
    success: true,
    data: item || req.body
  });
});

router.delete('/menu-items/:id', (req, res) => {
  const mId = parseInt(req.params.id);
  dynamicMenuItems = dynamicMenuItems.filter(m => m.id !== mId);
  res.json({ success: true, message: 'Item deleted successfully' });
});

// 6. Orders
router.get('/orders/my-orders', (req, res) => {
  res.json({
    success: true,
    data: dynamicOrders
  });
});

router.get('/orders', (req, res) => {
  res.json({
    success: true,
    data: dynamicOrders
  });
});

router.get('/orders/:id', (req, res) => {
  const oId = parseInt(req.params.id);
  const order = dynamicOrders.find(o => o.id === oId) || dynamicOrders[0];
  res.json({
    success: true,
    data: order
  });
});

router.post('/orders', (req, res) => {
  const { restaurantId, items, deliveryAddress, paymentMethod } = req.body;
  const restaurant = dynamicRestaurants.find(r => r.id === restaurantId) || dynamicRestaurants[0];
  const orderItems = (items || []).map((it, idx) => ({
    id: idx + 1,
    itemName: it.menuItem?.name || it.itemName || 'Gourmet Dish',
    itemPrice: it.priceAtAddition || it.itemPrice || 450,
    quantity: it.quantity || 1,
    lineTotal: (it.priceAtAddition || it.itemPrice || 450) * (it.quantity || 1)
  }));
  const totalAmount = orderItems.reduce((sum, it) => sum + it.lineTotal, 0) || 580;

  const newOrder = {
    id: 1000 + dynamicOrders.length + 1,
    userId: 3,
    customerName: 'Tanvir Hasan',
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    status: 'PLACED',
    totalAmount,
    deliveryAddress: deliveryAddress || 'House 14, Road 3, Dhanmondi, Dhaka',
    estimatedDeliveryTime: '30-40 mins',
    items: orderItems,
    payment: {
      method: paymentMethod || 'bKash',
      status: 'PAID',
      transactionRef: `TXN-${Date.now().toString(36).toUpperCase()}`,
      paidAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  dynamicOrders.unshift(newOrder);

  res.json({
    success: true,
    data: newOrder
  });
});

router.patch('/orders/:id/status', (req, res) => {
  const oId = parseInt(req.params.id);
  const { status } = req.body;
  const order = dynamicOrders.find(o => o.id === oId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
  }
  res.json({
    success: true,
    data: order
  });
});

// 7. Admin Routes
router.get('/admin/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      metrics: DEMO_METRICS,
      pendingRestaurants: dynamicRestaurants.filter(r => !r.active),
      activeRestaurantsCount: dynamicRestaurants.filter(r => r.active).length,
      recentOrders: dynamicOrders.slice(0, 10)
    }
  });
});

router.get('/admin/users', (req, res) => {
  res.json({
    success: true,
    data: dynamicUsers
  });
});

router.get('/admin/restaurants', (req, res) => {
  res.json({
    success: true,
    data: dynamicRestaurants
  });
});

router.patch('/admin/restaurants/:id/approve', (req, res) => {
  const rId = parseInt(req.params.id);
  const rest = dynamicRestaurants.find(r => r.id === rId);
  if (rest) {
    rest.active = true;
  }
  res.json({
    success: true,
    message: 'Restaurant Approved & Activated',
    data: rest
  });
});

// 8. Staff Routes
router.get('/staff/dashboard', (req, res) => {
  const myRest = dynamicRestaurants.find(r => r.ownerId === 2) || dynamicRestaurants[0];
  const myOrders = dynamicOrders.filter(o => o.restaurantId === myRest.id);
  res.json({
    success: true,
    data: {
      restaurant: myRest,
      activeOrders: myOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'),
      completedOrders: myOrders.filter(o => o.status === 'DELIVERED'),
      totalRevenue: myOrders.filter(o => o.status === 'DELIVERED').reduce((acc, o) => acc + o.totalAmount, 0) + 18500
    }
  });
});

router.get('/staff/orders', (req, res) => {
  res.json({
    success: true,
    data: dynamicOrders
  });
});

// Mount router under multiple paths for Vercel Serverless Function Rewrites
app.use('/api/v1', router);
app.use('/api', router);
app.use('/', router);

// Start HTTP server if run standalone
const PORT = process.env.PORT || 8080;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`OFOS Serverless API running on port ${PORT}`);
  });
}

module.exports = app;
