const express = require('express'),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash = require("connect-flash"),
    Viewevent = require("./models/viewevent"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    session = require("express-session"),
    seedDB = require("./seeds"),
    methodOverride = require("method-override");

require('dotenv').load();

const http = express();

const commentRoutes = require("./routes/comments"),
    vieweventRoutes = require("./routes/viewevents"),
    indexRoutes = require("./routes/index")

const URL = process.env.DATABASEURL || "mongodb://ricky:ricky@ds251435.mlab.com:51435/workshop"
mongoose.connect(URL);

http.use(bodyParser.urlencoded({ extended: true }));
http.set("view engine", "ejs");
http.use(express.static(__dirname + "/public"));
http.use(methodOverride('_method'));
http.use(cookieParser('secret'));
//require moment
http.locals.moment = require('moment');
// seedDB(); //seed the database

// PASSPORT CONFIGURATION
http.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

http.use(flash());
http.use(passport.initialize());
http.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

http.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


http.use("/", indexRoutes);
http.use("/viewevents", vieweventRoutes);
http.use("/viewevents/:id/comments", commentRoutes);


http.set('view engine', 'ejs');
http.set('views', 'views');

http.use('/fonts', express.static('static/font-awesome-4.7.0/fonts'));
http.use('/static', express.static('static'));

http.get('/', (req, res) => {
    res.render('index');
});

http.get('/home', (req, res) => {
    res.render('home');
});

http.get('/events', (req, res) => {
    res.render('events');
});

http.get('/about', (req, res) => {
    res.render('about');
});

http.get('/viewevents', (req, res) => {
    res.render('viewevents');
});



const PORT = process.env.PORT || 3000
http.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
    console.log('Have Fun')
})