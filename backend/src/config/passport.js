import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

import User from '../models/User.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Find or create user in MongoDB
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                // Update existing user
                user.displayName = profile.displayName;
                user.email = profile.emails?.[0]?.value;
                user.photos = profile.photos?.[0]?.value;
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails?.[0]?.value,
                    photos: profile.photos?.[0]?.value
                });
            }
            return done(null, user);
        } catch (error) {
            console.error("Passport Strategy Error:", error);
            return done(error, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id); // Serialize MongoDB _id
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) { // If ID is not valid ObjectId or not found
        console.warn("Deserialize Error (Logged out):", error.message);
        done(null, null);
    }
});

export default passport;
