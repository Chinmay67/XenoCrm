import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {User} from '../models/index.js';
import { config } from './index.js';

passport.use(new GoogleStrategy({
  clientID: config.google_clientID,
  clientSecret: config.google_clientSecret,
  callbackURL: config.google_callbackURL,
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
      });
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

export default passport;
