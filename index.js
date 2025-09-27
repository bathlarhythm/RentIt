const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const cors = require("cors");

// Import routes
const itemsApiRoutes = require('./routes/items');       // Handles POST /items/api
const itemsPageRoutes = require('./routes/itemRoutes');  // Handles GET /items/list, /items/all
const userRoutes = require('./routes/userRoutes');
const rentalRoutes = require('./routes/rentalRoutes');

const User = require('./models/User');

const app = express();

const hbs = require('hbs');
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Custom Handlebars helper
hbs.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '===':
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/rentkro", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'hbs');

// Session middleware
app.use(session({
  secret: 'rentkro_secret',
  resave: false,
  saveUninitialized: false,
}));

// Middleware to attach user from session to req/res.locals
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
        res.locals.user = user;
      } else {
        res.locals.user = null;
      }
    } catch (err) {
      console.error('Error fetching user from session:', err);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mount routes
app.use('/users', userRoutes);
app.use('/items', itemsApiRoutes);    // POST /items/api (upload API)
app.use('/items', itemsPageRoutes);       // GET /items/list, /items/all
app.use('/rentals', rentalRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('home');
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Start server
app.listen(3000, () => {
  console.log('✅ Rent Kro running on http://localhost:3000');
});
