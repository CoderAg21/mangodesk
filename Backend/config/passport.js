const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/userModel"); // Ensure you create this file (see below)

// ALLOWABLE EMAILS
const ALLOWED_EMAILS = [
  "dhairya.gup@gmail.com", 
  "friend1@gmail.com", 
  "friend2@gmail.com",
  "admin@mangodesk.com",
  "abhayagrahari52@gmail.com"
];

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
       
        clientID: process.env.GOOGLE_CLIENT, 
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: "/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        // Extract Info
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          image: profile.photos && profile.photos[0] ? profile.photos[0].value : "",
        };

        try {
          //  SECURITY: Whitelist Check
          if (!ALLOWED_EMAILS.includes(newUser.email)) {
            console.warn(`[AUTH BLOCKED] Unauthorized login attempt: ${newUser.email}`);
            return done(null, false, { message: "Unauthorized: Email not in VIP list." });
          }

          //  Database Sync
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists, return them
            console.log(`[AUTH SUCCESS] Existing user logged in: ${user.email}`);
            return done(null, user);
          } else {
            

            user = await User.create(newUser);
            console.log(`[AUTH SUCCESS] New VIP user created: ${user.email}`);
            return done(null, user);
          }
        } catch (err) {
          console.error("[AUTH ERROR] Database error during authentication:", err);
          return done(err, null);
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