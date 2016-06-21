var express = require('express');
var path = require('path');
var jade = require('jade');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');

var User = require('./models/account');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/passport_local_mongoose');

var app = express();


app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'views')))
app.use(express.static(path.join(__dirname, 'public')))

// requires the model with Passport-Local Mongoose plugged in 

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res){
	res.render('index', {title: 'index', username: req.user})
});

app.get('/login', function(req, res){
	res.render('login', {title: 'login', username: req.user})
});

app.post('/login', passport.authenticate('local', { successRedirect: '/',
                                                    failureRedirect: '/login' }));

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

app.get('/register', function(req, res){
	res.render('register', {title: 'register'})
});

app.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
          return res.render("register", {info: "Sorry. That username already exists. Try again."});
        }

        passport.authenticate('local')(req, res, function () {
          res.redirect('/');
        });
    });
});


app.listen(3000, function(){
	console.log('3000')
})