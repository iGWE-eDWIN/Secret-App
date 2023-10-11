const express = require('express');
const User = require('../models/user');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const router = new express.Router();

// Initialize session
router.use(
  session({
    secret: process.env.OUR_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// initialize passport
router.use(passport.initialize());
router.use(passport.session());

// secrets route
router.get('/secrets', async (req, res) => {
  try {
    const user = await User.find({ secret: { $ne: null } });
    if (user) res.render('secrets', { userswithSecrets: user });
  } catch (error) {
    console.log(error);
  }
});
// Register Route
router.get('/register', (req, res) => {
  res.render('register');
});
// register new user
router.post('/register', async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  try {
    User.register({ username: email }, req.body.password, (error, user) => {
      if (error) {
        res.redirect('/register');
        console.log(error);
      } else {
        passport.authenticate('local')(req, res, () => {
          res.redirect('/secrets');
        });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
});

// Login user route
router.get('/login', (req, res) => {
  res.render('login');
});
// login existing user
router.post('/login', async (req, res) => {
  const email = req.body.username;
  // console.log(email);
  const password = req.body.password;
  // console.log(password);
  // try {
  //   const user = await User.findByCredentials(email, password);
  //   console.log(user);

  //   res.render('secrets');
  // } catch (error) {
  //   console.log(error);
  // }

  const user = new User({
    username: email,
    password,
  });
  req.login(user, (error) => {
    if (error) {
      console.log(error);
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secrets');
      });
    }
  });
});

// google auth route
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

// gooogle redirect route
router.get(
  '/auth/google/secrets',
  passport.authenticate('google', {
    failureRedirect: '/login',
    // successRedirect: '/secrets',
  }),
  (req, res) => {
    // successfull authenticated
    res.redirect('/secrets');
  }
);

// logout Route
router.get('/logout', (req, res) => {
  req.logout;
  res.redirect('/');
});

// submit secret route
router.get('/submit', (req, res) => {
  req.isAuthenticated() ? res.render('submit') : res.redirect('/login');
});

// submit secret
router.post('/submit', async (req, res) => {
  const submittedSecret = req.body.secret;
  // the current user lies on req.user in passport
  console.log(req.user);
  const id = req.user;
  try {
    const user = await User.findById(id);
    if (user) user.secret = submittedSecret;
    await user.save();
    res.redirect('/secrets');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
