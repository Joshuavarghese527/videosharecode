var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findOne({_id: id}, function (err, user) {
    done(err, user);
  })
});

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function (username, password, done) {
    User.findOne({email: username}, function (err, user) {
      if (err) return done(err);
      if (!user) {
        return done(null, false, {
          message: 'Incorrect username or password'
        });
      }
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Incorrect username or password'
        });
      }

      return done(null, user);
    })
  }
));

passport.use(new FacebookStrategy({
    clientID: '1780561938831148',
    clientSecret: '8ff6f61e9d00ff4b8f8131d09b49925e',
    callbackURL: 'https://videocodeshare.herokuapp.com/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email']
  },
  function(token, refreshToken, profile, done) {
    User.findOne({'facebookId': profile.id}, function(err, user) {
      if (err) return done(err);

      if (user) {
        return done(null, user);
      } else {
        User.findOne({email: profile.emails[0].value}, function (err, user) {
          if (user) {
            user.facebookId = profile.id
            return user.save(function (err) {
              if (err) return done(null, false, { message: "Can't save user info"});
              return done(null, user);
            })
          }

          var user = new User();
          user.name = profile.displayName;
          user.email = profile.emails[0].value;
          user.facebookId = profile.idea
          user.save(function (err) {
            if (err) return done(null, false, { message: "Can't save user info"});
            return done(null, user);
          });
        })
      }


    });
  }
));
