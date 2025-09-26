const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const rentalRoutes = require('./routes/rentalRoutes');

const User = require('./models/User'); // Add User model to fetch user info

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

// ✅ Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rentkro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Body parsers (order matters!)
app.use(bodyParser.urlencoded({ extended: true })); // For HTML <form> submissions
app.use(express.json());                            // ✅ For AJAX/JSON submissions

// ✅ Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Set view engine
app.set('view engine', 'hbs');

// ✅ Session middleware
app.use(session({
  secret: 'rentkro_secret',
  resave: false,
  saveUninitialized: false, // Better for production
}));

// ✅ Custom middleware to attach user from session to req/res
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

// ✅ Routes
app.use('/users', userRoutes);
app.use('/items', itemRoutes);
app.use('/rentals', rentalRoutes);

// ✅ Home route
app.get('/', (req, res) => {
  res.render('home');
});

// ✅ Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});



// ✅ Start server
app.listen(3000, () => {
  console.log('✅ Rent Kro running on http://localhost:3000');
});
