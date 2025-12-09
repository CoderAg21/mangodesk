const dotenv = require("dotenv");
dotenv.config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
// CHECK: Is your file named 'userModel.js' or 'User.js'? Update this line if needed.
const User = require("../models/userModel"); 

// DEFINE YOUR VIP LIST HERE
const ALLOWED_EMAILS = [
  "dhairya.gupta910@gmail.com", 
  "friend1@gmail.com", 
  "friend2@gmail.com",
  "admin@mangodesk.com",
  "abhayagrahari52@gmail.com"
];

module.exports = function (passport) {

  const strategy = new GoogleStrategy(
    {
      //  CHECK: Ensure your .env has GOOGLE_CLIENT, not GOOGLE_CLIENT_ID
      clientID: process.env.GOOGLE_CLIENT, 
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: "/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const newUser = {
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        image: profile.photos[0].value,
      };

      try {
        // SECURITY CHECK
        if (!ALLOWED_EMAILS.includes(newUser.email)) {
          console.log(`Blocked attempt by: ${newUser.email}`);
          return done(null, false, { message: "Not Authorized" }); 
        }

        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          done(null, user);
        } else {
          user = await User.create(newUser);
          done(null, user);
        }
      } catch (err) {
        console.error(err);
        done(err, null);
      }
    }
  );


  // FIX 3: Finally, tell passport to use the modified strategy
  passport.use(strategy);
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};