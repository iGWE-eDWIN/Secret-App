require('dotenv').config();
const mongoose = require('mongoose');
const validator = require('validator');
const { Schema, model } = mongoose;
const bcrypt = require('bcrypt');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
// const encrypt = require('mongoose-encryption');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const findOrCreate = require('mongoose-findorcreate');

// create new Schema
const userSchema = new Schema({
  username: {
    type: String,
    // required: true,
    unique: true,
    // validate(value) {
    //   if (!validator.isEmail(value)) {
    //     throw new Error('Email is invalid');
    //   }
    // },
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    minlength: 7,
    trim: true,
    // validate(value) {
    //   if (value.toLowerCase().includes('password')) {
    //     throw new Error(`Password can not contain 'Password'`);
    //   }
    // },
  },
  googleId: {
    type: String,
  },
  secret: {
    type: String,
  },
});

// Authenticating email and password

// setting up passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

// setting up findorcreate plugin
userSchema.plugin(findOrCreate);

// userSchema.statics.findByCredentials = async (email, password) => {
//   const user = await User.findOne({ email });
//   console.log(user);

//   if (!user) throw new Error('Unable to login');

//   const isMatch = await bcrypt.compare(password, user.password);
//   console.log(user.password);
//   console.log(isMatch);
//   if (!isMatch) throw new Error('Unable to login');

//   // console.log(user);
//   return user;
// };

// encrypting password
// const secret = process.env.SECRET;
// userSchema.plugin(encrypt, {
//   secret,
//   encryptedFields: ['password'],
// });

// Creating a hashing middleware to hash the plain text password
// userSchema.pre('save', async function (next) {
//   const user = this;

// Only hash password if it was moldified or hasn't been hashed
// if (user.isModified('password')) {
//   user.password = await bcrypt.hash(user.password, 8);
// }

//   next();
//   // console.log(user.password);
// });

// Create a collection
const User = model('User', userSchema);

passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user.id);
});
// set up googke strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRETS,
      callbackURL: 'http://localhost:3000/auth/google/secrets',
      userProfileURL: 'https://www.goggleapis.com/auth2/v3/userinfo',
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

module.exports = User;
