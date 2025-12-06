const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/userModel");

// 🔒 DEFINE YOUR VIP LIST HERE
const ALLOWED_EMAILS = [
  "dhairya@gmail.com", 
  "friend1@gmail.com", 
  "friend2@gmail.com",
  "admin@mangodesk.com"
];

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          image: profile.photos[0].value,
        };

        try {
          // 🛑 SECURITY CHECK: Is this email in our VIP list?
          if (!ALLOWED_EMAILS.includes(newUser.email)) {
            console.log(`Blocked attempt by: ${newUser.email}`);
            // Return 'false' to indicate authentication failed
            return done(null, false, { message: "Not Authorized" }); 
          }

          // If allowed, proceed as normal (Find or Create)
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
    )
  );

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